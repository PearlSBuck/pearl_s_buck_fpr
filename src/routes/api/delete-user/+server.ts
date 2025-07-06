import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

export async function POST({ request }) {
    const { userID } = await request.json();
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Missing Supabase credentials');
        return json({ 
            success: false, 
            error: 'Server configuration error' 
        }, { status: 500 });
    }
    
    const supabaseAdmin = createClient(
        supabaseUrl,
        serviceRoleKey
    );
    
    // Delete user from auth.users (this will cascade delete from public.users)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userID);
    
    if (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
    
    return json({ success: true });
}