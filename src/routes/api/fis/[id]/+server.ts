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
        
        // Get existing FIS record to verify it exists - USE SUPABASE ADMIN!
        const { data: existingRecord, error: recordError } = await supabaseAdmin
            .from('fis_answers')
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
        
        console.log('Found record:', existingRecord);
        
        // Begin transaction to update answers
        const updates = Object.entries(answers).map(([questionId, answer]) => {
            return supabaseAdmin // Use supabaseAdmin here too!
                .from('fis_answers_list')
                .update({ answer })
                .eq('answer_id', answerId)
                .eq('question_id', questionId);
        });
        
        // Execute all updates
        const results = await Promise.all(updates);
        
        // Check for errors
        const errors = results.filter(result => result.error !== null && result.error !== undefined)
            .map(result => result.error?.message || 'Unknown error');
            
        if (errors.length > 0) {
            console.error('Errors updating FIS answers:', errors);
            return json({ 
                error: 'Some fields could not be updated',
                details: errors
            }, { status: 500 });
        }
        
        return json({
            success: true,
            message: 'FIS record updated successfully'
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