import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/db';

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { userID } = await request.json();

    if (!userID || typeof userID !== 'string') {
      return json({ success: false, error: 'Invalid or missing user ID' }, { status: 400 });
    }

    // First, get the username for the given user_id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userID)
      .single();

    if (userError || !userData) {
      return json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const username = userData.username;

    // Execute deletions in the correct order
    
    // 1. Get FPR answer IDs first
    const { data: fprAnswerIds, error: fprIdsError } = await supabaseAdmin
      .from('fpr_answers')
      .select('answer_id')
      .eq('filled_out_by', username);

    if (fprIdsError) {
      console.error('Error getting fpr_answer IDs:', fprIdsError);
      return json({ success: false, error: 'Failed to get fpr_answer IDs' }, { status: 500 });
    }

    // Delete from fpr_answers_list if there are answer IDs
    if (fprAnswerIds && fprAnswerIds.length > 0) {
      const fprIds = fprAnswerIds.map(row => row.answer_id);
      const { error: fprListError } = await supabaseAdmin
        .from('fpr_answers_list')
        .delete()
        .in('answer_id', fprIds);

      if (fprListError) {
        console.error('Error deleting fpr_answers_list:', fprListError);
        return json({ success: false, error: 'Failed to delete fpr_answers_list' }, { status: 500 });
      }
    }

    // 2. Delete from fpr_answers
    const { error: fprError } = await supabaseAdmin
      .from('fpr_answers')
      .delete()
      .eq('filled_out_by', username);

    if (fprError) {
      console.error('Error deleting fpr_answers:', fprError);
      return json({ success: false, error: 'Failed to delete fpr_answers' }, { status: 500 });
    }

    // 3. Get FIS answer IDs first
    const { data: fisAnswerIds, error: fisIdsError } = await supabaseAdmin
      .from('fis_answers')
      .select('answer_id')
      .eq('filled_out_by', username);

    if (fisIdsError) {
      console.error('Error getting fis_answer IDs:', fisIdsError);
      return json({ success: false, error: 'Failed to get fis_answer IDs' }, { status: 500 });
    }

    // Delete from fis_answers_list if there are answer IDs
    if (fisAnswerIds && fisAnswerIds.length > 0) {
      const fisIds = fisAnswerIds.map(row => row.answer_id);
      const { error: fisListError } = await supabaseAdmin
        .from('fis_answers_list')
        .delete()
        .in('answer_id', fisIds);

      if (fisListError) {
        console.error('Error deleting fis_answers_list:', fisListError);
        return json({ success: false, error: 'Failed to delete fis_answers_list' }, { status: 500 });
      }
    }

    // 4. Delete from fis_answers
    const { error: fisError } = await supabaseAdmin
      .from('fis_answers')
      .delete()
      .eq('filled_out_by', username);

    if (fisError) {
      console.error('Error deleting fis_answers:', fisError);
      return json({ success: false, error: 'Failed to delete fis_answers' }, { status: 500 });
    }

    // 5. Save username to audit_log before deleting user records
    // Note: Setting admin_id to null to avoid foreign key constraint issues
    const { error: auditInsertError } = await supabaseAdmin
      .from('audit_log')
      .insert({
        user_name: username,
        action_performed: 'user_deleted',
        user_id: userID,
        admin_id: null  // Set to null to avoid foreign key constraint
      });

    if (auditInsertError) {
      console.error('Error inserting audit log:', auditInsertError);
      // Log the full error details for debugging
      console.error('Full audit error details:', JSON.stringify(auditInsertError, null, 2));
      return json({ success: false, error: 'Failed to create audit log entry' }, { status: 500 });
    }

    // 6. Delete existing audit logs where user is referenced as user_id or admin_id
    // but preserve entries that only have the username in user_name column
    const { error: auditError } = await supabaseAdmin
      .from('audit_log')
      .delete()
      .or(`user_id.eq.${userID},admin_id.eq.${userID}`)
      .not('action_performed', 'eq', 'user_deleted'); // Don't delete the deletion record we just created

    if (auditError) {
      console.error('Error deleting audit_log:', auditError);
      return json({ success: false, error: 'Failed to delete audit logs' }, { status: 500 });
    }

    // 7. Finally delete the user
    const { error: userDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userID);

    if (userDeleteError) {
      console.error('Error deleting user:', userDeleteError);
      return json({ success: false, error: 'Failed to delete user' }, { status: 500 });
    }

    // 8. Clean up audit_log rows where user_id, admin_id and user_name are all null
    const { error: cleanupError } = await supabaseAdmin
      .from('audit_log')
      .delete()
      .is('user_id', null)
      .is('admin_id', null)
      .is('user_name', null);

    if (cleanupError) {
      console.error('Error cleaning up null audit_log entries:', cleanupError);
      // Don't fail the whole operation for cleanup errors, just log it
      console.warn('Cleanup failed but user deletion was successful');
    }

    return json({ success: true });
  } catch (err) {
    console.error('Server error during deletion:', err);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
