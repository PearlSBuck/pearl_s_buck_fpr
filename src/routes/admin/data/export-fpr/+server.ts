import { json } from "@sveltejs/kit";
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import { supabaseAdmin } from "$lib/db";
import type { RequestHandler } from '@sveltejs/kit';
import { 
    fetchFPRRecords, 
    fetchFPRAnswers, 
    fetchFormSections 
} from '../export-utils/query-helpers';

import { 
    organizeAnswersBySection, 
    cleanRecordData 
} from '../export-utils/data-formatters';

import type { 
    SectionWithFields, 
    Record as FPRRecord, 
    ExportRequestBody 
} from '../export-utils/types';

interface FormField {
    id: string;
    label: string;
    type: string;
    sectionid: string;
}

export const POST: RequestHandler = async ({ request }) => {
    const { ids, format = 'csv' } = await request.json() as ExportRequestBody;

    if (!Array.isArray(ids) || ids.length === 0) {
        return json({ error: "No IDs provided" }, { status: 400 });
    }

    try {
        // Get the FPR records
        const { data, error } = await supabaseAdmin
        .from("fpr_answers")
        .select(`
            *,
            forms:form_id (
            id,
            title,
            version
            )
        `)
        .in("answer_id", ids);

        if (error) {
        return json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
        return json({ error: "No records found" }, { status: 404 });
        }

        // For CSV/XLSX exports
        if (format === 'csv' || format === 'xlsx') {
            // Process each record individually rather than merging them
            const processedRecords = [];
            
            for (const record of data) {
                // Fetch child name from fis_answers if not already present
                if (!record.sc_name || record.sc_name.trim() === '') {
                    const { data: fisRecord } = await supabaseAdmin
                        .from("fis_answers")
                        .select("sc_name")
                        .eq("sc_id", record.sc_id)
                        .single();
                    
                    if (fisRecord && fisRecord.sc_name) {
                        record.sc_name = fisRecord.sc_name;
                    }
                }
                
                const answers = await fetchFPRAnswers(record.answer_id);
                const sections = await fetchFormSections(record.form_id);
                
                // Transform answers to match expected format
                const transformedAnswers = answers.map(answer => ({
                    ...answer,
                    form_fields: Array.isArray(answer.form_fields) ? answer.form_fields[0] : answer.form_fields
                }));

                // Organize answers by section
                const organizedSections = organizeAnswersBySection(record, sections, transformedAnswers);
                
                // Create a record object with metadata
                const recordData = {
                    metadata: {
                        'Child ID': record.sc_id,
                        'Child Name': record.sc_name || `Child ID: ${record.sc_id}`,
                        'Created Date': new Date(record.created_at).toLocaleDateString(),
                        'Form Version': record.forms?.version || 'N/A',
                        'Filled Out By': record.filled_out_by || 'Unknown'
                    },
                    sections: [] as any[]
                };
                
                // Add each section with its questions and answers
                organizedSections.forEach(section => {
                    const sectionData = {
                        title: section.title,
                        questions: section.fields.map(field => ({
                            question: field.label,
                            answer: field.answer
                        }))
                    };
                    recordData.sections.push(sectionData);
                });
                
                processedRecords.push(recordData);
            }
            
            return json(processedRecords);
        }

        // For PDF export, process each record
        if (format === 'pdf') {
        // Get the answers for each record and organize by section
        const allAnswers: Array<{record: any, answers: SectionWithFields[]}> = [];
        
        for (const record of data) {
            // Ensure child name is present
            if (!record.sc_name || record.sc_name.trim() === '') {
                const { data: fisRecord } = await supabaseAdmin
                .from("fis_answers")
                .select("sc_name")
                .eq("sc_id", record.sc_id)
                .single();
                
                if (fisRecord && fisRecord.sc_name) {
                    record.sc_name = fisRecord.sc_name;
                } else {
                    // Fallback if name not found in fis_answers
                    record.sc_name = `Child ID: ${record.sc_id}`;
                }
            }
            
            // Get all answers for this record
            const { data: answers, error: answersError } = await supabaseAdmin
            .from("fpr_answers_list")
            .select(`
                answer,
                question_id,
                form_fields:question_id (
                id,
                label,
                type,
                sectionid
                )
            `)
            .eq("answer_id", record.answer_id);

            if (answersError) {
            throw new Error(answersError.message);
            }

            // Get sections for this form
            const { data: sections, error: sectionsError } = await supabaseAdmin
            .from("form_sections")
            .select(`
                id,
                title,
                orderindex
            `)
            .eq("formid", record.form_id)
            .order("orderindex", { ascending: true });

            if (sectionsError) {
            throw new Error(sectionsError.message);
            }

            // Organize answers by section
            const organizedAnswers = sections.map(section => {
            return {
                ...section,
                fields: answers
                .filter(a => {
                    // Get the form_fields object and check sectionid
                    const formFields = a.form_fields as unknown as FormField;
                    return formFields?.sectionid === section.id;
                })
                .map(a => {
                    // Get the form_fields object and extract label
                    const formFields = a.form_fields as unknown as FormField;
                    return {
                    label: formFields?.label || 'Unknown Field',
                    answer: a.answer || 'Not provided'
                    };
                })
            };
            });

            allAnswers.push({
            record,
            answers: organizedAnswers
            });
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });
        
        // Prepare custom filename
        let filename = 'fpr_record.pdf';
        
        if (allAnswers.length === 1) {
            const record = allAnswers[0].record;
            const cleanName = record.sc_name?.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') || 'unnamed';
            filename = `${record.sc_id}_${cleanName}.pdf`;
        }
        
        // Create a promise to handle PDF completion
        const pdfPromise = new Promise<Buffer>((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
        });
        
        // Generate PDF content
        allAnswers.forEach((item, index) => {
            const { record, answers } = item;
            
            if (index > 0) {
            doc.addPage();
            }
            
            // Add header
            doc.fontSize(20).text('Family Progress Report', { align: 'center' });
            doc.moveDown();
            
            // Add record metadata
            doc.fontSize(14).text('Child Information', { underline: true });
            doc.fontSize(12).text(`Name: ${record.sc_name || 'Not provided'}`);
            doc.text(`ID: ${record.sc_id || 'Not provided'}`);
            doc.text(`Form Version: ${record.forms?.version || '1.0'}`);
            doc.text(`Created: ${new Date(record.created_at).toLocaleDateString()}`);
            doc.moveDown();
            
            // Add form sections and answers
            answers.forEach(section => {
            doc.fontSize(14).text(section.title, { underline: true });
            doc.moveDown(0.5);
            
            section.fields.forEach(field => {
                doc.fontSize(10);
                doc.font('Helvetica-Bold').text(`${field.label}:`, { continued: true });
                doc.font('Helvetica').text(` ${field.answer}`);
            });
            
            doc.moveDown();
            });
        });
        
        // Finalize the PDF document
        doc.end();
        
        // Wait for the PDF to be fully generated
        const pdfBuffer = await pdfPromise;
        
        // Return the PDF as a Response
        return new Response(pdfBuffer, {
            headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
        }

        return json({ error: "Invalid format specified" }, { status: 400 });
    } catch (error: any) {
        console.error('Export error:', error);
        return json({ 
        error: error.message || 'An unknown error occurred' 
        }, { status: 500 });
    }
}