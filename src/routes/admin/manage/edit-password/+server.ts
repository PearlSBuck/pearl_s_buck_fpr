import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/db';

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { userID, newPassword, repeatNewPassword } = await request.json();

    if (!userID || !newPassword || !repeatNewPassword) {
      return json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    if (newPassword !== repeatNewPassword) {
      return json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    // Update the user's password directly (admin privilege)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userID, {
      password: newPassword
    });

    if (updateError) {
      return json({ success: false, error: updateError.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Password update error:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
