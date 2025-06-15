// +page.server.js
import { supabase } from "$lib/supabaseClient";
import { fail } from '@sveltejs/kit';

export async function load() {
  const { data } = await supabase
    .from("forms")
    .select()
    .order('created_at', { ascending: false });
  return {
    forms: data ?? [],
  };
}

export const actions = {
  createForm: async ({ request }) => {
    const data = await request.formData();
    
    const formData = {
      form_type: data.get('form_type'),
      version: data.get('version'),
      assigned_date: data.get('assigned_date') || null,
      sponsor_name: data.get('sponsor_name') || null,
      sponsor_number: data.get('sponsor_number') ? parseInt(String(data.get('sponsor_number'))) : null,
      child_name: data.get('child_name') || null,
      child_number: data.get('child_number') ? parseInt(String(data.get('child_number'))) : null,
      birthday: data.get('birthday') || null,
      height: data.get('height') ? parseFloat(String(data.get('height'))) : null,
      weight: data.get('weight') ? parseFloat(String(data.get('weight'))) : null,
      health_status: data.get('health_status') || null,
      vaccine_status: data.get('vaccine_status') || null
    };

    const { data: insertData, error } = await supabase
      .from('forms')
      .insert([formData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return fail(500, { error: `Failed to create form: ${error.message}` });
    }

    return { success: true, form: insertData[0] };
  },

  deleteForm: async ({ request }) => {
  const data = await request.formData();
  const formId = data.get('form_id');

  console.log('=== DELETE FORM DEBUG ===');
  console.log('Received form_id:', formId);
  console.log('Type of form_id:', typeof formId);

  if (!formId) {
    console.log('No form_id provided');
    return fail(400, { error: 'Form ID is required' });
  }

  const formIdString = String(formId).trim();
  console.log('Cleaned form_id:', formIdString);
  console.log('Length of form_id:', formIdString.length);
  
  if (!formIdString) {
    console.log('Form ID is empty after cleaning');
    return fail(400, { error: 'Invalid Form ID' });
  }

  console.log('Attempting to delete form with ID:', formIdString);

  // First, let's check if the form exists
  const { data: existingForm, error: selectError } = await supabase
    .from('forms')
    .select('id, form_type, child_name')
    .eq('id', formIdString)
    .single();

  if (selectError) {
    console.log('Error finding form:', selectError);
    return fail(404, { error: `Form not found: ${selectError.message}` });
  }

  console.log('Found form to delete:', existingForm);

  // Now attempt the deletion
  const { data: deleteData, error: deleteError } = await supabase
    .from('forms')
    .delete()
    .eq('id', formIdString)
    .select(); // This will return the deleted row(s)

  console.log('Delete operation result:', { deleteData, deleteError });

  if (deleteError) {
    console.error('Supabase delete error:', deleteError);
    return fail(500, { error: `Failed to delete form: ${deleteError.message}` });
  }

  if (!deleteData || deleteData.length === 0) {
    console.log('No rows were deleted');
    return fail(500, { error: 'No form was deleted - ID might not exist' });
  }

  console.log('Successfully deleted:', deleteData);
  return { success: true, deleted: true, deletedId: formId };
}
};