    import type { PageLoad } from '../../manage/$types';
    import { supabase } from '$lib/db';
// Load user details for the admin manage view
    export const load: PageLoad = async ({ params }) => {
        const userId = (params as { id: string }).id;
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