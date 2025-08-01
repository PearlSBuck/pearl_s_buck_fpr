<script lang="ts">
    import { selectedRecords } from '../routes/admin/data/selectFPRRecord';
    import { goto } from '$app/navigation';
    /*
    Variable Definitions:
    years = array of years to display records for
    recordsByYear = object mapping years to arrays of records
    childId = string representing the ID of the child for whom records are displayed
    selectRecord = boolean to indicate if the record is in selection mode
    */
    export let years: (string|number)[] = [];
    export let recordsByYear: {[year: string]: any[]}; // Change to string key for consistency
    export let childId: string;
    export let selectRecord: boolean = false;
    // Reactive store to manage selected records
    function viewRecord(answerId: string) {
        if (selectRecord) {
            toggleSelection(answerId);
        } else {
            goto(`/admin/data/fpr/${childId}/${answerId}`);
        }
    }
    // Function to toggle selection of a record
    function toggleSelection(id: string) {
        selectedRecords.update(records => {
            if (records.has(id)) {
                records.delete(id);
            } else {
                records.add(id);
            }
            return records;
        });
    }
</script>

<!-- Years list -->
<div class="w-full space-y-4">
    {#each years as year, i}
        <div class="border rounded-lg p-3 shadow">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">{year}</h2>
            <div class="space-y-2">
                {#each recordsByYear[String(year)] as record} <!-- Convert year to string -->
                    <div 
                        role="button"
                        tabindex="0"
                        class="flex items-center justify-between p-2 rounded bg-[#474C58] text-white cursor-pointer hover:bg-[#5a5f6c]"
                        class:bg-blue-600={$selectedRecords.has(record.answer_id)}
                        class:text-white={$selectedRecords.has(record.answer_id)}
                        on:click={() => viewRecord(record.answer_id)}
                        on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                viewRecord(record.answer_id);
                            }
                        }}
                    >
                        {#if selectRecord}
                            <!-- Checkbox for selection mode -->
                            <div class="flex items-center">
                                <input 
                                    type="checkbox"
                                    class="mr-2 h-4 w-4 accent-white"
                                    checked={$selectedRecords.has(record.answer_id)}
                                    on:click|stopPropagation={() => toggleSelection(record.answer_id)}
                                />
                                <div class="flex flex-col">
                                    <span class="text-white">{new Date(record.created_at).toLocaleDateString()}</span>
                                    {#if record.forms?.version}
                                        <span class="text-white text-xs">Version {record.forms.version}</span>
                                    {/if}
                                </div>
                            </div>
                        {:else}
                            <div class="flex flex-col">
                                <span class="text-white">{new Date(record.created_at).toLocaleDateString()}</span>
                                {#if record.forms?.version}
                                    <span class="text-white text-xs">Version {record.forms.version}</span>
                                {/if}
                            </div>
                        {/if}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>
