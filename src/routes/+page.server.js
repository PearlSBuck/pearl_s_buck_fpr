// +page.server.js
import { supabase } from "$lib/supabaseClient";
import { fail } from '@sveltejs/kit';

export async function load() {
    // Using correct table name "Forms" and camelCase columns
    const { data, error } = await supabase
        .from("Forms")
        .select('*')
        .order('createdAt', { ascending: false });

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
    
    return {
        forms: data ?? [],
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
