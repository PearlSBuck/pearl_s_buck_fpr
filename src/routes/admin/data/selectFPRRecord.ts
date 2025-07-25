import { writable } from 'svelte/store';

// Create a store for selected FPR records
export const selectedRecords = writable<Set<string>>(new Set());