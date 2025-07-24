import { json } from "@sveltejs/kit";
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import type { RequestHandler } from './$types';
import { 
    fetchFISRecords, 
    fetchFISAnswers, 
    fetchFormSections 
} from '../export-utils/query-helpers';

import { 
    organizeAnswersBySection, 
    cleanRecordData 
} from '../export-utils/data-formatters';

import type { 
    SectionWithFields, 
    Record, 
    ExportRequestBody 
} from '../export-utils/types';

export const POST: RequestHandler = async ({ request }) => {
    const { ids, format = 'csv' } = await request.json() as ExportRequestBody;

    if (!Array.isArray(ids) || ids.length === 0) {
        return json({ error: "No IDs provided" }, { status: 400 });
    }

    try {
        // Get the FIS records
        const records = await fetchFISRecords(ids);
        
        if (!records || records.length === 0) {
            return json({ error: "No records found" }, { status: 404 });
        }

        // For CSV/XLSX exports, prepare data to return as JSON
        if (format === 'csv' || format === 'xlsx') {
            return json(records);
        }

    // For PDF export, process each record
        if (format === 'pdf') {
            // Get the answers for each record and organize by section
            const allAnswers: Array<{record: Record, answers: SectionWithFields[]}> = [];
            
            for (const record of records) {
                const answers = await fetchFISAnswers(record.answer_id);
                const sections = await fetchFormSections(record.form_id);

                // Transform answers to match the expected format
                const transformedAnswers = answers.map(answer => ({
                    ...answer,
                    form_fields: Array.isArray(answer.form_fields) ? answer.form_fields[0] : answer.form_fields
                }));

                const organizedAnswers = organizeAnswersBySection(record, sections, transformedAnswers);
                
                allAnswers.push({
                record,
                answers: organizedAnswers
                });
            }

            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];
            
            doc.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
            
            // Prepare custom filename
            let filename = 'fis_record.pdf';
            
            if (allAnswers.length === 1) {
                const record = allAnswers[0].record;
                const cleanName = record.sc_name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
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
                doc.fontSize(20).text('Family Introduction Sheet', { align: 'center' });
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
    } catch (error) {
        console.error('Export error:', error);
        return json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
        }, { status: 500 });
    }
};