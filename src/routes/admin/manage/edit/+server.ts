import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/db';

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { tempUser, userID } = await request.json();

    if (!tempUser) {
      return json({ success: false, error: 'Invalid user data' }, { status: 400 });
    }

    if(!userID){
        return json({success: false, error: 'Invalid or missing user ID'}, {status: 400});
    }

    const { error } = await supabaseAdmin
    .from('users')
    .update({
        fullname: tempUser.fullname,
        email: tempUser.email,
        age: tempUser.age,
        residence: tempUser.residence,
        username: tempUser.username,
    })
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
