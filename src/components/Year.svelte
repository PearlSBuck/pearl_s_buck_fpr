<script lang="ts">
    export let fprData: any[];
    import { onMount } from 'svelte';

    let versionNames: string[] = [];

    let fprList = fprData.map(item => ({
        ...item,
        activated: false
    }));
    
    function toggleActivation(index: number) {
        fprList[index].activated = !fprList[index].activated;
    }
</script>
{#each fprList as versionName, index}
    <button on:click={() => toggleActivation(index)} class="cursor-pointer">
        <div class="bg-[#0C376C] w-fit text-white rounded-xl p-2 px-3 text-lg">
            <div class="whitespace-nowrap flex items-center gap-1">
                <span>{new Date(versionName.created_at).getFullYear()}</span>
                {#if versionName.activated}
                    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.667 20.5418V8.4585L17.5003 14.5002L11.667 20.5418Z" fill="white"/>
                    </svg>

                {:else}
                    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.0003 18.1252L8.16699 12.0835H19.8337L14.0003 18.1252Z" fill="white"/>
                    </svg>
                {/if}
            </div>
        </div>
    </button>
    {#if versionName.activated}
        <div class="flex justify-between rounded-md text-white bg-[#474C58] h-16 p-3 w-60 m-1 lg:w-250 md:w-150 sm:w-125 relative">
            <div class="flex items-start flex-col justify-center">
                <div class="flex flex-col justify-center items-start gap-1">
                    <span class="text-sm md:text-md lg:text-lg">{versionName.forms ? versionName.forms.title : "No title."}</span>
                </div>
            </div>
        </div>
    {/if}
{/each}
