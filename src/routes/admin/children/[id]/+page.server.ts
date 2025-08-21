import type { PageLoad } from './$types';
import { supabaseAdmin } from '$lib/db';

export const load: PageLoad = async ({ params }) => {
    const childId = Number(params.id); 

    const { data: child, error } = await supabaseAdmin
        .from('children')
        .select('*')
        .eq('child_id', childId)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
    }

    return { child };
};
