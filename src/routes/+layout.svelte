<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '../components/Header.svelte';
  import '../app.css';

  let pageName = $state("");
  let search = $state(false);
  let backButton = $state(false);

  onMount(() => {
    if ('serviceWorker' in navigator) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({
          immediate: true,
          // shown when a new SW is waiting – show your “refresh” UI here
          onNeedRefresh() { console.log('🔄 Update available'); },
          // called once caches are ready for offline
          onOfflineReady() { console.log('✅ Offline ready'); },
          // the right hook name for Svelte/Vite
          onRegistered(reg) { console.log('✅ SW registered:', reg); },
          onRegisterError(error) { console.error('❌ SW registration failed:', error); }
        });
      });
    }
  });
</script>

<Header name={pageName} search={search} backButton={backButton} />
<slot />
