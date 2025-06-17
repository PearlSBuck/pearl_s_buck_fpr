<script lang="ts">
	import DataInput from '../stories/DataInput.svelte';
	import { onMount } from 'svelte';
	import { fetchSectionFields } from '../lib/api/fetchSectionFields';
    import { fetchSections } from '../lib/api/fetchSectionFields';

	export let rows: any[] = [];
    export let sections: any[] = [];
	let error: string | null = null;

	onMount(async () => {
		if (rows.length === 0) {
			try {
				// rows = await fetchSectionFields('Sponsored Child Information');
                //remember to add version argument
                sections = await fetchSections('Family Progress Report');
			} catch (err) {
				error = (err as Error).message;
			}
		}
	});
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
    {#each sections as section}
        <div class="text-3xl font-bold pb-4">{section.title}</div>
        
        <!-- <ul>
            {#each rows as row, i}
                <DataInput
                    type = {row.type}
                    label={row.label}
                    name={row.name}
                    placeholder={row.placeholder}
                    required={row.required}
                    options={row.options}
                    value=""

                />
            {/each}
        </ul> -->
    {/each}
    
    
</div>
