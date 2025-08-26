<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  // Remove the import for registerSW as we're no longer using it
  // import { registerSW } from 'virtual:pwa-register'; 
  import Header from '../components/Header.svelte';
  import '../app.css';

  let pageName = $state("");
  let search = $state(false);
  let backButton = $state(false);

  onMount(() => {
    if ('serviceWorker' in navigator) {
      // Manually register the service worker
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('✅ Service Worker Registered. Scope:', reg.scope, 'Script URL:', reg.active?.scriptURL);
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  });
</script>

<Header name={pageName} search={search} backButton={backButton} />
<slot />