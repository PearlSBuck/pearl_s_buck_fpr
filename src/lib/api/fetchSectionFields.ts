import { supabase } from '$lib/supabaseClient';

export async function fetchSections(formName: string){
  const { data: form, error: formIdError } = await supabase
    .from('Forms')
    .select('id')
    .eq('title', formName)
    .eq('createdAt', '2025-06-17 15:52:37')
    .single();

  if (formIdError || !form) {
    throw new Error(formIdError?.message || 'Form not found');
  }

  const { data: rows, error: rowsError } = await supabase
    .from('FormSection')
    .select('*')
    .eq('formId', form.id);

  if (rowsError) {
    throw new Error(rowsError.message);
  }
  console.log(rows);
  return rows;
}

export async function fetchSectionFields(sectionName: string) {
  // Step 1: Get the section ID from the section name
  const { data: section, error: sectionIdError } = await supabase
    .from('FormSection')
    .select('id')
    .eq('title', sectionName)
    .single();

  if (sectionIdError || !section) {
    throw new Error(sectionIdError?.message || 'Section not found');
  }

  // Step 2: Fetch form fields with the matching section ID
  const { data: rows, error: rowsError } = await supabase
    .from('FormFields')
    .select('*')
    .eq('sectionId', section.id);

  if (rowsError) {
    throw new Error(rowsError.message);
  }

  return rows;
}
