import { supabase } from '$lib/supabaseClient';

export async function fetchSections(formName: string, date: string){
  const { data: form, error: formIdError } = await supabase
    .from('forms')
    .select('id')
    .eq('title', formName)
    .eq('createdat', date)
    .single();

  if (formIdError || !form) {
    throw new Error(formIdError?.message || 'Form not found');
  }

  const { data: rows, error: rowsError } = await supabase
    .from('form_section')
    .select('*')
    .eq('formid', form.id)
    .order('orderindex', { ascending: true });

  if (rowsError) {
    throw new Error(rowsError.message);
  }
  console.log(rows);
  return rows;
}

export async function fetchSectionFields(sectionName: string) {
  // Get exactly one matching section by title
  const { data: section, error: sectionIdError } = await supabase
    .from('form_section')
    .select('id')
    .eq('title', sectionName)
    .maybeSingle(); // safer than .single()

  if (sectionIdError || !section) {
    throw new Error(sectionIdError?.message || `Section not found or ambiguous: "${sectionName}"`);
  }

  // Get all fields for the section
  const { data: rows, error: rowsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('sectionid', section.id)
    .order('orderindex', { ascending: true });


  if (rowsError) {
    throw new Error(rowsError.message);
  }

  return rows;
}

