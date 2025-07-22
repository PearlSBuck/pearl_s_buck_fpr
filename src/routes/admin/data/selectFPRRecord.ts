import { writable } from 'svelte/store';

export const selectedRecords = writable<Set<string>>(new Set());