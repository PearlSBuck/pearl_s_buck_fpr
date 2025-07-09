<script lang="ts">
    export let innerText: string = '';
    export let activated: boolean = false;
</script>

<div class="bg-[#0C376C] w-fit text-white rounded-xl p-2 px-3 text-lg">
    <div class="whitespace-nowrap flex items-center gap-1">
        <span>{innerText}</span>
        {#if activated}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
        {:else}
            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg" class="whitespace-nowrap">
            <path d="M13.9998 18.1252L8.1665 12.0835H19.8332L13.9998 18.1252Z" fill="white"/>
            </svg>
        {/if}
    </div>
</div>