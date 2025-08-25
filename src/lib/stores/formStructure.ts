import { writable } from 'svelte/store';

const KEY = 'offlineFormStructure';
const defaultForm = { sections: [], fields: [] }; // tailor to your schema

export const mappedForm = writable(defaultForm);

export function loadOfflineForm() {
  if (typeof localStorage === 'undefined') return;
  const cached = localStorage.getItem(KEY);
  if (cached) {
    try { mappedForm.set(JSON.parse(cached)); } catch { /* ignore */ }
  }
  // persist every change
  mappedForm.subscribe((v) => {
    localStorage.setItem(KEY, JSON.stringify(v));
  });
}

export function clearOfflineForm() {
  localStorage.removeItem(KEY);
  mappedForm.set(defaultForm);
}
