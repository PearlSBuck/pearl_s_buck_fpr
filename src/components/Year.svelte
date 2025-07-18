<script lang="ts">
    import { goto } from '$app/navigation';
    // Change from fprData to receiving these directly
    export let years: number[];
    export let recordsByYear: Record<number, any[]>;
    export let childId: number;

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        });
    }

    function viewReport(answerId: string, childId: number) {
    goto(`/admin/data/fpr/${childId}/${answerId}`);
    }
</script>

<div class="years-container w-full p-4">
    {#if years.length === 0}
        <div class="empty-state py-12 text-center text-gray-500">
        <p>No progress reports available for this child.</p>
        </div>
    {:else}
        {#each years as year}
            <div class="year-group mb-8 pb-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-[#1A5A9E] mb-3">{year}</h2>
                
                <div class="space-y-2">
                {#each recordsByYear[year] as record}
                    <button 
                        class="record-card w-full p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors text-left"
                        on:click={() => viewReport(record.answer_id, record.sc_id)}
                    >
                        <div class="flex justify-between">
                            <div>
                                <p class="font-medium">Progress Report</p>
                                <p class="text-sm text-gray-600">Form v{record.forms?.version || '1.0'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-600">{formatDate(record.created_at)}</p>
                            </div>
                        </div>
                    </button>
                {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>


<style>
    .years-container {
        width: 100%;
        padding: 1rem;
    }
    .empty-state {
        padding: 3rem 0;
        text-align: center;
        color: #666;
    }
    .year-group {
        border-bottom: 1px solid #eee;
        padding-bottom: 1rem;
    }
</style>
