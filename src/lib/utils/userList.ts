import { supabaseAdmin } from '../db';

export async function getUserList() {
    const { data, error } = await supabaseAdmin
        .from("users")
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        return {
            users: [],
            error: error.message
        };
    }

    return {
        users: data,
        error: null
    };
}
