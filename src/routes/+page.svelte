<script lang="ts">
	import DataInput from '../stories/DataInput.svelte';
	import { onMount } from 'svelte';
	import { fetchSectionFields, fetchSections } from '../lib/api/fetchSectionFields';

	let internalSections: any[] = [];
	let error: string | null = null;

	onMount(async () => {
		try {
			console.log('Fetching sections...');
			const rawSections = await fetchSections('Family Progress Report', '2025-06-17 15:52:37');
			console.log('Fetched raw sections:', rawSections);

			const sectionsWithRows = await Promise.all(
				rawSections.map(async (section) => {
					const rows = await fetchSectionFields(section.title);
					console.log(`Fetched rows for "${section.title}":`, rows);
					return { ...section, rows };
				})
			);

			console.log('Final sections with rows:', sectionsWithRows);
			internalSections = sectionsWithRows;
		} catch (err) {
			error = (err as Error).message;
			console.error('Error during fetch:', error);
		}
	});
</script>

{#if internalSections.length}
	{#each internalSections as section}
		<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
			<div class="text-3xl font-bold pb-4">
				{section.title} ({section.rows?.length || 0} fields)
			</div>

			<ul>
				{#each section.rows as row}
					<DataInput
						type={row.type}
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
{:else if error}
	<p class="text-red-600 font-semibold">Error loading sections: {error}</p>
{:else}
	<p class="text-gray-500 italic">Loading sections...</p>
{/if}
