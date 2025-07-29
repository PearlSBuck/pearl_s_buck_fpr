import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/db';

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { userID } = await request.json();

    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userID)
      .single();

    if (fetchError) {
      console.error('Failed to fetch user:', fetchError);
      return json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const newRole = userData.role === 'Admin' ? 'Worker' : 'Admin';

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', userID);

    if (updateError) {
      console.error('Role update error:', updateError);
      return json({ success: false, error: updateError.message }, { status: 500 });
    }

    return json({ success: true, newRole });
  } catch (err) {
    console.error('Server error during role toggle:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
