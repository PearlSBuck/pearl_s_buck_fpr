/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;

// Generate asset list and optionally filter out the service worker itself
const ASSETS = [...new Set([...build, ...files])].filter(
	(asset) => asset !== '/service-worker.js'
);

// Log assets to help with debugging
console.log('[SW] Assets to cache:', ASSETS);

self.addEventListener('install', (event) => {
	self.skipWaiting();
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			for (const asset of ASSETS) {
				try {
					await cache.add(asset);
					console.log(`[SW] Cached: ${asset}`);
				} catch (err) {
					console.error(`[SW] Failed to cache: ${asset}`, err);
				}
			}
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys.map((key) => {
					if (key !== CACHE) {
						console.log(`[SW] Deleting old cache: ${key}`);
						return caches.delete(key);
					}
				})
			);
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	event.respondWith(
		(async () => {
			try {
				return await fetch(event.request);
			} catch (err) {
				console.warn('[SW] Fetch failed, serving from cache:', event.request.url);
				const allClients = await self.clients.matchAll();
				for (const client of allClients) {
					client.postMessage({ type: 'OFFLINE_DETECTED' });
				}
				const cached = await caches.match(event.request);
				return (
					cached ||
					new Response(`[SW] Offline and not cached: ${event.request.url}`, {
						status: 503,
						headers: { 'Content-Type': 'text/plain' }
					})
				);
			}
		})()
	);
});
