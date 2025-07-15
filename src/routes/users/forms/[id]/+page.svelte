<script lang="ts">
    // +page.svelte - Enhanced form display component with version support and fixed slug handling
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { formDelta } from '$lib/stores/formEditor';
    import Header from './Header.svelte'; // Import the Header component
    import cloneDeep from 'lodash/cloneDeep';
    import { displayedData } from '$lib/stores/formEditor';
    import {notification} from '$lib/stores/formEditor';

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
    $: hasChanges = ($formDelta.fields.length > 0 || $formDelta.sections.length > 0);
    

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
                                                    <label class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm" for={"field-" + field.id}>
                                                        {field.label}
                                                        {#if field.required}
                                                            <span class="text-red-600">*</span>
                                                        {/if}
                                                        

                                                    </label>

                                                    {#if field.type === 'textarea'}
                                                        <textarea
                                                            id={"field-" + field.id}
                                                            class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                            placeholder={field.placeholder || 'Enter value...'}
                                                            required={field.required}
                                                            rows="4"
                                                            on:focus={clearMessages}
                                                            disabled={false}
                                                            readonly={false}
                                                        ></textarea>
                                                    {:else if field.type === 'select'}
                                                        <select
                                                            id={"field-" + field.id}
                                                            class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                            required={field.required}
                                                            on:focus={clearMessages}
                                                        >
                                                            <option value="">Select an option...</option>
                                                            {#if field.options && Array.isArray(field.options)}
                                                                {#each field.options as option}
                                                                    <option value={typeof option === 'object' ? option.value : option}>
                                                                        {typeof option === 'object' ? option.label : option}
                                                                    </option>
                                                                {/each}
                                                            {/if}
                                                        </select>
                                                    {:else if field.type === 'radio'}
                                                        <div class="space-y-3">
                                                            {#if field.options && Array.isArray(field.options)}
                                                                {#each field.options as option, i}
                                                                    {#if option.label != 'Others'}
                                                                    <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-radio-" + i}>
                                                                        <input
                                                                            id={"field-" + field.id + "-radio-" + i}
                                                                            type="radio"
                                                                            class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E]"
                                                                            value={typeof option === 'object' ? option.value : option}
                                                                            required={field.required}
                                                                            on:focus={clearMessages}
                                                                        />
                                                                        <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                    </label>

                                                                    {:else}
                                                                        <div class="flex items-center">
                                                                            <input
                                                                                id={"field-" + field.id + "-radio-" + i}
                                                                                type="radio"
                                                                                class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E]"
                                                                                value={typeof option === 'object' ? option.value : option}
                                                                                required={field.required}
                                                                                on:focus={clearMessages}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                class="w-full ml-2 p-2 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none text-sm"
                                                                                placeholder={'Please specify...'}
                                                                            />
                                                                        </div>
                                                                    {/if}
                                                                {/each}
                                                            {/if}
                                                        </div>
                                                    
                                                    {:else if (field.type === 'checkbox' || field.type === 'multiple_choice')}
                                                        <div class="space-y-3">
                                                            {#if field.options && Array.isArray(field.options)}
                                                                {#each field.options as option, i}
                                                                    {#if option.label != 'Others'}
                                                                    <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-checkbox-" + i}>
                                                                        <input
                                                                            id={"field-" + field.id + "-checkbox-" + i}
                                                                            type="checkbox"
                                                                            class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E] rounded"
                                                                        />
                                                                        <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                    </label>
                                                                    {:else}
                                                                        <div class="flex items-center">
                                                                            <input
                                                                                id={"field-" + field.id + "-checkbox-" + i}
                                                                                type="checkbox"
                                                                                class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E] rounded"
                                                                                value={typeof option === 'object' ? option.value : option}
                                                                                required={field.required}
                                                                                on:focus={clearMessages}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                class="w-full ml-2 p-2 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none text-sm"
                                                                                placeholder={'Please specify...'}
                                                                                disabled={false}                                                                                
                                                                            />
                                                                        </div>
                                                                    {/if}
                                                                {/each}
                                                            {/if}
                                                        </div>
                                                    {:else}
                                                        <!-- Other field types in edit mode -->
                                                        <input
                                                            id={"field-" + field.id}
                                                            class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                            type={field.type}
                                                            placeholder={field.placeholder || 'Enter value...'}
                                                            required={field.required}
                                                            on:focus={clearMessages}
                                                            disabled={false}
                                                            readonly={false}
                                                        />
                                                    {/if}
                                                    
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


                                                    