import { writable } from "svelte/store";

// Create a store for selected records
export const selectedRecords = writable<Set<number>>(new Set());
