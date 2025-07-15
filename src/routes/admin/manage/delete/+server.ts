import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/db';

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { userID } = await request.json();

    if (!userID || typeof userID !== 'string') {
      return json({ success: false, error: 'Invalid or missing user ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userID);    

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
