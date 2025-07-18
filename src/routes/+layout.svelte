<script>
	import '../app.css';
	import RegisterSw from '$lib/components/RegisterSW.svelte';
	let { children } = $props();
</script>
<RegisterSw />
{@render children()}
