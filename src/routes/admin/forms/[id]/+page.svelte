<script lang="ts">
    // +page.svelte - Enhanced form display component with version support and fixed slug handling
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Header from './Header.svelte'; // Import the Header component
	import EditPopUp from '../editPopUp.svelte';
    export let data;

// 
    let showPopup = false;
    let selectedField:any;
  function togglePopup(field:any) {
    showPopup = !showPopup;
    selectedField = field;
  }

// 

    let editMode = false;
    let isLoading = false;
    let error: string | null = null;
    let successMessage: string | null = null;
    let fieldValues: { [key: string]: any } = {};
    let originalFieldValues: { [key: string]: any } = {};
    
    // Track "Others" text field values for radio_with_other fields
    let otherTextValues: { [key: string]: string } = {};
    let originalOtherTextValues: { [key: string]: string } = {};

    // Form data for editing
    let formTitle = data.form?.title || '';
    let formVersion = data.form?.version || 1.0;

    onMount(() => {
        if (data.form) {
            console.log('Initializing form with', data.form.sections.length, 'sections');
            console.log('Form version:', data.form.version);
            // Initialize field values
            data.form.sections.forEach((section: any) => {
                console.log(`Section "${section.title}" has ${section.fields.length} fields`);
                section.fields.forEach((field: any) => {
                    const initialValue = getInitialFieldValue(field);
                    fieldValues[field.id] = initialValue;
                    originalFieldValues[field.id] = initialValue;
                    
                    // Initialize "Others" text values for radio_with_other fields
                    if (field.type === 'radio_with_other') {
                        otherTextValues[field.id] = field.otherValue || '';
                        originalOtherTextValues[field.id] = field.otherValue || '';
                    }
                });
            });
            console.log('Initialized field values:', Object.keys(fieldValues).length, 'fields');
        }
    });

    function getInitialFieldValue(field: any) {
        if (field.type === 'checkbox') {
            // Handle checkbox arrays
            if (field.value && typeof field.value === 'string') {
                return field.value.split(',').map((v: string) => v.trim()).filter(Boolean);
            }
            return field.value || [];
        }
        // Ensure text fields always have a string value, never undefined/null
        return field.value || '';
    }

    function toggleEditMode() {
        editMode = !editMode;
        if (!editMode) {
            // Reset values when canceling edit
            formTitle = data.form?.title || '';
            formVersion = data.form?.version || 1.0;
            fieldValues = { ...originalFieldValues };
            otherTextValues = { ...originalOtherTextValues };
        }
        clearMessages();
    }

    function hasChanges(): boolean {
        if (formTitle !== data.form?.title) return true;
        if (formVersion !== data.form?.version) return true;
        
        // Check regular field changes
        const fieldChanges = Object.keys(fieldValues).some(fieldId => {
            const current = fieldValues[fieldId];
            const original = originalFieldValues[fieldId];
            
            // Handle array comparison for checkboxes
            if (Array.isArray(current) && Array.isArray(original)) {
                return JSON.stringify(current.sort()) !== JSON.stringify(original.sort());
            }
            
            return current !== original;
        });
        
        // Check "Others" text field changes
        const otherTextChanges = Object.keys(otherTextValues).some(fieldId => {
            return otherTextValues[fieldId] !== originalOtherTextValues[fieldId];
        });
        
        return fieldChanges || otherTextChanges;
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

    function handleCheckboxChange(fieldId: string, optionValue: string, checked: boolean) {
        if (!fieldValues[fieldId]) {
            fieldValues[fieldId] = [];
        } else if (typeof fieldValues[fieldId] === 'string') {
            fieldValues[fieldId] = fieldValues[fieldId] ? fieldValues[fieldId].split(',').map((v: string) => v.trim()) : [];
        }
        
        if (checked) {
            if (!fieldValues[fieldId].includes(optionValue)) {
                fieldValues[fieldId] = [...fieldValues[fieldId], optionValue];
            }
        } else {
            fieldValues[fieldId] = fieldValues[fieldId].filter((val: string) => val !== optionValue);
        }
    }

    function isCheckboxChecked(fieldId: string, optionValue: string): boolean {
        if (!fieldValues[fieldId]) return false;
        if (typeof fieldValues[fieldId] === 'string') {
            return fieldValues[fieldId].split(',').includes(optionValue);
        }
        return Array.isArray(fieldValues[fieldId]) && fieldValues[fieldId].includes(optionValue);
    }

    // Handle radio_with_other field changes
    function handleRadioWithOtherChange(fieldId: string, value: string, field: any) {
        fieldValues[fieldId] = value;
        
        // If "Others" is selected, clear the text field; if not, clear the text field
        const otherOption = field.options?.find((opt: any) => 
            typeof opt === 'object' && opt.showTextField === true
        );
        
        if (otherOption && value === (typeof otherOption === 'object' ? otherOption.value : otherOption)) {
            // "Others" selected - keep the text field value
        } else {
            // Non-"Others" selected - clear the text field
            otherTextValues[fieldId] = '';
        }
    }

    // Check if "Others" option is selected for radio_with_other
    function isOthersSelected(fieldId: string, field: any): boolean {
        const selectedValue = fieldValues[fieldId];
        const otherOption = field.options?.find((opt: any) => 
            typeof opt === 'object' && opt.showTextField === true
        );
        
        return otherOption && selectedValue === (typeof otherOption === 'object' ? otherOption.value : otherOption);
    }

    function getTotalFieldsCount(): number {
        if (!data.form?.sections) return 0;
        return data.form.sections.reduce((acc: number, section: any) => acc + (section.fields?.length || 0), 0);
    }

    // Check if field type should always be editable (text inputs, textareas, etc.)
    function isTextFieldType(fieldType: string): boolean {
        return ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea'].includes(fieldType);
    }

    // Check if field type should always be editable (including select, dropdown, radio, and checkbox)
    function isAlwaysEditableField(fieldType: string): boolean {
        return ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea', 'select', 'dropdown', 'radio', 'checkbox', 'radio_with_other'].includes(fieldType);
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
    function getFieldDisplayValue(field: any): string {
        const value = fieldValues[field.id];
        
        if (field.type === 'checkbox') {
            if (Array.isArray(value) && value.length > 0) {
                // Map option values to labels if possible
                if (field.options && Array.isArray(field.options)) {
                    return value
                        .map((val: string) => {
                            const opt = field.options.find((o: any) =>
                                typeof o === 'object' ? o.value === val : o === val
                            );
                            return typeof opt === 'object' ? opt.label : opt || val;
                        })
                        .join(', ');
                }
                return value.join(', ');
            }
            return 'No value';
        }
        
        if (field.type === 'radio' || field.type === 'select' || field.type === 'dropdown') {
            if (value) {
                if (field.options && Array.isArray(field.options)) {
                    const opt = field.options.find((o: any) =>
                        typeof o === 'object' ? o.value === value : o === value
                    );
                    return typeof opt === 'object' ? opt.label : opt || value;
                }
                return value;
            }
            return 'No value';
        }
        
        if (field.type === 'radio_with_other') {
            if (value) {
                if (field.options && Array.isArray(field.options)) {
                    const opt = field.options.find((o: any) =>
                        typeof o === 'object' ? o.value === value : o === value
                    );
                    
                    // If this is the "Others" option and there's text input
                    if (typeof opt === 'object' && opt.showTextField && otherTextValues[field.id]) {
                        return `${opt.label}: ${otherTextValues[field.id]}`;
                    }
                    
                    return typeof opt === 'object' ? opt.label : opt || value;
                }
                return value;
            }
            return 'No value';
        }
        
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
        return 'No value';
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
                        <div class="flex flex-wrap gap-3 items-center">
                            {#if editMode}
                                {#if hasChanges()}
                                    <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium border border-yellow-300">
                                        ⚠️ Unsaved changes
                                    </div>
                                {/if}
                                
                                <!-- Save Form Title -->
                                <form method="POST" action="?/updateForm" use:enhance={() => {
                                    isLoading = true;
                                    return async ({ result }) => {
                                        isLoading = false;
                                        if (result.type === 'success') {
                                            successMessage = 'Form title updated successfully!';
                                            data.form.title = formTitle;
                                        } else if (result.type === 'failure') {
                                            error = typeof result.data?.message === 'string' ? result.data.message : 'Failed to update form';
                                        }
                                    };
                                }}>
                                    <input type="hidden" name="formId" value={data.form.id} />
                                    <input type="hidden" name="title" value={formTitle} />
                                    <button type="submit" class="bg-[#1A5A9E] text-white font-bold px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || formTitle === data.form.title}>
                                        {#if isLoading}
                                            <span class="spinner inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        {/if}
                                        Save Title
                                    </button>
                                </form>

                                <!-- Save All Fields -->
                                <form method="POST" action="?/saveAllFields" use:enhance={() => {
                                    isLoading = true;
                                    return async ({ result }) => {
                                        isLoading = false;
                                        if (result.type === 'success') {
                                            successMessage = 'All fields saved successfully!';
                                            // Update original values
                                            originalFieldValues = { ...fieldValues };
                                            originalOtherTextValues = { ...otherTextValues };
                                            // Update form data
                                            data.form.sections.forEach((section: any) => {
                                                section.fields.forEach((field: any) => {
                                                    field.value = fieldValues[field.id] || '';
                                                    if (field.type === 'radio_with_other') {
                                                        field.otherValue = otherTextValues[field.id] || '';
                                                    }
                                                });
                                            });
                                        } else if (result.type === 'failure') {
                                            error = typeof result.data?.message === 'string'
                                                ? result.data.message
                                                : 'Failed to save fields';
                                        }
                                    };
                                }}>
                                    <input type="hidden" name="formId" value={data.form.id} />
                                    {#each data.form.sections as section}
                                        {#each section.fields as field}
                                            <input type="hidden" name="field_{field.id}" value={Array.isArray(fieldValues[field.id]) ? fieldValues[field.id].join(',') : (fieldValues[field.id] || '')} />
                                            {#if field.type === 'radio_with_other'}
                                                <input type="hidden" name="field_{field.id}_other" value={otherTextValues[field.id] || ''} />
                                            {/if}
                                        {/each}
                                    {/each}
                                    <button type="submit" class="bg-green-600 text-white font-bold px-4 py-2 rounded-md shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !hasChanges()}>
                                        {#if isLoading}
                                            <span class="spinner inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        {/if}
                                        Save All Fields
                                    </button>
                                </form>

                                <button type="button" class="bg-red-600 text-white font-bold px-4 py-2 rounded-md shadow-lg hover:bg-red-700" on:click={toggleEditMode}>
                                    Cancel
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
                {#if data.form.sections && data.form.sections.length > 0}
                    <div class="p-6 space-y-8">
                        {#each data.form.sections as section, sectionIndex}
                            <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden">
                                <!-- Section Header -->
                                <div class="bg-[#474C58] text-white px-6 py-4">
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
                                                        {#if editMode}
                                                        <button
                                                            class="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                            on:click={() => togglePopup(field)}
                                                        >
                                                            Edit
                                                        </button>

                                                        
                                                        {/if}

                                                    </label>
                                                
                                                    <!-- -------------------------------------------------------------------------------------------------------------------------------
                                                     
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    -->
                                                    <!-- edit mode of each text field -->
                                                    {#if editMode || isAlwaysEditableField(field.type)}
                                                        {#if field.type === 'textarea'}
                                                            <textarea
                                                                id={"field-" + field.id}
                                                                class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                                bind:value={fieldValues[field.id]}
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
                                                                bind:value={fieldValues[field.id]}
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
                                                        {:else if field.type === 'radio' && (editMode || isAlwaysEditableField(field.type))}
                                                            <div class="space-y-3">
                                                                {#if field.options && Array.isArray(field.options)}
                                                                    {#each field.options as option, i}
                                                                        <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-radio-" + i}>
                                                                            <input
                                                                                id={"field-" + field.id + "-radio-" + i}
                                                                                type="radio"
                                                                                class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E]"
                                                                                bind:group={fieldValues[field.id]}
                                                                                value={typeof option === 'object' ? option.value : option}
                                                                                required={field.required}
                                                                                on:focus={clearMessages}
                                                                            />
                                                                            <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                        </label>
                                                                    {/each}
                                                                {/if}
                                                            </div>
                                                        {:else if field.type === 'radio_with_other' && (editMode || isAlwaysEditableField(field.type))}
                                                            <div class="space-y-3">
                                                                {#if field.options && Array.isArray(field.options)}
                                                                    {#each field.options as option, i}
                                                                        <div class="space-y-2">
                                                                            <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-radio-" + i}>
                                                                                <input
                                                                                    id={"field-" + field.id + "-radio-" + i}
                                                                                    type="radio"
                                                                                    class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E]"
                                                                                    value={typeof option === 'object' ? option.value : option}
                                                                                    checked={fieldValues[field.id] === (typeof option === 'object' ? option.value : option)}
                                                                                    required={field.required}
                                                                                    on:change={() => handleRadioWithOtherChange(field.id, typeof option === 'object' ? option.value : option, field)}
                                                                                    on:focus={clearMessages}
                                                                                />
                                                                                <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                            </label>
                                                                            
                                                                            <!-- Show text input if this option has showTextField = true and is selected -->
                                                                            {#if typeof option === 'object' && option.showTextField && fieldValues[field.id] === option.value}
                                                                                <div class="ml-7 mt-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        class="w-full p-2 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none text-sm"
                                                                                        bind:value={otherTextValues[field.id]}
                                                                                        placeholder={option.textFieldPlaceholder || 'Please specify...'}
                                                                                        on:focus={clearMessages}
                                                                                    />
                                                                                </div>
                                                                            {/if}
                                                                        </div>
                                                                    {/each}
                                                                {/if}
                                                            </div>
                                                        {:else if field.type === 'checkbox' && (editMode || isAlwaysEditableField(field.type))}
                                                            <div class="space-y-3">
                                                                {#if field.options && Array.isArray(field.options)}
                                                                    {#each field.options as option, i}
                                                                        <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-checkbox-" + i}>
                                                                            <input
                                                                                id={"field-" + field.id + "-checkbox-" + i}
                                                                                type="checkbox"
                                                                                class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E] rounded"
                                                                                checked={isCheckboxChecked(field.id, typeof option === 'object' ? option.value : option)}
                                                                                on:change={(e) => handleCheckboxChange(
                                                                                    field.id,
                                                                                    typeof option === 'object' ? option.value : option,
                                                                                    e.target ? (e.target as HTMLInputElement).checked : false
                                                                                )}
                                                                            />
                                                                            <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                        </label>
                                                                    {/each}
                                                                {/if}
                                                            </div>
                                                        {:else if isTextFieldType(field.type)}
                                                            <!-- Always editable text fields -->
                                                            <input
                                                                id={"field-" + field.id}
                                                                class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                                type={field.type}
                                                                bind:value={fieldValues[field.id]}
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
                                                                bind:value={fieldValues[field.id]}
                                                                placeholder={field.placeholder || 'Enter value...'}
                                                                required={field.required}
                                                                on:focus={clearMessages}
                                                                disabled={false}
                                                                readonly={false}
                                                            />
                                                        {/if}
                                                    {:else}
                                                    <!-- Read-only display for non-text fields -->
                                                        <div class="w-full p-3 rounded-md bg-gray-100 border shadow-sm text-gray-700 min-h-[48px] flex items-center {getFieldDisplayValue(field) === 'No value' ? 'italic text-gray-500' : ''}">
                                                            {getFieldDisplayValue(field)}
                                                        </div>
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
    bind:open={showPopup}
    />

<style>
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
        .animate-spin {
            animation: spin 1s linear infinite;
        }
</style>


                                                    