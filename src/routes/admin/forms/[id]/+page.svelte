<script lang="ts">
    // +page.svelte - Enhanced form display component with version support and fixed slug handling
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { formDelta } from '$lib/stores/formEditor';
    import { originalData } from "$lib/stores/formEditor";
    import { handleConfirmEdits } from "$lib/stores/formEditor";
    import Header from './Header.svelte'; // Import the Header component
	import EditPopUp from '../editPopUp.svelte';
    import cloneDeep from 'lodash/cloneDeep';
    import { displayedData } from '$lib/stores/formEditor';
    import {notification} from '$lib/stores/formEditor';

    export let data;
    let editModeData: any;

// setups the update
    let showEditPopUp = false;
    let showDeletePopup = false;
    let showAddPopup = false;
    let showAddSectionPopup = false;
    let showDeleteSectionPopup = false;
    let showEditSectionPopup = false;
    let showEditOrderPopup = false;
    let selectedField:any;
    let selectedFieldId:any;
    let selectedSection:any;
    let selectedSectionId: any;
    let selectedForm: any;
    let toReorder: any;
    let fieldsToReorder:any;
    let showEditFieldOrderPopup: any;
    
    // handles popup visibility

    

    // Popup Notificaiton for update
    async function call_confirm_edits(formId: string) {
        let status = await handleConfirmEdits(formId);

        if (status) {
            console.log('worked');
            notification.set({ message: 'All changes applied successfully', type: 'success' });
        } else {
            notification.set({ message: 'Update unsuccessful', type: 'error' });
        }

        editMode = false;
        data = editModeData;
        displayedData.set(data);

        // Auto-clear after 3 seconds
        setTimeout(() => {
            notification.set({ message: '', type: null });
        }, 3000);
        
    }
    $: show = $notification.type !== null;


    function togglePopup(type:string, id?:string, component?: any, items?: []) {
        switch(type){
            case 'editField':
                showEditPopUp = !showEditPopUp;
                selectedField = component;
                selectedFieldId = id;
                break;
            case 'deleteField':
                showDeletePopup = !showDeletePopup;
                selectedFieldId = id;
                selectedField = component;
                break;
            case 'addField':
                showAddPopup = !showAddPopup;
                selectedSectionId = id;
                break;
            case 'addSection':
                showAddSectionPopup = !showAddSectionPopup;
                selectedForm = id;
                break;
            case 'editSection':
                showEditSectionPopup = !showEditSectionPopup;
                selectedForm = id;
                selectedSection = component;
                break;    
            case 'deleteSection':
                showDeleteSectionPopup = !showDeleteSectionPopup;
                selectedSectionId = id;
                selectedSection = component;
                break;
            case 'editOrder':
                showEditOrderPopup = !showEditOrderPopup;
                toReorder = items;
                selectedForm = id;
                break;
            case 'editFieldOrder':
                showEditFieldOrderPopup = !showEditFieldOrderPopup;
                fieldsToReorder = items;
                selectedForm = id;
        }
        
    }



    let editMode = false;
    let isLoading = false;
    let error: string | null = null;
    let successMessage: string | null = null;
    
    


    // Track "Others" text field values for radio_with_other fields
    let otherTextValues: { [key: string]: string } = {};
    let originalOtherTextValues: { [key: string]: string } = {};

    // Form data for editing
    let formTitle = data.form?.title || '';
    let formVersion = data.form?.version || 1.0;

    



    function getInitialFieldValue(field: any) {
        if (field.type === 'checkbox' || field.type === 'multiple_choice') {
            // Handle checkbox arrays
            if (field.value && typeof field.value === 'string') {
                return field.value.split(',').map((v: string) => v.trim()).filter(Boolean);
            }
            return field.value || [];
        }
        
        if (field.type === 'multiple_choice') {
            // Handle multiple choice - single selection only (like radio)
            return field.value || '';
        }
        
        // Ensure text fields always have a string value, never undefined/null
        return field.value || '';
    }

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

    function toggleEditMode() {
        editMode = !editMode;
        editModeData = cloneDeep(data); 
        if(displayedData){
            console.log('displayedData loaded successfully', $displayedData.form);
        }
        else{
            console.log('displayedData failed to load');
        }
        if (!editMode) {
            // Reset values when canceling edit
            formTitle = data.form?.title || '';
            formVersion = data.form?.version || 1.0;
        }
        
        clearMessages();
    }

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

    function getDisplayTitle(form: any) {
    if (!form) return 'Form View';
    
    const title = form.title?.toLowerCase() || '';
    
    // Check if it's a Family Introduction Sheet (FIS)
    if (title.includes('fis') || title.includes('family introduction sheet')) {
        return 'Family Introduction Sheet';
    }
    
    // Check if it's a Family Progress Report (FPR)
    if (title.includes('fpr') || title.includes('family progress report')) {
        return 'Family Progress Report';
    }
    
    // Default to the original title
    return form.title || 'Form View';
}

    function clearMessages() {
        error = null;
        successMessage = null;
    }




  
    

    function getTotalFieldsCount(): number {
        if (!formSections) return 0;
        return formSections.reduce((acc: number, section: any) => {
            if (section.repeatable && section.instances) {
                return acc + section.instances.reduce((instAcc: number, inst: any) => instAcc + (inst.fields?.length || 0), 0);
            }
            return acc + (section.fields?.length || 0);
        }, 0);
    }

    // Check if field type should always be editable (text inputs, textareas, etc.)
    function isTextFieldType(fieldType: string): boolean {
        return ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea'].includes(fieldType);
    }

    // Check if field type should always be editable (including select, dropdown, radio, checkbox, and multiple_choice)
    function isAlwaysEditableField(fieldType: string): boolean {
        return ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea', 'select', 'dropdown', 'radio', 'checkbox', 'radio_with_other', 'multiple_choice', 'date'].includes(fieldType);
    }

    // Generate the form slug for URL (matches server-side createSlug function)
    function generateFormSlug(title: string, version: number): string {
        const cleanTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
        return `${cleanTitle}-${version}`;
    }

    // Parse form name and version from slug (matches server-side parseFormSlug)
    function parseFormSlug(slug: string): { name: string, version: number } {
        // Handle URL-encoded spaces and normalize
        const normalizedSlug = decodeURIComponent(slug).trim();
        
        // Try multiple version patterns
        const patterns = [
            /^(.+?)-v(\d+(?:\.\d+)?)$/,     // name-v1.0
            /^(.+?)-(\d+(?:\.\d+)?)$/,      // name-1.0
            /^(.+?)\+v?(\d+(?:\.\d+)?)$/    // name+1.0 or name+v1.0
        ];
        
        for (const pattern of patterns) {
            const match = normalizedSlug.match(pattern);
            if (match) {
                const [, nameSlug, version] = match;
                return { 
                    name: nameSlug, 
                    version: parseFloat(version) 
                };
            }
        }
        
        // If no version pattern found, assume it's a title and version 1.0
        return { 
            name: normalizedSlug, 
            version: 1.0 
        };
    }

    // Get the current form slug from URL params
    $: currentFormSlug = $page.params.id || '';
    
    // Parse form name and version from current slug
    $: parsedSlug = parseFormSlug(currentFormSlug);

    // Helper function to create a proper slug from title (matches server-side)
    function createSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Returns a display value for a field (for read-only mode)
    
