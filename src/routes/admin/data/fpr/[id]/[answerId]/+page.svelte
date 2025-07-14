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
    
    // Get data from the server load function
    export let data;
    
    // Extract the main record and form data
    const { record, organizedData } = data;
    
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
</script>

<div class="app-container">
    <!-- Header -->
    <Header name="Individual Records Management" search={false} backButton={true} />

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
            <div>
                <p class="text-gray-500">Report submitted on {formatDateString(record.created_at)}</p>
                <p class="text-gray-500">Year: {new Date(record.created_at).getFullYear()}</p>
            </div>
        </div>
        
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