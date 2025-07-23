import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/db';
import type { RequestHandler } from './$types';

// Add logging to debug
console.log('API endpoint registered for FPR at /api/fpr/[id]/[answerId]');

export const PATCH: RequestHandler = async ({ params, request }) => {
    console.log('PATCH request received for FPR with params:', params);

    const childId = parseInt(params.id);
    const answerId = params.answerId;
    
    if (!childId || isNaN(childId) || !answerId) {
        return json({ error: 'Invalid parameters' }, { status: 400 });
    }
    
    try {
        const { answers } = await request.json() as { 
            answers: Record<string, string | string[]> 
        };
        
        if (!answers) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        console.log('Looking for FPR record with sc_id:', childId, 'and answer_id:', answerId);
        
        // Get existing FPR record to verify it exists
        const { data: existingRecord, error: recordError } = await supabaseAdmin
            .from('fpr_answers')
            .select('*')
            .eq('sc_id', childId)
            .eq('answer_id', answerId)
            .single();
            
        if (recordError) {
            console.error('Record lookup error:', recordError);
            return json({ error: 'Record not found', details: recordError.message }, { status: 404 });
        }
        
        if (!existingRecord) {
            console.error('No record found for sc_id:', childId, 'and answer_id:', answerId);
            return json({ error: 'Record not found' }, { status: 404 });
        }
        
        console.log('Found FPR record:', existingRecord);
        console.log('Updating with answers:', Object.keys(answers).length);
        
        // Track successful updates
        let successCount = 0;
        
        // Update each answer one by one with immediate verification
        for (const [questionId, answer] of Object.entries(answers)) {
            console.log(`Processing question_id: ${questionId} with answer:`, answer);
            
            // Format answer for storage - convert arrays to JSON strings
            const formattedAnswer = Array.isArray(answer) ? JSON.stringify(answer) : answer;
            
            // First check if the row exists
            const { data: existingAnswer, error: checkError } = await supabaseAdmin
                .from('fpr_answers_list')
                .select('*')
                .eq('answer_id', answerId)
                .eq('question_id', questionId)
                .single();
            
            if (checkError || !existingAnswer) {
                console.log(`No existing answer found for question ${questionId}, creating new row`);
                
                // Row doesn't exist, so INSERT instead of UPDATE
                const { data: insertData, error: insertError } = await supabaseAdmin
                    .from('fpr_answers_list')
                    .insert({
                        answer_id: answerId,
                        question_id: questionId,
                        answer: formattedAnswer
                    })
                    .select();
                    
                if (insertError) {
                    console.error(`Error inserting answer for question ${questionId}:`, insertError);
                } else if (insertData && insertData.length > 0) {
                    console.log(`Successfully inserted answer for question ${questionId}`);
                    successCount++;
                }
            } else {
                // Row exists, proceed with UPDATE
                const { data, error: updateError } = await supabaseAdmin
                    .from('fpr_answers_list')
                    .update({ answer: formattedAnswer })
                    .eq('answer_id', answerId)
                    .eq('question_id', questionId)
                    .select();
                    
                if (updateError) {
                    console.error(`Error updating question ${questionId}:`, updateError);
                } else if (data && data.length > 0) {
                    console.log(`Successfully updated question ${questionId}`);
                    successCount++;
                } else {
                    console.warn(`No rows updated for question ${questionId}`);
                }
            }
        }
        
        console.log(`Update complete: ${successCount} of ${Object.keys(answers).length} answers updated`);
        
        if (successCount === 0) {
            return json({ 
                error: 'No records were updated', 
                message: 'The update operation completed but no records were modified'
            }, { status: 500 });
        }
        
        return json({
            success: true,
            message: `FPR record updated successfully (${successCount} fields)`,
            updatedCount: successCount
        });
        
    } catch (err) {
        console.error('Error updating FPR record:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return json({ 
            error: 'Failed to update record',
            details: errorMessage 
        }, { status: 500 });
    }
}

// Add DELETE handler for FPR records
export const DELETE: RequestHandler = async ({ params }) => {
    console.log('DELETE request received for FPR with params:', params);

    const childId = parseInt(params.id);
    const answerId = params.answerId;
    
    if (!childId || isNaN(childId) || !answerId) {
        return json({ error: 'Invalid parameters' }, { status: 400 });
    }
    
    try {
        // First verify the record exists
        const { data: existingRecord, error: recordError } = await supabaseAdmin
            .from('fpr_answers')
            .select('*')
            .eq('sc_id', childId)
            .eq('answer_id', answerId)
            .single();
            
        if (recordError) {
            console.error('Record lookup error:', recordError);
            return json({ error: 'Record not found', details: recordError.message }, { status: 404 });
        }
        
        if (!existingRecord) {
            console.error('No record found for sc_id:', childId, 'and answer_id:', answerId);
            return json({ error: 'Record not found' }, { status: 404 });
        }
        
        console.log('Found record to delete:', existingRecord);
        
        // Due to foreign key constraints, we need to delete in this order:
        // 1. First delete all answers in fpr_answers_list
        const { error: answersError } = await supabaseAdmin
            .from('fpr_answers_list')
            .delete()
            .eq('answer_id', answerId);
            
        if (answersError) {
            console.error('Error deleting FPR answers:', answersError);
            return json({ 
                error: 'Failed to delete answers', 
                details: answersError.message 
            }, { status: 500 });
        }
        
        // 2. Then delete the main FPR record
        const { error: recordDeleteError } = await supabaseAdmin
            .from('fpr_answers')
            .delete()
            .eq('answer_id', answerId);
            
        if (recordDeleteError) {
            console.error('Error deleting FPR record:', recordDeleteError);
            return json({ 
                error: 'Failed to delete record', 
                details: recordDeleteError.message 
            }, { status: 500 });
        }
        
        return json({
            success: true,
            message: 'FPR record deleted successfully'
        });
        
    } catch (err) {
        console.error('Error deleting FPR record:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return json({ 
            error: 'Failed to delete record',
            details: errorMessage 
        }, { status: 500 });
    }
}