import { writable } from "svelte/store";

export const selectedRecords = writable<Set<number>>(new Set());
