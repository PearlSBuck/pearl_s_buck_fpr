<script lang="ts">
    // +page.svelte - Enhanced form display component with version support and fixed slug handling
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { formAnswers, loadOfflineAnswers, clearAnswers, submitAnswersToSupabase } from '$lib/stores/formAnswers';
    import Header from './Header.svelte'; // Import the Header component
    import cloneDeep from 'lodash/cloneDeep';
    import { displayedData } from '$lib/stores/formEditor';
    import {notification} from '$lib/stores/formEditor';
    import { isOnline } from '$lib/stores/online';
	import DataInput from '../DataInput.svelte';

    export let data;
    let editModeData: any;

    let editMode = false;
    let isLoading = false;
    let error: string | null = null;
    let successMessage: string | null = null;
    $: show = $notification.type !== null;

    


    // Form data for editing
    let formTitle = data.form?.title || '';

    
    onMount(() => {
		loadOfflineAnswers(); // restore from localStorage on page load
	});




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
            //all required answers were submitted successfully
            if(!validateForm(data.form.sections)){
                console.log($formAnswers);
                const success = await submitAnswersToSupabase();
                if (success) {
                    notification.set({ message: 'Successfully submitted form entry', type: 'success' });
                } else {
                    notification.set({ message: 'Form submission failed', type: 'error' });
                }
            } else{
                notification.set({ message: 'Fill all required fields', type: 'error' });
            }

            setTimeout(() => {
            notification.set({ message: '', type: null });
        }, 3000);
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

    function validateForm(sections:any) {
        const missingFields = [];

        for (const section of sections) {
            for (const field of section.fields) {
                if (field.required) {
                    const value = $formAnswers[field.id];

                    const isEmpty =
                        value === undefined || value === '' ||
                        (Array.isArray(value) && value.length === 0);

                    if (isEmpty) {
                        missingFields.push(field.label || field.name || field.id);
                    }
                }
            }
        }
        console.log(missingFields);
        return missingFields;
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
     <div
        class="fixed top-4 z-70 right-4 px-4 py-2 rounded shadow-lg text-white transition-opacity  duration-300"
        class:bg-green-600={$notification.type === 'success'}
        class:bg-red-600={$notification.type === 'error'}>
        {$notification.message}
    </div>
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
                {#if !$isOnline}
                 <div class="fixedleft-0 w-full bg-red-600 text-white z-50 py-2 shadow-md">
                    <div class="flex items-center justify-center">
                    <p class="font-semibold text-sm sm:text-base">
                        You are currently offline. Changes will be saved locally.
                    </p>
                    </div>
                </div>
                {/if}
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
                        <div class="w-full max-w-4xl mx-auto">
                        {#each $displayedData.form.sections as section, sectionIndex}
                            <div class="bg-[#F6F8FF] my-5 rounded-lg shadow-lg overflow-hidden">
                                <!-- Section Header -->
                                <div class="bg-[#474C58] text-white px-6 py-4 flex flex-row">
                                    <h2 class="text-xl font-bold">{section.title}</h2>
                                    

                                </div>
                                
                                <!-- Section Content -->
                                <div class="p-6">
                                    {#if section.fields && section.fields.length > 0}
                                        <div class="grid grid-cols-1 gap-6">
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
                                                        value={$formAnswers[field.id] ?? ''}
                                                        on:change={(e) => {
                                                            formAnswers.update((answers) => {
                                                                const updated = { ...answers };

                                                                const value = e.detail;
                                                                const isEmpty =
                                                                    value === '' ||
                                                                    value === null ||
                                                                    (Array.isArray(value) && value.length === 0);

                                                                if (isEmpty) {
                                                                    delete updated[field.id];
                                                                } else {
                                                                    updated[field.id] = value;
                                                                }

                                                                return updated;
                                                            });
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
                        </div>
                        {/if}
                    </div>
                {:else}
                    <div class="p-6 text-center py-12 text-gray-500 italic">
                        No sections in this form.
                    </div>
                {/if}
                
            </div>
            <div class='flex justify-end'>
                <button type="button" 
                        class="bg-green-600 p-4 m-2 align-right text-white font-bold rounded-md shadow-lg hover:bg-green-700" 
                        
                        on:click={() => {
                            if($isOnline){
                                printInputs();
                            } else{
                                notification.set({ message: 'Error: Cannot submit form while offline.', type: 'error' });
                            }
                        }}>
                        Submit Form
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


                                                    