</script>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<div class="bg-[#F6F8FF] min-h-screen">
    <!-- Main Content Container -->
     {#if show}
    <div
        class="fixed top-4 z-70 right-4 px-4 py-2 rounded shadow-lg text-white transition-opacity duration-300"
        class:bg-green-600={$notification.type === 'success'}
        class:bg-red-600={$notification.type === 'error'}>
        {$notification.message}
    </div>
    {/if}
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
                            <div><strong>Sections:</strong> {formSections.length}</div>
                            <div><strong>Fields:</strong> {getTotalFieldsCount()}</div>
                            <div><strong>Household Members:</strong> {householdMemberCount}</div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-wrap gap-3 items-center">
                            {#if editMode}
                                {#if hasChanges}
                                    <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium border border-yellow-300">
                                        ⚠️ Unsaved changes
                                    </div>
                                {/if}
                                
                                

                                <!-- Edit Mode Buttons -->
                                
                                <button type="button" class="bg-red-600 text-white font-bold px-4 py-1 rounded-md shadow-lg hover:bg-red-700" on:click={toggleEditMode}>
                                    Cancel
                                </button>
                                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" 
                                    on:click={() => {togglePopup('editOrder', data.form.id, undefined, $displayedData.form.sections)}}
                                >
                                    Reorder Sections
                                </button>
                                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => call_confirm_edits(data.form.id)}>
                                    Confirm All Changes
                                </button>
                            {:else}
                                <button type="button" class="bg-[#1A5A9E] text-white font-bold px-4 py-2 rounded-md shadow-lg hover:bg-blue-700" on:click={toggleEditMode}>
                                    Edit Form
                                </button>
                            {/if}
                        </div>
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
                {#if formSections && formSections.length > 0}
                    <div class="p-6 space-y-8">
                        {#if $displayedData?.form}
                            {#each $displayedData.form.sections.slice().sort((a:any, b:any) => a.orderindex - b.orderindex) as section, sectionIndex (section.id || sectionIndex)}
                            <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden">
                                <!-- Section Header -->
                                <div class="bg-[#474C58] text-white px-6 py-4 flex justify-between items-center">
                                    <h2 class="text-xl font-bold">{section.title}</h2>
                                    {#if editMode}
                                    <div class="relative z-50 flex items-end">
                                        <button
                                            class="m-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition items-center justify-center w-9 h-9" aria-label="Edit Section"
                                            on:click={() => togglePopup('editSection', section.id, section)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                                                <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                                                <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                        </button>
                                        <button class="m-1 p-2 bg-red-600 text-white rounded hover:bg-red-700 transition items-center justify-center w-9 h-9" aria-label="Delete section" on:click={() => togglePopup('deleteSection', section.id, section)}>
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                                                <path d="M10 11V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
                                                <path d="M4 7H20" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
                                                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                        </button>
                                        <button class="m-1 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition items-center justify-center w-9 h-9" aria-label="Add Field" on:click={() => togglePopup('addField', section.id)}>
                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                                <g id="SVGRepo_iconCarrier"> <title></title> <g id="Complete"> <g data-name="add" id="add-2"> <g> <line fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="19" y2="5"></line> 
                                                <line fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="5" x2="19" y1="12" y2="12"></line> </g> </g> </g> </g></svg>
                                        </button>
                                        <button class="m-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition items-center justify-center w-9 h-9" aria-label="Reorder Fields"
                                            on:click={() => {togglePopup('editFieldOrder', data.form.id, undefined, section.fields)}}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                                                <path d="M2 17.5C2 16.5654 2 16.0981 2.20096 15.75C2.33261 15.522 2.52197 15.3326 2.75 15.201C3.09808 15 3.56538 15 4.5 15C5.43462 15 5.90192 15 6.25 15.201C6.47803 15.3326 6.66739 15.522 6.79904 15.75C7 16.0981 7 16.5654 7 17.5C7 18.4346 7 18.9019 6.79904 19.25C6.66739 19.478 6.47803 19.6674 6.25 19.799C5.90192 20 5.43462 20 4.5 20C3.56538 20 3.09808 20 2.75 19.799C2.52197 19.6674 2.33261 19.478 2.20096 19.25C2 18.9019 2 18.4346 2 17.5Z" stroke="#ffffff" stroke-width="1.5"></path> 
                                                <path d="M9.5 17.5C9.5 16.5654 9.5 16.0981 9.70096 15.75C9.83261 15.522 10.022 15.3326 10.25 15.201C10.5981 15 11.0654 15 12 15C12.9346 15 13.4019 15 13.75 15.201C13.978 15.3326 14.1674 15.522 14.299 15.75C14.5 16.0981 14.5 16.5654 14.5 17.5C14.5 18.4346 14.5 18.9019 14.299 19.25C14.1674 19.478 13.978 19.6674 13.75 19.799C13.4019 20 12.9346 20 12 20C11.0654 20 10.5981 20 10.25 19.799C10.022 19.6674 9.83261 19.478 9.70096 19.25C9.5 18.9019 9.5 18.4346 9.5 17.5Z" stroke="#ffffff" stroke-width="1.5"></path> <path d="M17 17.5C17 16.5654 17 16.0981 17.201 15.75C17.3326 15.522 17.522 15.3326 17.75 15.201C18.0981 15 18.5654 15 19.5 15C20.4346 15 20.9019 15 21.25 15.201C21.478 15.3326 21.6674 15.522 21.799 15.75C22 16.0981 22 16.5654 22 17.5C22 18.4346 22 18.9019 21.799 19.25C21.6674 19.478 21.478 19.6674 21.25 19.799C20.9019 20 20.4346 20 19.5 20C18.5654 20 18.0981 20 17.75 19.799C17.522 19.6674 17.3326 19.478 17.201 19.25C17 18.9019 17 18.4346 17 17.5Z" stroke="#ffffff" stroke-width="1.5"></path> 
                                                <path d="M4.5 15V9C4.5 6.64298 4.5 5.46447 5.23223 4.73223C5.96447 4 7.14298 4 9.5 4H14.5C16.857 4 18.0355 4 18.7678 4.73223C19.5 5.46447 19.5 6.64298 19.5 9V12M19.5 12L21.5 10M19.5 12L17.5 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                        </button>
                                    </div>    
                                    {/if}

                                </div>
                                
                                <!-- Section Content -->
                                <div class="p-6">
                                    {#if section.fields && section.fields.length > 0}
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {#each section.fields as field, i (field.id || i)}
                                                <div class="space-y-2">
                                                    <label class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm" for={"field-" + field.id}>
                                                        {field.label}
                                                        {#if field.required}
                                                            <span class="text-red-600">*</span>
                                                        {/if}
                                                        <!-- buttons for editing and deleting a field -->
                                                        {#if editMode}
                                                        <button
                                                            class="m-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition items-center justify-center w-9 h-9" aria-label="Edit Field"
                                                            on:click={() => togglePopup('editField', field.id, field)}
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                                                                <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                                                                <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                                        </button>
                                                        <button
                                                            class="m-1 p-2 bg-red-600 text-white rounded hover:bg-red-700 transition items-center justify-center w-9 h-9" aria-label="Delete Field"  on:click={() => togglePopup('deleteField', field.id, field)}
                                                        >
                                                             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                                                                <path d="M10 11V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
                                                                <path d="M4 7H20" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
                                                                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                                        </button>
                                                        
                                                        {/if}

                                                    </label>
                                                
                                                    <!-- edit mode of each text field -->
                                                    {#if editMode || isAlwaysEditableField(field.type)}
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
                                                        {:else if field.type === 'select' && (editMode || isAlwaysEditableField(field.type))}
                                                            <select
                                                                id={"field-" + field.id}
                                                                class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                                required={field.required}
                                                                on:focus={clearMessages}
                                                            >
                                                                <option value="">Select an option...</option>
                                                                {#if field.options && Array.isArray(field.options)}
                                                                    {#each field.options as option}
                                                                        <option value={typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option}>
                                                                            {typeof option === 'object' ? option.label : option}
                                                                        </option>
                                                                    {/each}
                                                                {/if}
                                                            </select>
                                                        {:else if field.type === 'multiple_choice' && (editMode || isAlwaysEditableField(field.type))}
                                                            <div class="space-y-3">
                                                                {#if field.options && Array.isArray(field.options)}
                                                                    {#each field.options as option, i}
                                                                        <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-choice-" + i}>
                                                                            <input
                                                                                id={"field-" + field.id + "-choice-" + i}
                                                                                type="radio"
                                                                                class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E]"
                                                                                bind:group={fieldValues[field.id]}
                                                                                value={typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option}
                                                                                required={field.required}
                                                                                on:focus={clearMessages}
                                                                            />
                                                                            <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                        </label>
                                                                    {/each}
                                                                {/if}
                                                            </div>
                                                        {:else if field.type === 'radio' && (editMode || isAlwaysEditableField(field.type))}
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
                                                        
                                                        {:else if (field.type === 'checkbox' || field.type === 'multiple_choice') && (editMode || isAlwaysEditableField(field.type))}
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
                                                        {:else if field.type === 'date'}
                                                            <!-- Date field -->
                                                            <input
                                                                id={"field-" + field.id}
                                                                class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                                type="date"
                                                                bind:value={fieldValues[field.id]}
                                                                required={field.required}
                                                                on:focus={clearMessages}
                                                                disabled={false}
                                                                readonly={false}
                                                            />
                                                        {:else if field.type === 'datetime-local'}
                                                            <!-- DateTime field -->
                                                            <input
                                                                id={"field-" + field.id}
                                                                class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                                type="datetime-local"
                                                                bind:value={fieldValues[field.id]}
                                                                required={field.required}
                                                                on:focus={clearMessages}
                                                                disabled={false}
                                                                readonly={false}
                                                            />
                                                        {:else if field.type === 'time'}
                                                            <!-- Time field -->
                                                            <input
                                                                id={"field-" + field.id}
                                                                class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                                type="time"
                                                                bind:value={fieldValues[field.id]}
                                                                required={field.required}
                                                                on:focus={clearMessages}
                                                                disabled={false}
                                                                readonly={false}
                                                            />
                                                        {:else if isTextFieldType(field.type)}
                                                            <!-- Always editable text fields -->
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
<EditPopUp 
    bind:field={selectedField} 
    bind:section={selectedSection}
    bind:fieldId={selectedFieldId}
    bind:sectionId={selectedSectionId}
    bind:formId = {selectedForm}
    bind:openEditPopup={showEditPopUp}
    bind:openDeletePopup={showDeletePopup}   
    bind:openAddPopup={showAddPopup}
    bind:openAddSectionPopup = {showAddSectionPopup}
    bind:openDeleteSectionPopup = {showDeleteSectionPopup}
    bind:openEditSectionPopup = {showEditSectionPopup}
    bind:openEditOrderPopup = {showEditOrderPopup}
    bind:openEditFieldOrderPopup = {showEditFieldOrderPopup}
    bind:displayedFormData = {$displayedData.form}
    bind:items = {toReorder}
    bind:fieldItems = {fieldsToReorder}
/>
{#if editMode}
    <div class='flex justify-end'>
        <button class="m-5 p-2 text-xl bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => togglePopup('addSection', $displayedData.form.id)}>Add Section</button>
    </div>
{/if}


                                                    
