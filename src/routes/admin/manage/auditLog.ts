import { supabaseAdmin} from '$lib/db';
// Function to fetch audit log data
export async function getAuditLog() {

    const { data, error } = await supabaseAdmin
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false });
        
        if (error) {
        console.error('Error fetching server data:', error);
        return { status: 500, error: 'Failed to load server data' };
    }

    return {
        data
    };
}
// Function to fetch user details by ID
export async function getUserByID(userId: string): Promise<string> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error('Error fetching user by ID:', error);
    }

    return data?.username ?? "Unknown user";
}