<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
        if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then((reg) => console.log('✅ SW registered', reg))
                .catch((err) => console.error('❌ SW registration failed:', err));
        }
    });

</script>
