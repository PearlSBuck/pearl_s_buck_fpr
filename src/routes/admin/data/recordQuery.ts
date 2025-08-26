// recordQuery.ts
import { supabaseAdmin } from "$lib/db";

export async function getPaginatedSCRecords(page: number, query: string = "") {
  const pageSize = 5;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabaseAdmin
    .from("fis_answers")
    .select(`
      child_id,
      children:child_id (
        child_id,
        child_name
      )
    `, { count: "exact" })
    .range(from, to);

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
    .in("child_id", ids); // use .in() for multiple values

  if (error) throw new Error(error.message);
}


// Get a specific FIS record by ID
export async function getFISRecord(id: number) {
  const { data, error } = await supabaseAdmin
    .from("fis_answers")
    .select(`
      *,
      children:child_id(
        child_id,
        child_name
      )
      forms:form_id (
        id,
        title,
        version
      )
    `)
    .eq("child_id", id)
    .single();

  if (error) {
    // Check if this is a "no rows returned" error
    if (error.code === 'PGRST116') {
      throw { code: 'PGRST116', message: `No record found for child ID ${id}` };
    }
    throw new Error(error.message);
  }
  
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
    .eq("child_id", id)
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
      ),
      children:child_id (
        child_id,
        child_name
      )
    `)
    .eq("answer_id", answerId)
    .single();

  if (error) throw new Error(error.message);
  
  if (fprRecord) {
    const { data: childRecord } = await supabaseAdmin
      .from("children")
      .select("child_name")
      .eq("child_id", fprRecord.child_id)
      .single();
    
    // Add the name to our FPR record object
    if (childRecord) {
      fprRecord.children.child_name = childRecord.child_name;
    } else {
      // Fallback if no FIS record exists
      fprRecord.children.child_name = `Child #${fprRecord.child_id}`;
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
    ),
    fpr_answers!inner (
      child_id,
      children:child_id (
        child_name,
        child_id
      )
    )
  `)
  .eq("answer_id", answerId);

  if (error) throw new Error(error.message);
  
  return data;
}