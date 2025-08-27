import { json } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/db";
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

// Define types for our data structures
interface FormField {
  id: string;
  label: string;
  type: string;
  sectionid: string;
}

// Adjust Answer interface to reflect what Supabase actually returns
interface Answer {
  answer: string;
  question_id: string;
  form_fields: any; // Use any for now to handle Supabase's response structure
}
// Define the structure of the section with fields
interface Section {
  id: string;
  title: string;
  orderindex: number;
}
// Define the structure of the section with fields and answers
interface SectionWithFields extends Section {
  fields: Array<{
    label: string;
    answer: string;
  }>;
}
// Define the structure of the record returned from Supabase
interface Record {
  sc_id: string;
  sc_name: string;
  answer_id: string;
  form_id: string;
  created_at: string;
  forms: {
    id: string;
    title: string;
    version: string;
  };
}
// Endpoint to export FIS records
export async function POST({ request }) {
  const { ids, format = 'csv' } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return json({ error: "No IDs provided" }, { status: 400 });
  }

  // Get the FIS records
  const { data, error } = await supabaseAdmin
    .from("fis_answers")
    .select(`
      *,
      forms:form_id (
        id,
        title,
        version
      )
    `)
    .in("sc_id", ids);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  // Get the answers for each record
  const allAnswers: Array<{record: Record, answers: SectionWithFields[]}> = [];
  for (const record of data) {
    const { data: answers, error: answersError } = await supabaseAdmin
      .from("fis_answers_list")
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
      return json({ error: answersError.message }, { status: 500 });
    }

    // Get the form sections to organize data
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
      return json({ error: sectionsError.message }, { status: 500 });
    }

    // Organize answers by section with proper type handling
    const organizedAnswers: SectionWithFields[] = sections.map((section: Section) => {
      return {
        ...section,
        fields: answers
          .filter((a: Answer) => {
            // Get the form_fields object and check sectionid
            const formFields = a.form_fields as unknown as FormField;
            return formFields?.sectionid === section.id;
          })
          .map((a: Answer) => {
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

  // Return CSV data
  if (format === 'csv') {
    return json(data);
  }

  // Generate PDF
  if (format === 'pdf') {
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Create buffers array to collect PDF data chunks
    const chunks: Buffer[] = [];
    
    // Listen for data events
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    // Prepare custom filename
    let filename = 'fis_record.pdf';
    
    // If there's only one record, use its ID and name for the filename
    if (allAnswers.length === 1) {
      const record = allAnswers[0].record;
      const cleanName = record.sc_name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
      filename = `${record.sc_id}_${cleanName}.pdf`;
    }
    
    // Create a promise to handle PDF completion
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      // Listen for end event to resolve the promise
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      // Listen for error event
      doc.on('error', (err) => {
        reject(err);
      });
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
    
    // Return the PDF as a Response with the custom filename
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  }

  return json({ error: "Invalid format specified" }, { status: 400 });
}
