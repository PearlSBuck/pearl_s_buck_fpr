// src/lib/stores/formAnswers.ts
import { writable } from 'svelte/store';
import { supabaseAdmin } from '$lib/db';

const OFFLINE_ANSWERS_KEY = 'offlineAnswers';
let hasLoaded = false;
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

export async function submitAnswersToSupabase() {
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

	const submissions = answerEntries.map(([question_id, answer]) => ({
		answer_id: '4b7d66fe-6899-4f03-bdc2-739698ffec52', // replace with real dynamic ID later
		question_id,
		answer,
	}));

	const { error } = await supabaseAdmin.from('fpr_answers_list').insert(submissions);

	if (error) {
		console.error('Error submitting answers:', error);
		return false;
	}

	console.log('Answers submitted successfully:', submissions);
	clearAnswers();
	return true;
}
