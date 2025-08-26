import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/db'; 
import type { RequestHandler } from './$types';

// Add logging to debug
console.log('API endpoint registered at /api/fis/[id]');

export const PATCH: RequestHandler = async ({ params, request }) => {
    console.log('PATCH request received with params:', params);

    const childId = parseInt(params.id);
    
    if (!childId || isNaN(childId)) {
        return json({ error: 'Invalid child ID' }, { status: 400 });
    }
    
    try {
        const { answerId, answers } = await request.json() as { 
            answerId: string; 
            answers: Record<string, string | string[]> 
        };
        
        if (!answerId || !answers) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        console.log('Looking for record with sc_id:', childId, 'and answer_id:', answerId);
        
        // Get existing FIS record to verify it exists
        const { data: existingRecord, error: recordError } = await supabaseAdmin
            .from('fis_answers')
            .select('*')
            .eq('child_id', childId)
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
        
        console.log('Found record:', existingRecord);
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
                .from('fis_answers_list')
                .select('*')
                .eq('answer_id', answerId)
                .eq('question_id', questionId)
                .single();
            
            if (checkError || !existingAnswer) {
                console.log(`No existing answer found for question ${questionId}, creating new row`);
                
                // Row doesn't exist, so INSERT instead of UPDATE
                const { data: insertData, error: insertError } = await supabaseAdmin
                    .from('fis_answers_list')
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
                    .from('fis_answers_list')
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
            message: `FIS record updated successfully (${successCount} fields)`,
            updatedCount: successCount
        });
        
    } catch (err) {
        console.error('Error updating FIS record:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return json({ 
            error: 'Failed to update record',
            details: errorMessage 
        }, { status: 500 });
    }
}

// Add DELETE handler for FIS records
export const DELETE: RequestHandler = async ({ params }) => {
    console.log('DELETE request received for FIS with params:', params);

    const childId = parseInt(params.id);
    
    if (!childId || isNaN(childId)) {
        return json({ error: 'Invalid child ID' }, { status: 400 });
    }
    
    try {
        // First verify the record exists
        const { data: existingRecord, error: recordError } = await supabaseAdmin
            .from('fis_answers')
            .select('answer_id')
            .eq('sc_id', childId)
            .single();
            
        if (recordError) {
            console.error('Record lookup error:', recordError);
            return json({ error: 'Record not found', details: recordError.message }, { status: 404 });
        }
        
        if (!existingRecord) {
            console.error('No record found for sc_id:', childId);
            return json({ error: 'Record not found' }, { status: 404 });
        }
        
        console.log('Found record to delete, answer_id:', existingRecord.answer_id);
        
        // Due to foreign key constraints, we need to delete in this order:
        // 1. First delete all answers in fis_answers_list
        const { error: answersError } = await supabaseAdmin
            .from('fis_answers_list')
            .delete()
            .eq('answer_id', existingRecord.answer_id);
            
        if (answersError) {
            console.error('Error deleting FIS answers:', answersError);
            return json({ 
                error: 'Failed to delete answers', 
                details: answersError.message 
            }, { status: 500 });
        }
        
        // 2. Then delete the main FIS record
        const { error: recordDeleteError } = await supabaseAdmin
            .from('fis_answers')
            .delete()
            .eq('sc_id', childId);
            
        if (recordDeleteError) {
            console.error('Error deleting FIS record:', recordDeleteError);
            return json({ 
                error: 'Failed to delete record', 
                details: recordDeleteError.message 
            }, { status: 500 });
        }
        
        return json({
            success: true,
            message: 'FIS record deleted successfully'
        });
        
    } catch (err) {
        console.error('Error deleting FIS record:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return json({ 
            error: 'Failed to delete record',
            details: errorMessage 
        }, { status: 500 });
    }
}