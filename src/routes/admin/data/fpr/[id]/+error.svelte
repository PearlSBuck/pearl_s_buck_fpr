<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import Header from '../../../../../components/Header.svelte';
	import { getContext, onMount } from 'svelte';


    const setPageContext:any = getContext('setPageContext');
    onMount(() => {
      setPageContext("Error",false,true);
    })
</script>

<div class="app-container">
    
    <div class="content-area flex flex-col items-center pt-8 px-6 pb-8">
        <div class="w-full max-w-4xl bg-white rounded-xl shadow p-8 text-center">
        <svg class="w-24 h-24 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        
        <h1 class="text-2xl font-bold text-red-600 mb-2">Error {$page.status}</h1>
        <p class="text-lg text-gray-700 mb-6">{$page.error?.message || 'An unknown error occurred'}</p>
        
        <div class="flex justify-center space-x-4">
            <button 
            class="bg-[#0C376C] hover:bg-[#0a2c56] text-white px-4 py-2 rounded"
            on:click={() => goto('/admin/data')}
            >
            Return to Data Management
            </button>
        </div>
        </div>
    </div>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .content-area {
    flex: 1;
    background-color: #EFF6FF;
    margin-top: 0px;
    padding-top: 140px;
  }
</style>