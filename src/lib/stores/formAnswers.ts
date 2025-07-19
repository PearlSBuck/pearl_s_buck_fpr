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

// --- SUBMISSION TO SUPABASE ---
export async function submitAnswersToSupabase(formId: string) {
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

	// 1. Insert parent answer row
	const { data: parentAnswer, error: parentError } = await supabaseAdmin
		.from('fpr_answers')
		.insert({
			form_id: formId,
			answer: '',
			filled_out_by: filledOutByValue,
			sc_id: scIdValue
		})
		.select()
		.single();

	if (parentError) {
		console.error('Error inserting parent answer row:', parentError);
		return false;
	}

	const parentAnswerId = parentAnswer.answer_id;
	// 2. Insert answer list
	const submissions = answerEntries.map(([question_id, answer]) => ({
		answer_id: parentAnswerId,
		question_id,
		answer
	}));

	const { error: listError } = await supabaseAdmin
		.from('fpr_answers_list')
		.insert(submissions);

	if (listError) {
		console.error('Error submitting answer list:', listError);
		return false;
	}

	console.log('Answers submitted successfully:', submissions);
	clearAnswers();
	return true;
}
