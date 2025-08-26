import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/db';

export const load = (async ({ locals }) => {
    // Check if user is authenticated
    const session = await locals.supabase.auth.getSession();

    if (!session.data.session) {
        throw redirect(303, '/login');
    }

    try {
        // Fetch forms data
        const { data: forms, error } = await supabaseAdmin
            .from('forms')
            .select('*')
            .order('createdat', { ascending: false });

        // Fetch children data
        const { data: children, error: childrenError } = await supabaseAdmin
            .from('children')
            .select('child_id, child_name, birthday, gender')
            .order('child_name', { ascending: true });

        console.log('Server: Fetched children for FPR:', children?.length);
        
        if (childrenError) {
            console.error('Error fetching children:', childrenError);
        }

        return {
            user: session.data.session.user,
            forms: forms || [],
            children: children || [],
            error
        };
    } catch (err) {
        console.error('Error in load function:', err);
        return {
            user: session.data.session.user,
            forms: [],
            children: [],
            error: err
        };
    }
}) satisfies PageServerLoad;
