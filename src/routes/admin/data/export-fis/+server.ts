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
    Record as FISRecord, 
    ExportRequestBody 
} from '../export-utils/types';

// Update the POST handler to accept signature data
export const POST: RequestHandler = async ({ request }) => {
    const { ids, format = 'csv', signature, signerName } = await request.json() as ExportRequestBody & { 
        signature?: string;
        signerName?: string;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
        return json({ error: "No IDs provided" }, { status: 400 });
    }

    try {
        // Get the FIS records
        const records = await fetchFISRecords(ids);
        
        if (!records || records.length === 0) {
            return json({ error: "No records found" }, { status: 404 });
        }

        // For CSV/XLSX exports
        if (format === 'csv' || format === 'xlsx') {
            // Process each record individually rather than merging them
            const processedRecords = [];
            
            for (const record of records) {
                const answers = await fetchFISAnswers(record.answer_id);
                const sections = await fetchFormSections(record.form_id);
                
                // Transform answers to match expected format
                const transformedAnswers = answers.map((answer: { form_fields: any }) => ({
                    ...answer,
                    form_fields: Array.isArray(answer.form_fields) ? answer.form_fields[0] : answer.form_fields
                }));

                // Organize answers by section
                const organizedSections = organizeAnswersBySection(record, sections, transformedAnswers);
                
                // Create a record object with metadata
                const recordData = {
                    metadata: {
                        'Child ID': record.child_id,
                        'Child Name': record.children?.child_name,
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
            
            // Format for the specified export type
            if (format === 'csv') {
                const csvData = processedRecords.map(record => {
                    // Create a flattened CSV-friendly structure for each record
                    // Fix the type error for 'Child ID'
                    const flatRecord: Record<string, string> = {
                        'Child ID': String(record.metadata['Child ID']), // Convert to string
                        'Child Name': record.metadata['Child Name'],
                        'Created Date': record.metadata['Created Date'],
                        'Form Version': record.metadata['Form Version'],
                        'Filled Out By': record.metadata['Filled Out By']
                    };
                    
                    // Add each question-answer as a separate row
                    let sectionIndex = 1;
                    record.sections.forEach(section => {
                        // flatRecord[`Section ${sectionIndex}`] = section.title;
                        section.questions.forEach((qa: { question: string, answer: string }, i: number) => {
                            flatRecord[`Question${i+1}`] = qa.question;
                            flatRecord[`Answer${i+1}`] = qa.answer;
                        });
                        sectionIndex++;
                    });
                    
                    return flatRecord;
                });
                
                return json(csvData);
            } else {
                // For XLSX, we can use the same structure
                return json(processedRecords);
            }
        }

    // For PDF export, process each record
        if (format === 'pdf') {
            // Get the answers for each record and organize by section
            const allAnswers: Array<{record: FISRecord, answers: SectionWithFields[]}> = [];
            
            for (const record of records) {
                const answers = await fetchFISAnswers(record.answer_id);
                const sections = await fetchFormSections(record.form_id);

                // Transform answers to match the expected format
                const transformedAnswers = answers.map((answer: { form_fields: any }) => ({
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
                const cleanName = record.children.child_name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
                filename = `${record.child_id}_${cleanName}.pdf`;
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
                
                // Add logo and foundation name on the same line
                try {
                    // Calculate positions for alignment
                    const pageWidth = doc.page.width - 100; // Account for margins
                    const logoWidth = 50; // Slightly smaller logo
                    const logoHeight = 50;
                    const textStartX = 150; // Position where text starts
                    
                    // Add logo on the left side
                    doc.image('static/logo.jpg', 50, doc.y, {
                        fit: [logoWidth, logoHeight]
                    });
                    
                    // Save the current Y position
                    const currentY = doc.y;
                    
                    // Add foundation name at a fixed position to the right of the logo
                    doc.fontSize(16)
                        .fillColor('#0070C0')
                        .font('Times-Roman')  // Set font to Times New Roman
                        .text('Pearl S. Buck Foundation — Philippines, Inc.', 
                                textStartX, currentY + 20, { 
                                    align: 'left',
                                    width: pageWidth - textStartX
                                });
                    
                    // Move down after both elements
                    doc.moveDown(2);
                    
                    // Reset color to black for the rest of the document
                    doc.fillColor('#000000');
                    
                    // Reset the text position to the left margin - THIS IS THE FIX
                    doc.text('', 50, doc.y);
                    
                } catch (err) {
                    console.error('Error adding logo to PDF:', err);
                    
                    // Fallback to just the text if image fails
                    doc.fontSize(16)
                       .fillColor('#0070C0')
                       .text('Pearl S. Buck Foundation — Philippines, Inc.', { 
                            align: 'center'
                       });
                    doc.moveDown(0.5);
                    doc.fillColor('#000000');
                }
                
                // Add header
                doc.fontSize(16).text('Family Introduction Sheet', { align: 'center' });
                doc.moveDown();
                
                // Add record metadata
                doc.fontSize(14).text('Child Information', { underline: true });
                doc.fontSize(12).text(`Name: ${record.children.child_name || 'Not provided'}`);
                doc.text(`ID: ${record.child_id || 'Not provided'}`);
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
                
                // Add signature if provided
                if (signature) {
                    doc.moveDown();
                    doc.fontSize(12).text('Signature', { underline: false, align: 'left' });
                    doc.moveDown(0.5);
                    
                    // Add the signature image - aligned to left instead of center
                    try {
                        // Extract the base64 data (remove the data:image/png;base64, prefix)
                        const imageData = signature.split(',')[1];
                        const imgBuffer = Buffer.from(imageData, 'base64');
                        
                        // Add the signature image to the PDF - aligned left
                        doc.image(imgBuffer, {
                            fit: [150, 100]
                            // 'left' alignment is the default, so we don't need to specify it
                        });
                        // Add signer name if provided - aligned left
                        if (signerName) {
                            doc.moveDown(0.5);
                            doc.fontSize(10).text(signerName, { align: 'left' }); // Changed from 'center' to 'left'
                        }
                        
                        // Add date - aligned left
                        doc.moveDown(0.5);
                        doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' }); // Changed from 'center' to 'left'
                    } catch (err) {
                        console.error('Error adding signature to PDF:', err);
                        doc.text('Signature could not be displayed', { align: 'left' });
                    }
                }
            });
            
            // Finalize the PDF document
            doc.end();
            
            // Wait for the PDF to be fully generated
            const pdfBuffer = await pdfPromise;
            
            // Return the PDF as a Response
            return new Response(new Uint8Array(pdfBuffer), {
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