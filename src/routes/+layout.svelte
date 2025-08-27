<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import Header from '../components/Header.svelte';
  import '../app.css';

  let pageName = $state("");
  let search = $state(false);
  let backButton = $state(false);

  onMount(async () => {
    if (pwaInfo) {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({
          immediate: true,
          // Ensure the SW is registered with the correct scope
          onRegistered(r) {
            console.log('✅ SW Registered via @vite-pwa/sveltekit:', r);
            console.log('SW scope:', r?.scope);
            console.log('SW scriptURL:', r?.active?.scriptURL);
            
            // Force immediate control - this is the key part from SO answer
            if (r?.installing) {
              console.log('🔄 SW installing, will reload when ready');
              r.installing.addEventListener('statechange', () => {
                if (r.installing?.state === 'activated') {
                  console.log('🚀 SW activated, reloading to enable caching');
                  window.location.reload();
                }
              });
            } else if (r?.waiting) {
              console.log('🔄 SW waiting, activating immediately');
              r.waiting.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            } else if (r?.active) {
              console.log('✅ SW already active and controlling');
              // Check if SW is controlling this page
              if (!navigator.serviceWorker.controller) {
                console.log('🔄 SW not controlling page, claiming control');
                window.location.reload();
              }
            }
            
            // Optional: Check for updates periodically (for testing)
            if (r) {
              setInterval(() => {
                console.log('🔄 Checking for SW update');
                r.update();
              }, 20000); // 20 seconds for testing
            }
          },
          onRegisterError(error) {
            console.error('❌ SW registration error:', error);
            
            // Fallback: Try manual registration if auto-registration fails
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(reg => {
                  console.log('✅ Fallback SW registration successful:', reg);
                })
                .catch(fallbackError => {
                  console.error('❌ Fallback SW registration also failed:', fallbackError);
                });
            }
          }
        });
      } catch (error) {
        console.error('❌ Failed to import PWA register:', error);
        
        // Fallback: Manual registration
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(reg => {
              console.log('✅ Manual SW registration successful:', reg);
            })
            .catch(manualError => {
              console.error('❌ Manual SW registration failed:', manualError);
            });
        }
      }
    } else {
      console.log('⚠️ PWA info not available');
      
      // Manual registration as fallback
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(reg => {
            console.log('✅ Manual SW registration (no PWA info):', reg);
          })
          .catch(error => {
            console.error('❌ Manual SW registration failed:', error);
          });
      }
    }
    
    // Debug: Check available caches periodically
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async () => {
        // Check if SW is controlling this page
        const controller = navigator.serviceWorker.controller;
        console.log('🎛️ SW Controller:', controller ? 'YES' : 'NO');
        console.log('🎛️ SW Controller URL:', controller?.scriptURL);
        
        const checkCaches = async () => {
          try {
            const cacheNames = await caches.keys();
            console.log('📦 Available caches:', cacheNames);
            
            // Check each cache
            for (const cacheName of cacheNames) {
              const cache = await caches.open(cacheName);
              const requests = await cache.keys();
              console.log(`📋 ${cacheName} contains:`, requests.map(r => r.url));
            }
            
            if (cacheNames.includes('form-pages-cache')) {
              console.log('✅ form-pages-cache EXISTS!');
            } else {
              console.log('❌ form-pages-cache NOT FOUND');
            }
          } catch (error) {
            console.error('❌ Error checking caches:', error);
          }
        };
        
        // Check caches on load and every 10 seconds
        checkCaches();
        setInterval(checkCaches, 10000);
      });
    }
  });

  // Get the web manifest link tag using runes syntax
  let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
  {@html webManifest}
</svelte:head>

<Header name={pageName} search={search} backButton={backButton} />
<slot />