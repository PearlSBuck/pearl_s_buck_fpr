import type { PageLoad } from './$types';
import { supabase } from '$lib/db';

export const load: PageLoad = async ({ params }) => {
    const userId = params.id;
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
    }

    return { user };
};