import { get } from 'svelte/store';
import { filledOutBy, SCId } from '$lib/stores/formAnswers'; // Adjust this path
import { supabaseAdmin } from '$lib/db';// Adjust this path

// The key to store our offline submissions in localStorage
const OFFLINE_SUBMISSIONS_KEY = 'offlineSubmissions';

/**
 * Defines the structure for the answers part of a form submission.
 */
interface AnswersPayload {
    [question_id: string]: any;
}

/**
 * Defines the full structure of a single form submission to be stored offline.
 */
interface OfflineSubmission {
    formId: string;
    formType: 'FPR' | 'FIS';
    scname?: string;
    answers: AnswersPayload;
    timestamp: string; // ISO 8601 string
}

/**
 * Saves a single form's payload to the offline queue in localStorage.
 * @param payload The complete form data to save.
 */
export function saveToOfflineQueue(payload: Omit<OfflineSubmission, 'timestamp'>): void {
    try {
        const stored = localStorage.getItem(OFFLINE_SUBMISSIONS_KEY);
        // Explicitly type the queue as an array of OfflineSubmission
        const queue: OfflineSubmission[] = stored ? JSON.parse(stored) : [];
        
        queue.push({
            ...payload,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem(OFFLINE_SUBMISSIONS_KEY, JSON.stringify(queue));
        console.log('Form saved to offline queue.');
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

/**
 * Sends a single offline submission to Supabase.
 * @param submission The submission object retrieved from the offline queue.
 * @returns A promise that resolves to true on success, or rejects with an error.
 */
async function sendToSupabase(submission: OfflineSubmission): Promise<boolean> {
    const { formId, formType, scname, answers } = submission;
    
    // Get values from Svelte stores
    const filledOutByValue = get(filledOutBy);
    const scIdValue = get(SCId);

    // --- STEP 1: Prepare table names ---
    const parentTable = formType === 'FPR' ? 'fpr_answers' : 'fis_answers';
    const listTable = formType === 'FPR' ? 'fpr_answers_list' : 'fis_answers_list';
    
    // --- STEP 2: Prepare INSERT payload for parent row ---
    let parentInsertPayload: Record<string, any>;
    if (formType === 'FPR') {
        parentInsertPayload = { form_id: formId, filled_out_by: filledOutByValue, sc_id: scIdValue, child_id: scIdValue };
        console.log(parentInsertPayload);
    } else { // formType === 'FIS'
        parentInsertPayload = { form_id: formId, sc_name: scname, filled_out_by: filledOutByValue };
    }

    // --- STEP 3: Insert parent row ---
    const { data: parentAnswer, error: parentError } = await supabaseAdmin
        .from(parentTable)
        .insert(parentInsertPayload)
        .select()
        .single();
    
    if (parentError) {
        throw new Error(`Error inserting into ${parentTable}: ${parentError.message}`);
    }

    const parentAnswerId = (parentAnswer as { answer_id: number }).answer_id;
    
    // --- STEP 4: Prepare answer list rows ---
    const submissions = Object.entries(answers).map(([question_id, answer]) => {
        const formattedAnswer = Array.isArray(answer) ? JSON.stringify(answer) : answer;
        return { answer_id: parentAnswerId, question_id, answer: formattedAnswer };
    });

    // --- STEP 5: Insert answer list rows ---
    const { error: listError } = await supabaseAdmin
        .from(listTable)
        .insert(submissions);

    if (listError) {
        throw new Error(`Error inserting into ${listTable}: ${listError.message}`);
    }
    
    console.log(`Successfully submitted to Supabase: ${formId}`);
    return true;
}

/**
 * Syncs all submissions from the offline queue to Supabase.
 * This should be called whenever the application comes online.
 */
export async function syncOfflineQueue(): Promise<void> {
    try {
        const stored = localStorage.getItem(OFFLINE_SUBMISSIONS_KEY);
        if (!stored) {
            console.log('No offline submissions to sync.');
            return;
        }

        // Explicitly type the parsed JSON
        let queue: OfflineSubmission[] = JSON.parse(stored);
        if (queue.length === 0) {
            console.log('Offline queue is empty.');
            return;
        }

        console.log(`Starting sync for ${queue.length} queued submissions.`);

        const failedSubmissions: OfflineSubmission[] = [];
        for (const submission of queue) {
            try {
                await sendToSupabase(submission);
            } catch (e: any) {
                console.error('Failed to sync one submission:', e.message);
                failedSubmissions.push(submission);
            }
        }
        
        // If all submissions succeeded, clear the queue.
        // Otherwise, save the failed ones back for a retry.
        if (failedSubmissions.length === 0) {
            localStorage.removeItem(OFFLINE_SUBMISSIONS_KEY);
            console.log('All queued submissions successfully synced.');
        } else {
            localStorage.setItem(OFFLINE_SUBMISSIONS_KEY, JSON.stringify(failedSubmissions));
            console.warn(`${failedSubmissions.length} submissions failed to sync and will be retried later.`);
        }

    } catch (e: any) {
        console.error('Failed to parse or process offline queue:', e);
    }
}
