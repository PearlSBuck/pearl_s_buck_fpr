// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['offline.html'], 
      strategies: 'generateSW',
      // Enable dev mode for testing
      devOptions: {
        enabled: true,
        type: 'module',
      },
      // Fix the service worker scope and path
      scope: '/',
      base: '/',
      kit: {
        // Include version file for SPA fallback revision
        includeVersionFile: true,
      },
      workbox: {
        // Important: Include your FPR routes in globPatterns for precaching
        globPatterns: [
          'client/**/*.{js,css,ico,png,svg,webp,webmanifest}',
          'prerendered/**/*.{html,json}',
          // Pre-cache the FPR page template/shell
          'client/_app/**/*.{js,css}',
        ],
        // Add navigation fallback for SPA-like behavior
        navigateFallback: '/',
        navigateFallbackAllowlist: [/^\/fpr\//],
        
        runtimeCaching: [
          // Debug ALL requests to see what's happening
          {
            urlPattern: () => {
              console.log('🔍 SW intercepted a request');
              return true; // Catch everything to debug
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'debug-all-cache',
              plugins: [
                {
                  requestWillFetch: async ({ request }) => {
                    console.log('🌐 SW handling request:', request.url);
                    return request;
                  },
                  cacheDidUpdate: async ({ cacheName, request }) => {
                    console.log(`✅ SW cached: ${request.url} in ${cacheName}`);
                  },
                },
              ],
            },
          },
          // Specific FPR caching
          {
            urlPattern: /\/fpr\/FPR-\d+$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'form-pages-cache',
              networkTimeoutSeconds: 3,
              plugins: [
                {
                  cacheDidUpdate: async ({ cacheName, request }) => {
                    console.log(`✅ Cached in ${cacheName}: ${request.url}`);
                  },
                  cachedResponseWillBeUsed: async ({ request, cachedResponse }) => {
                    if (cachedResponse) {
                      console.log(`📦 Served from ${cacheName}: ${request.url}`);
                    }
                    return cachedResponse;
                  },
                },
              ],
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
            },
          },
        ],
        // Ensure service worker takes control immediately - CRITICAL
        skipWaiting: true,
        clientsClaim: true,
        // Force immediate activation
        cleanupOutdatedCaches: true,
        // Important: Add this to make SW control pages immediately  
        navigateFallback: null, // Don't interfere with SvelteKit routing
        // Add mode for better debugging
        mode: 'development',
      },
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
    }),
  ],
});