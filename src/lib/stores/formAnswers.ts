// src/lib/stores/formAnswers.ts
import { writable, get } from 'svelte/store';
import { supabaseAdmin } from '$lib/db';

const OFFLINE_ANSWERS_KEY = 'offlineAnswers';
let hasLoaded = false;

// Local reactive answers to be used in the formAnswers table
export const filledOutBy = writable('');
export const SCId = writable('');
// Local reactive answer state (used in the UI)
export const formAnswers = writable<Record<string, any>>({});
// --- LOCAL STORAGE PERSISTENCE ---

// 1. Load from localStorage (on client only)
export function loadOfflineAnswers() {
	if (typeof localStorage === 'undefined') return;

	const stored = localStorage.getItem(OFFLINE_ANSWERS_KEY);
	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			formAnswers.set(parsed);
		} catch (e) {
			console.error('Invalid offline answer data:', e);
			formAnswers.set({});
		}
	}
	hasLoaded=true;
	formAnswers.subscribe((answers) => {
		if(hasLoaded){
		localStorage.setItem(OFFLINE_ANSWERS_KEY, JSON.stringify(answers));
		}
	});
}





// 3. Clear answers manually or after submit
export function clearAnswers() {
	formAnswers.set({});
	localStorage.removeItem(OFFLINE_ANSWERS_KEY);
}

// --- SUBMISSION TO SUPABASE (FPR/FIS-aware schema) ---
export async function submitAnswersToSupabase(formId: string, formType: 'FPR' | 'FIS', scname?: string) {
	const stored = localStorage.getItem(OFFLINE_ANSWERS_KEY);
	if (!stored) {
		console.warn('No answers to submit.');
		return false;
	}

	let answers: Record<string, any>;
	try {
		answers = JSON.parse(stored);
	} catch (e) {
		console.error('Invalid JSON in offline answers:', e);
		return false;
	}

	const answerEntries = Object.entries(answers);
	if (answerEntries.length === 0) {
		console.warn('No answers to submit.');
		return false;
	}

	// Get store values
	const filledOutByValue = get(filledOutBy);
	const scIdValue = get(SCId);

	// --- STEP 1: Prepare table names ---
	const parentTable = formType === 'FPR' ? 'fpr_answers' : 'fis_answers';
	const listTable = formType === 'FPR' ? 'fpr_answers_list' : 'fis_answers_list';

	// --- STEP 2: Prepare INSERT payload for parent row ---
	let parentInsertPayload: Record<string, any>;

	if (formType === 'FPR') {
		parentInsertPayload = {
			form_id: formId,
			filled_out_by: filledOutByValue,
			sc_id: scIdValue,
			child_id: scIdValue
		};
		// if formType === 'FIS'
	} else {
		parentInsertPayload = {
			form_id: formId,
			sc_name: scname,
			filled_out_by: filledOutByValue

		};
	}

	// --- STEP 3: Insert parent row ---
	const { data: parentAnswer, error: parentError } = await supabaseAdmin
		.from(parentTable)
		.insert(parentInsertPayload)
		.select()
		.single();

	if (parentError) {
		console.error(`Error inserting into ${parentTable}:`, parentError);
		return false;
	}

	const parentAnswerId = parentAnswer.answer_id;

	// --- STEP 4: Prepare answer list ---
	const submissions = answerEntries.map(([question_id, answer]) => {
		const formattedAnswer = Array.isArray(answer) ? JSON.stringify(answer) : answer;
		if (formType === 'FPR') {
			return {
				answer_id: parentAnswerId,
				question_id,
				answer: formattedAnswer
			};
		} else if (formType === 'FIS') {
			return {
				answer_id: parentAnswerId,
				question_id,
				answer: formattedAnswer
			};
		}
	});

	// --- STEP 5: Insert answer list rows ---
	const { error: listError } = await supabaseAdmin
		.from(listTable)
		.insert(submissions);

	if (listError) {
		console.error(`Error inserting into ${listTable}:`, listError);
		return false;
	}

	console.log('Answers submitted successfully:', submissions);
	clearAnswers();
	return true;
}

