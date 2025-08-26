// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Crucial for relative asset paths
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      strategies: 'generateSW',
      filename: 'sw.js',
      includeAssets: ['offline.html'],
      // ✨ ADD THIS LINE: Disable automatic registration helper ✨
      injectRegister: null, 
      scope: '/', // Ensures the service worker controls the entire app scope
      manifest: {
        name: 'My App',
        short_name: 'App',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/fpr\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'form-pages-cache',
              plugins: [
                {
                  handlerDidError: async () => {
                    return caches.match('/offline.html');
                  },
                },
              ],
            },
          },
          {
            urlPattern: /\.(?:js|css|json|png|jpg|jpeg|svg|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 50,
              },
            },
          },
        ],
      },
    }),
  ],
});