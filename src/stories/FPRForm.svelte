<script lang="ts">
	import DataInput from './DataInput.svelte';
	import { onMount } from 'svelte';
	import { fetchSectionFields } from '../lib/api/fetchSectionFields';
    import { fetchSections } from '../lib/api/fetchSectionFields';

	export let rows: any[] = [];
    export let sections: any[] = [];
	let error: string | null = null;

	onMount(async () => {
		if (rows.length === 0) {
			try {
                //remember to add version argument
                sections = await fetchSections('Family Progress Report');
                for (const section of sections) {
			        section.rows = await fetchSectionFields(section.title);
		        }

			} catch (err) {
				error = (err as Error).message;
			}
		}
	});
</script>
{#each sections as section}
<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
    
        <div class="text-3xl font-bold pb-4">{section.title}</div>
        
        <ul>
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
        </ul>

</div>
{/each}
    
    

