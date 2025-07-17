import { writable } from 'svelte/store';
import { supabaseAdmin } from '$lib/db'; // replace with your client instance

// Local reactive answer state (used in the UI)
export const formAnswers = writable<Record<string, any>>({}); // key = question_id

// Save locally for offline support
if (typeof window !== 'undefined') {
	formAnswers.subscribe((answers) => {
		localStorage.setItem('offlineAnswers', JSON.stringify(answers));
	});
}


// will be used later
export function loadOfflineAnswers() {
	const stored = localStorage.getItem('offlineAnswers');
	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			formAnswers.set(parsed);
		} catch (e) {
			console.error('Invalid offline answer data:', e);
		}
	}
}

// Clear local answers
export function clearAnswers() {
	formAnswers.set({});
	localStorage.removeItem('offlineAnswers');
}

// Save answers to SupabaseAdmin
export async function submitAnswersToSupabase() {
	const answers = JSON.parse(localStorage.getItem('offlineAnswers') || '{}');
	const answerEntries = Object.entries(answers);

	if (answerEntries.length === 0) {
		console.warn('No answers to submit.');
		return;
	}

	const submissions = answerEntries.map(([question_id, answer]) => ({
		answer_id: '4b7d66fe-6899-4f03-bdc2-739698ffec52', // change this to the one in fpr asnwers
		question_id,
		answer: answer, // expected to be any JSON-serializable value
	}));

	const { error } = await supabaseAdmin.from('fpr_answers_list').insert(submissions);

	if (error) {
		console.error('Error submitting answers:', error);
		return false;
	}
    console.log(submissions);
	console.log('Answers submitted successfully.');
	clearAnswers();
	return true;
}
