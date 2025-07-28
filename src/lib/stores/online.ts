// src/lib/stores/online.ts
import { writable } from 'svelte/store';

export const isOnline = writable(true);

if (typeof window !== 'undefined') {
	isOnline.set(navigator.onLine);
    const updateOnlineStatus = () => isOnline.set(navigator.onLine);
	window.addEventListener('online', updateOnlineStatus);
	window.addEventListener('offline', updateOnlineStatus);
}
