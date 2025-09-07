<script lang="ts">
  import { setContext } from 'svelte';
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import { writable } from 'svelte/store';
  import '../app.css';
  import Header from '../components/Header.svelte';

  // State variables for header props from original code
  let pageName = $state("");
  let search = $state(false);
  let backButton = $state(false);

  // PWA logic from the incoming change
  onMount(async () => {
    if (pwaInfo) {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({
          immediate: true,
          onRegistered(r) {
            console.log('✅ SW Registered via @vite-pwa/sveltekit:', r);
            console.log('SW scope:', r?.scope);
            console.log('SW scriptURL:', r?.active?.scriptURL);
            
            // Force immediate control
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
              if (!navigator.serviceWorker.controller) {
                console.log('🔄 SW not controlling page, claiming control');
                window.location.reload();
              }
            }
            
            if (r) {
              setInterval(() => {
                console.log('🔄 Checking for SW update');
                r.update();
              }, 20000); // 20 seconds for testing
            }
          },
          onRegisterError(error) {
            console.error('❌ SW registration error:', error);
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
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async () => {
        const controller = navigator.serviceWorker.controller;
        console.log('🎛️ SW Controller:', controller ? 'YES' : 'NO');
        console.log('🎛️ SW Controller URL:', controller?.scriptURL);
        
        const checkCaches = async () => {
          try {
            const cacheNames = await caches.keys();
            console.log('📦 Available caches:', cacheNames);
            
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
        
        checkCaches();
        setInterval(checkCaches, 10000);
      });
    }
  });

  // Header context logic from original code
  type PageContext = {
    title: string;
    previous?: string;
  };

  const pageContextStore = writable<PageContext>({
    title: '',
    previous: ''
  });

  const setPageContextObject = (context: PageContext) => {
    pageContextStore.set({
      title: context.title,
      previous: context.previous || ''
    });
    
    pageName = context.title;
    backButton = !!context.previous;
  };

  setContext('setPageContext', setPageContextObject);
  setContext('pageContext', pageContextStore);
  
  const setPageNameString = (name: string) => {
    pageContextStore.update(ctx => ({ ...ctx, title: name }));
    pageName = name;
  };
  
  setContext('setPageName', setPageNameString);

  function setPageContextParams(name: string, isSearch: boolean = false, isBack: boolean = false) {
    pageName = name;
    search = isSearch;
    backButton = isBack;
    
    pageContextStore.set({
      title: name,
      previous: isBack ? 'back' : ''
    });
  }

  setContext('setPageParams', setPageContextParams);

  // Get the web manifest link tag using runes syntax
  let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
  
  let { children } = $props();
</script>

<svelte:head>
  {@html webManifest}
</svelte:head>

<Header name={pageName} search={search} backButton={backButton}/>
{@render children()}
