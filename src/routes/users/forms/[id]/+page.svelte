<script lang="ts">
    // +page.svelte - Enhanced form display component with version support and fixed slug handling
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { formAnswers, loadOfflineAnswers, clearAnswers, submitAnswersToSupabase } from '$lib/stores/formAnswers';
    
    import Header from './Header.svelte'; // Import the Header component
    import cloneDeep from 'lodash/cloneDeep';
    import { displayedData } from '$lib/stores/formEditor';
    import {notification} from '$lib/stores/formEditor';
	import DataInput from '../DataInput.svelte';

    export let data;
    let editModeData: any;



    

    // // Popup Notificaiton for update
    // async function call_confirm_edits(formId: string) {
    //     let status = await handleConfirmEdits(formId);

    //     if (status) {
    //         console.log('worked');
    //         notification.set({ message: 'All changes applied successfully', type: 'success' });
    //     } else {
    //         notification.set({ message: 'Update unsuccessful', type: 'error' });
    //     }

    //     editMode = false;
    //     data = editModeData;
    //     displayedData.set(data);

    //     // Auto-clear after 3 seconds
    //     setTimeout(() => {
    //         notification.set({ message: '', type: null });
    //     }, 3000);
    // }
    // $: show = $notification.type !== null;


    



    let editMode = false;
    let isLoading = false;
    let error: string | null = null;
    let successMessage: string | null = null;
    
    


    // Form data for editing
    let formTitle = data.form?.title || '';

    




    // changes the referenced fields and sections so that UI is reactive
    // [NOTE to developer]: must implement a type for form data when everything is set in stone
    $: {
    displayedData.set(editMode ? editModeData : data);
    }
    // setter function for making displayedData reactive to temporary changes
    export function setEditMode(value: boolean) {
        editMode = value;

        if (editMode) {
        editModeData = cloneDeep(data);
        } else {
        editModeData = null;
        }
    }

    // useful for form submission
    // $: hasChanges = ($formDelta.fields.length > 0 || $formDelta.sections.length > 0);
    async function printInputs(){
        try {
            console.log($formAnswers);
            const success = await submitAnswersToSupabase();
            if (success) {
                console.log('Form submitted!');
            } else {
                console.warn('Form submission failed.');
            }
        } catch(error){
            console.error(error);
        }

    }

    function formatDate(dateString: string) {
        if (!dateString) return 'No date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    function clearMessages() {
        error = null;
        successMessage = null;
    }




  
    

    function getTotalFieldsCount(): number {
        if (!data.form?.sections) return 0;
        return data.form.sections.reduce((acc: number, section: any) => acc + (section.fields?.length || 0), 0);
    }

</script>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
   

<div class="bg-[#F6F8FF] min-h-screen">
    <!-- Header Section -->

    <Header 
        name={data.form?.title || 'Form View'} 
        search={false} 
        backButton={true} 
    />
   
<!-------------- ---------------------------->
    <!-- Main Content Container -->
    <div class="pt-4">
        {#if data.form}
            <!-- Form Title Header -->
            <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-end rounded-lg h-20 mt-16 relative z-10">
                {#if editMode}
                    <input 
                        type="text" 
                        bind:value={formTitle}
                        placeholder="Form Title"
                        class="bg-white text-[#1A5A9E] px-4 py-2 mb-2 rounded-md font-bold lg:text-3xl md:text-2xl sm:text-xl text-center w-full max-w-lg mx-4"
                        on:focus={clearMessages}
                    />
                {:else}
                    <div class="mb-2">{data.form.title}</div>
                {/if}
            </div>


            <!-- Main Form Container -->
            <div class="bg-white flex flex-col rounded-lg -mt-4 relative z-0 shadow-2xl">
                <!-- Form Meta Information and Actions -->
                <div class="p-6 pt-12 border-b border-gray-200">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <!-- Form Meta Info -->
                        <div class="text-sm text-gray-600 grid grid-cols-2 gap-4">
                            <div><strong>Form ID:</strong> {data.form.id}</div>
                            <div><strong>Created:</strong> {formatDate(data.form.createdAt)}</div>
                            <div><strong>Sections:</strong> {data.form.sections.length}</div>
                            <div><strong>Fields:</strong> {getTotalFieldsCount()}</div>
                        </div>

                        <!-- Action Buttons -->

                    </div>
                </div>

                <!-- Alert Messages -->
                {#if error}
                    <div class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                {/if}

                {#if successMessage}
                    <div class="mx-6 mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
                        <span>✅</span>
                        <span>{successMessage}</span>
                    </div>
                {/if}

                <!-- Form Sections -->
                {#if data.form.sections && data.form.sections.length > 0}
                    <div class="p-6 space-y-8">
                        {#if $displayedData?.form}
                        {#each $displayedData.form.sections as section, sectionIndex}
                            <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden">
                                <!-- Section Header -->
                                <div class="bg-[#474C58] text-white px-6 py-4 flex flex-row">
                                    <h2 class="text-xl font-bold">{section.title}</h2>
                                    

                                </div>
                                
                                <!-- Section Content -->
                                <div class="p-6">
                                    {#if section.fields && section.fields.length > 0}
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {#each section.fields as field}
                                                <div class="space-y-2">
                                                    <DataInput
                                                        id={field.id}
                                                        type={field.type}
                                                        label={field.label}
                                                        name={field.name}
                                                        placeholder={field.placeholder}
                                                        required={field.required}
                                                        options={field.options}
                                                        value={$formAnswers[field.id] || ''}
                                                        on:change={(e) => {
                                                            formAnswers.update((answers) => ({
                                                                ...answers,
                                                                [field.id]: e.detail
                                                            }));
                                                        }}
                                                    />
                                                    <!-- 
                                                    The following block is commented out to avoid interfering with Svelte's block structure.
                                                    If you want to enable these field renderings, uncomment and ensure all {#each} and {#if} blocks are properly matched.
                                                    -->
                                                </div>
                                            {/each}
                                        </div>
                                    {:else}
                                        <div class="text-center py-8 text-gray-500 italic">
                                            No fields in this section.
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                        {/if}
                    </div>
                {:else}
                    <div class="p-6 text-center py-12 text-gray-500 italic">
                        No sections in this form.
                    </div>
                {/if}
                <button type="button" class="bg-red-600 text-white font-bold px-4 py-2 rounded-md shadow-lg hover:bg-red-700" on:click={printInputs}>
                    Test Submit
                </button>
            </div>
        {:else}
            <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-center rounded-lg h-20 mt-16 relative z-10">
                Form Not Found
            </div>
            <div class="bg-white flex flex-col items-center justify-center rounded-lg h-64 -mt-4 relative z-0 shadow-2xl">
                <div class="text-center py-12 text-gray-500 italic">
                    No form data found.
                </div>
            </div>
        {/if}
    </div>
</div>


                                                    