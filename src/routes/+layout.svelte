<script lang="ts">
	import { setContext } from 'svelte';
	import '../app.css';
	import Header from '../components/Header.svelte';
	import { writable } from 'svelte/store';

	// State variables for header props
	let pageName = $state("");
	let search = $state(false);
	let backButton = $state(false);

	// Define the type for page context to allow optional previous
	type PageContext = {
		title: string;
		previous?: string;
	};

	// Create a writable store with the correct type
	const pageContextStore = writable<PageContext>({
		title: '',
		previous: '' // Default empty string
	});

	// Object-parameter function 
	const setPageContextObject = (context: PageContext) => {
		pageContextStore.set({
			title: context.title,
			previous: context.previous || '' // Ensure previous is a string
		});
		
		// Also update the state variables for Header
		pageName = context.title;
		backButton = !!context.previous;
	};

	// Set the object-style function as a context value
	setContext('setPageContext', setPageContextObject);
	
	// Set the page context store
	setContext('pageContext', pageContextStore);
	
	// For backwards compatibility with components using setPageName (string version)
	const setPageNameString = (name: string) => {
		pageContextStore.update(ctx => ({ ...ctx, title: name }));
		pageName = name;
	};
	
	// Set the string-style function as a context value
	setContext('setPageName', setPageNameString);

	// Original 3-parameter function 
	function setPageContextParams(name: string, isSearch: boolean = false, isBack: boolean = false) {
		pageName = name;
		search = isSearch;
		backButton = isBack;
		
		// Also update the context store
		pageContextStore.set({
			title: name,
			previous: isBack ? 'back' : ''
		});
	}

	// Register this under a different context key to avoid conflicts
	setContext('setPageParams', setPageContextParams);

	let { children } = $props();
</script>

<Header name={pageName} search={search} backButton={backButton}/>
{@render children()}
