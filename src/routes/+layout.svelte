<script lang="ts">
	import { setContext } from 'svelte';
	import '../app.css';
	import Header from '../components/Header.svelte';  
	import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
	let pageName = $state("");
	let search = $state(false);
	let backButton = $state(false);
	setContext('setPageName',setPageContext);
	function setPageContext(name:string,isSearch:boolean,isBack:boolean) {
		pageName  = name;
		search = isSearch;
		backButton = isBack;
	}

	let { data, children } = $props();

 let { session, supabase } = $derived(data)

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    return () => data.subscription.unsubscribe()
  })



</script>
<Header name={pageName} search={search} backButton={backButton}/>
{@render children()}





