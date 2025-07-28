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
    
    .section-card {
        background-color: white;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    .section-title {
        color: #1A5A9E;
        font-size: 1.50rem;
        font-weight: 600;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .info-label {
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .info-value {
        font-weight: 500;
    }
</style>

<script lang="ts">
    import Header from '../../../../../../components/Header.svelte';
    import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
    
    // Get data from the server load function
    export let data;
    
    // Extract the main record and form data
    const { record, organizedData } = data;
    
    // Track if details are visible
    let showDetails = false;
    
    function toggleDetails() {
        showDetails = !showDetails;
    }
    
    // Handle Edit button click
    function handleEdit() {
        console.log('Edit record:', record.answer_id);
        goto(`/admin/data/fpr/${record.sc_id}/${record.answer_id}/edit`);
    }
    
    // Handle Delete button click
    async function handleDelete() {
        if (confirm(`Are you sure you want to delete this progress report for ${record.sc_name}?\nThis action cannot be undone.`)) {
            try {
                const response = await fetch(`/api/fpr/${record.sc_id}/${record.answer_id}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to delete record');
                }
                
                alert('Record deleted successfully');
                
                // Navigate back to the child's FPR listing page
                goto(`/admin/data/fpr/${record.sc_id}`);
                
            } catch (err) {
                console.error('Delete error:', err);
                alert(err instanceof Error ? err.message : 'An error occurred during deletion');
            }
        }
    }
    
    // Helper function to format date strings
    function formatDateString(dateStr: string) {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }
    
    // Helper function to render field values based on type
    function renderFieldValue(field: any) {
        if (!field.answer) return 'Not provided';
        
        switch (field.type) {
            case 'checkbox':
                try {
                    const values = JSON.parse(field.answer);
                    return Array.isArray(values) ? values.join(', ') : field.answer;
                } catch {
                    return field.answer;
                }
            case 'radio_with_other':
                try {
                    const answer = JSON.parse(field.answer);
                    return answer.value === 'other' && answer.other 
                        ? `Other: ${answer.other}` 
                        : answer.value || field.answer;
                } catch {
                    return field.answer;
                }
            default:
                return field.answer;
        }
    }

    const setPageContext:any = getContext('setPageContext');
    onMount(() => {
        setPageContext("Individual Records Management",false,true);

    })
</script>

<div class="app-container">

    <div class="content-area flex flex-col items-center pt-8 px-6 pb-8">
        <!-- Child Identification Card -->
        <div class="w-full max-w-6xl bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center justify-between mb-8">
            <div class="flex flex-col items-center md:items-start">
                <p class="text-xl mb-2">
                    <span class="font-bold">SC Name:</span> {record.sc_name}
                </p>
                <p class="text-xl">
                    <span class="font-bold">SCN:</span> {record.sc_id}
                </p>
            </div>
            <div class="flex flex-col items-center md:items-end">
                <p class="text-gray-500 mb-3">Report submitted on {formatDateString(record.created_at)}</p>
                <p class="text-gray-500 mb-3">Year: {new Date(record.created_at).getFullYear()}</p>
                
                <div class="flex gap-3">
                    <!-- Edit Button -->
                    <button 
                        class="bg-[#0C376C] hover:bg-[#0a2c56] text-white px-3 py-1.5 rounded flex items-center gap-1.5"
                        on:click={handleEdit}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    
                    <!-- View Button -->
                    <button 
                        class="bg-[#0C376C] hover:bg-[#0a2c56] text-white px-3 py-1.5 rounded flex items-center gap-1.5"
                        on:click={toggleDetails}
                    >
                        <span>View</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showDetails ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Additional details section that appears when View is clicked -->
        {#if showDetails}
            <div class="w-full max-w-6xl bg-gray-50 rounded-lg shadow p-4 mb-8 border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Created:</p>
                        <p class="font-medium">{formatDateString(record.created_at)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Filled out by:</p>
                        <p class="font-medium">{record.filled_out_by || 'Unknown'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Form version:</p>
                        <p class="font-medium">{record.forms?.version || 'N/A'}</p>
                    </div>
                    <!-- Add more details as needed -->
                </div>
                
                <div class="mt-4 flex justify-end">
                    <button 
                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1.5"
                        on:click={handleDelete}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        {/if}
        
        <!-- Form data sections -->
        {#each organizedData as section}
            <div class="w-full max-w-6xl">
                <div class="section-card">
                    <h2 class="section-title">{section.title}</h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {#each section.fields as field}
                            <div class="mb-4">
                                <div class="info-label">{field.label}:</div>
                                <div class="info-value">{renderFieldValue(field)}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>