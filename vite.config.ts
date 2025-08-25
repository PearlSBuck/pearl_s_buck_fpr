import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
        registerType: 'autoUpdate',
        includeAssets: ['offline.html'],
        workbox: {
            navigateFallback: '/offline.html',
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
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        }
        })
        
  ]
});
