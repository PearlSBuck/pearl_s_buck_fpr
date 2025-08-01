import { supabaseAdmin} from '$lib/db';
// Function to fetch users list
export async function getUsersList(){
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching users list:', error);
        return { status: 500, error: 'Failed to load users list' };
    }
    
    return {
        data
    };
}