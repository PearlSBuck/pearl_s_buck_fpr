import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/db';

export const load = (async ({ params }) => {
    const childId = params.child;
    
    if (!childId) {
        throw error(404, 'Child ID not provided');
    }
    
    // TODO: Implement data fetching from Supabase
    // This will query the fis_answers and fis_answers_list tables
    
    // For now, return just the ID
    return {
        childId
    };
}) satisfies PageServerLoad;