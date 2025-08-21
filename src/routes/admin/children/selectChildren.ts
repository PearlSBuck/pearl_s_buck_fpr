import { writable } from "svelte/store";

// Create a store for selected records
export const selectedChildren = writable<Set<number>>(new Set());
