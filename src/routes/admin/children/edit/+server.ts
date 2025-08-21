import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/db';
// Update user details
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { tempChild, childID } = await request.json();

    if (!tempChild) {
      return json({ success: false, error: 'Invalid user data' }, { status: 400 });
    }

    if(!childID){
        return json({success: false, error: 'Invalid or missing user ID'}, {status: 400});
    }

    const { error } = await supabaseAdmin
    .from('children')
    .update(tempChild)
    .eq('child_id', childID)
    .single();

    if (error) {
      console.error('Deletion error:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Server error during deletion:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
