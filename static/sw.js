const CACHE_NAME = 'sveltekit-offline-v1';
console.log('SW script executing:', location.href);

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) =>
			cache.addAll([
				'/',                // fallback
				'/avatar.png',    
				'/logo.jpg'    
			])
		)
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => key !== CACHE_NAME && caches.delete(key))
			)
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// 🔒 Ignore chrome-extension:// and other invalid schemes
	if (url.protocol.startsWith('chrome-extension')) return;

	event.respondWith(
		caches.match(event.request).then((cached) => {
			return (
				cached ||
				fetch(event.request).catch(() => {
					// Fallback to root if offline
					if (event.request.mode === 'navigate') {
						return caches.match('/');
					}
				})
			);
		})
	);
});

