// recordQuery.ts
import { supabaseAdmin } from "$lib/db";

export async function getPaginatedSCRecords(page: number, query: string = "") {
  const pageSize = 5;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabaseAdmin
    .from("fis_answers")
    .select("*", { count: "exact" })
    .range(from, to);

  if (query.trim()) {
    request = request.ilike("sc_name", `%${query}%`);
  }

  const { data, count, error } = await request;

  if (error) throw new Error(error.message);

  return {
    records: data ?? [],
    totalPages: Math.ceil((count ?? 0) / pageSize),
    currentPage: page,
  };
}

export async function deleteSCRecords(ids: number[]) {
  const { error } = await supabaseAdmin
    .from("fis_answers")
    .delete()
    .in("sc_id", ids); // use .in() for multiple values

  if (error) throw new Error(error.message);
}


// Get a specific FIS record by ID
export async function getFISRecord(id: number) {
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
    .eq("sc_id", id)
    .single();

  if (error) throw new Error(error.message);
  
  return data;
}

// Get all answers for a specific FIS record
export async function getFISAnswers(answerId: string) {
  const { data, error } = await supabaseAdmin
    .from("fis_answers_list")
    .select(`
      answer,
      question_id,
      form_fields:question_id (
        id,
        label,
        type,
        sectionid,
        orderindex,
        options
      )
    `)
    .eq("answer_id", answerId);

  if (error) throw new Error(error.message);
  
  return data;
}

// Get form structure (sections) for a specific form
export async function getFormStructure(formId: string) {
  const { data: sections, error: sectionsError } = await supabaseAdmin
    .from("form_sections")
    .select(`
      id,
      title,
      orderindex,
      form_fields:id (
        id,
        label,
        type,
        orderindex,
        options
      )
    `)
    .eq("formid", formId)
    .order("orderindex", { ascending: true });

  if (sectionsError) throw new Error(sectionsError.message);
  
  // For each section, sort its fields by orderindex
  return sections.map(section => ({
    ...section,
    form_fields: section.form_fields.sort(
      (a, b) => a.orderindex - b.orderindex
    )
  }));
}

// Get FPR records for a specific child ID (showing all years)
export async function getFPRRecordsByChildId(id: number) {
  const { data, error } = await supabaseAdmin
    .from("fpr_answers")
    .select(`
      answer_id,
      created_at,
      form_id,
      forms:form_id (
        id,
        title,
        version
      ),
      sc_id,
      filled_out_by
    `)
    .eq("sc_id", id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  
  return data;
}

// Get a specific FPR record by answer_id 
export async function getFPRRecord(answerId: string) {
  const { data: fprRecord, error } = await supabaseAdmin
    .from("fpr_answers")
    .select(`
      *,
      forms:form_id (
        id,
        title,
        version
      )
    `)
    .eq("answer_id", answerId)
    .single();

  if (error) throw new Error(error.message);
  
  // Now fetch the child's name from FIS answers using sc_id
  if (fprRecord) {
    const { data: fisRecord } = await supabaseAdmin
      .from("fis_answers")
      .select("sc_name")
      .eq("sc_id", fprRecord.sc_id)
      .single();
    
    // Add the name to our FPR record object
    if (fisRecord) {
      fprRecord.sc_name = fisRecord.sc_name;
    } else {
      // Fallback if no FIS record exists
      fprRecord.sc_name = `Child #${fprRecord.sc_id}`;
    }
  }
  
  return fprRecord;
}

// Get all answers for a specific FPR record
export async function getFPRAnswers(answerId: string) {
  const { data, error } = await supabaseAdmin
    .from("fpr_answers_list")
    .select(`
      answer,
      question_id,
      form_fields:question_id (
        id,
        label,
        type,
        sectionid,
        orderindex,
        options
      )
    `)
    .eq("answer_id", answerId);

  if (error) throw new Error(error.message);
  
  return data;
}