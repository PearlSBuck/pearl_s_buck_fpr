import { supabase } from "$lib/db";
import { fail } from '@sveltejs/kit';

export async function load() {
    // Using correct table name "forms" and mapping columns
    const { data, error } = await supabase
        .from("forms")
        .select('*')
        .order('createdat', { ascending: false });

    if (error) {
        console.error('Error fetching forms:', error);
        console.error('Error details:', error.message);
        console.error('Error hint:', error.hint);
        return {
            forms: [],
            error: error.message
        };
    }

    console.log('Server: Fetched forms count:', data?.length || 0);
    console.log('Server: First form structure:', data?.[0] || 'No forms');

    // Map database columns to camelCase for frontend
    const mappedForms = data?.map(form => ({
        ...form,
        createdAt: form.createdat, // Map createdat to createdAt
        version: form.version, // Include version column
        // Add other mappings if needed
    })) ?? [];

    console.log('Server: Mapped forms:', mappedForms[0]);

    return {
        forms: mappedForms,
    };
}

// Optional: Add actions for form operations
export const actions = {
    delete: async ({ request }) => {
        const data = await request.formData();
        const formId = data.get('formId');

        const { error } = await supabase
            .from('forms')
            .delete()
            .eq('id', formId);

        if (error) {
            return fail(500, { message: 'Failed to delete form' });
        }

        return { success: true };
    }
};
