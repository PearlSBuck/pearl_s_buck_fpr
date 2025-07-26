<script lang="ts">
    // +page.svelte - Enhanced form display component with household member management
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Header from '../../../../components/Header.svelte';

    export let data;

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

    // Household member management - now tracking sections instead of instances
    let formSections: any[] = [];
    let householdMemberCount = 0;

    onMount(() => {
        if (data.form) {
            console.log('Initializing form with', data.form.sections.length, 'sections');
            console.log('Form version:', data.form.version);
            
            // Initialize form sections
            formSections = [...data.form.sections];
            
            // Count existing household member sections
            householdMemberCount = formSections.filter(section => isHouseholdSection(section)).length;
            
            // Initialize field values for all sections
            formSections.forEach((section: any) => {
                console.log(`Section "${section.title}" has ${section.fields.length} fields, repeatable: ${section.repeatable}`);
                
                if (section.repeatable && section.instances) {
                    // Initialize repeatable section with instances
                    section.instances.forEach((instance: any) => {
                        instance.fields.forEach((field: any) => {
                            const initialValue = getInitialFieldValue(field);
                            fieldValues[field.name] = initialValue; // Use field.name which includes instance ID
                            originalFieldValues[field.name] = initialValue;
                            
                            if (field.type === 'radio_with_other') {
                                otherTextValues[field.name] = field.otherValue || '';
                                originalOtherTextValues[field.name] = field.otherValue || '';
                            }
                        });
                    });
                } else {
                    // Initialize regular section fields
                    section.fields.forEach((field: any) => {
                        const initialValue = getInitialFieldValue(field);
                        fieldValues[field.id] = initialValue;
                        originalFieldValues[field.id] = initialValue;
                        
                        if (field.type === 'radio_with_other') {
                            otherTextValues[field.id] = field.otherValue || '';
                            originalOtherTextValues[field.id] = field.otherValue || '';
                        }
                    });
                }
            });
            
            console.log('Initialized field values:', Object.keys(fieldValues).length, 'fields');
            console.log('Initialized household member sections:', householdMemberCount);
        }
    });

    
function getInitialFieldValue(field: any) {
        if (field.type === 'checkbox') {
            // Handle checkbox arrays - multiple selections allowed
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

    function toggleEditMode() {
        editMode = !editMode;
        if (!editMode) {
            // Reset values when canceling edit
            formTitle = data.form?.title || '';
            formVersion = data.form?.version || 1.0;
            fieldValues = { ...originalFieldValues };
            otherTextValues = { ...originalOtherTextValues };
            // Reset sections to original state
            formSections = [...data.form.sections];
            householdMemberCount = formSections.filter(section => isHouseholdSection(section)).length;
        }
        clearMessages();
    }

    function hasChanges(): boolean {
        if (formTitle !== data.form?.title) return true;
        if (formVersion !== data.form?.version) return true;
        
        // Check if sections have been added/removed
        if (formSections.length !== data.form.sections.length) return true;
        
        // Check regular field changes
        const fieldChanges = Object.keys(fieldValues).some(fieldId => {
            const current = fieldValues[fieldId];
            const original = originalFieldValues[fieldId];
            
            // Handle array comparison for checkboxes only
            if (Array.isArray(current) && Array.isArray(original)) {
                return JSON.stringify(current.sort()) !== JSON.stringify(original.sort());
            }
            
            // Handle string comparison for multiple choice, radio, etc.
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
    
    if (otherOption) {
        const otherValue = otherOption.value || otherOption.label.toLowerCase().replace(/\s+/g, '_');
        if (value === otherValue) {
            // "Others" selected - keep the text field value
        } else {
            // Non-"Others" selected - clear the text field
            otherTextValues[fieldId] = '';
        }
    }
}

    // Check if "Others" option is selected for radio_with_other
    function isOthersSelected(fieldId: string, field: any): boolean {
    const selectedValue = fieldValues[fieldId];
    const otherOption = field.options?.find((opt: any) => 
        typeof opt === 'object' && opt.showTextField === true
    );
    
    if (otherOption) {
        const otherValue = otherOption.value || otherOption.label.toLowerCase().replace(/\s+/g, '_');
        return selectedValue === otherValue;
    }
    
    return false;
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
        return ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea', 'select', 'dropdown', 'radio', 'checkbox', 'radio_with_other', 'multiple_choice', 'date', 'datetime-local', 'time'].includes(fieldType);
    }

    // Returns a display value for a field (for read-only mode)
    function getFieldDisplayValue(field: any, fieldKey: string = ''): string {
        const key = fieldKey || field.id;
        const value = fieldValues[key];
        
        if (field.type === 'checkbox') {
            // Checkbox - array of values
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
        
        if (field.type === 'multiple_choice' || field.type === 'radio' || field.type === 'select' || field.type === 'dropdown') {
            // Multiple choice, radio, select - single value
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
                    if (typeof opt === 'object' && opt.showTextField && otherTextValues[key]) {
                        return `${opt.label}: ${otherTextValues[key]}`;
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

    function handleMultipleChoiceChange(fieldId: string, value: string) {
        fieldValues[fieldId] = value;
    }


    // Add new household member section - MODIFIED TO INSERT AFTER ORIGINAL HOUSEHOLD SECTION
    function addHouseholdMember() {
        const maxMembers = 20; // Maximum household members allowed
        
        if (householdMemberCount >= maxMembers) {
            error = `Maximum ${maxMembers} household members allowed`;
            return;
        }

        // Find the original household section template
        const originalHouseholdSection = data.form.sections.find((section: any) => isHouseholdSection(section));
        
        if (!originalHouseholdSection) {
            error = 'No household section template found';
            return;
        }

        // Find the index of the original household section in formSections
        const originalHouseholdIndex = formSections.findIndex((section: any) => isOriginalHouseholdSection(section));
        
        if (originalHouseholdIndex === -1) {
            error = 'Original household section not found in form sections';
            return;
        }

        householdMemberCount++;
        
        // Create new section based on the original household section
        const newSection = {
            ...originalHouseholdSection,
            id: `household_member_${householdMemberCount}`,
            title: `Household Data Member ${householdMemberCount}`,
            fields: originalHouseholdSection.fields.map((field: any) => ({
                ...field,
                id: `${field.id}_member_${householdMemberCount}`,
                name: `${field.name || field.id}_member_${householdMemberCount}`,
                value: getInitialFieldValue(field)
            }))
        };

        // Find the insertion point: after the last household section (original + any added ones)
        let insertIndex = originalHouseholdIndex + 1;
        
        // Move insertion point to after all existing household sections
        while (insertIndex < formSections.length && isHouseholdSection(formSections[insertIndex])) {
            insertIndex++;
        }

        // Insert new section at the calculated position
        const newFormSections = [...formSections];
        newFormSections.splice(insertIndex, 0, newSection);
        formSections = newFormSections;

        // Initialize field values for new section
        newSection.fields.forEach((field: any) => {
            const initialValue = getInitialFieldValue(field);
            fieldValues[field.id] = initialValue;
            originalFieldValues[field.id] = initialValue;
            
            if (field.type === 'radio_with_other') {
                otherTextValues[field.id] = '';
                originalOtherTextValues[field.id] = '';
            }
        });

        // Call server action to sync with database
        const formData = new FormData();
        formData.append('memberNumber', householdMemberCount.toString());
        formData.append('sectionData', JSON.stringify(newSection));

        fetch('?/addHouseholdMemberSection', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(result => {
            if (result.type === 'success') {
                successMessage = `Added Household Data Member ${householdMemberCount}`;
                setTimeout(() => {
                    successMessage = null;
                }, 3000);
            } else {
                error = result.data?.message || 'Failed to add household member';
                // Rollback on error
                householdMemberCount--;
                formSections = formSections.filter(section => section.id !== newSection.id);
            }
        }).catch(err => {
            console.error('Error adding household member:', err);
            error = 'Failed to add household member';
            // Rollback on error
            householdMemberCount--;
            formSections = formSections.filter(section => section.id !== newSection.id);
        });

        clearMessages();
    }

    // Remove household member section
    function removeHouseholdMember(sectionId: string) {
        const sectionIndex = formSections.findIndex(section => section.id === sectionId);
        
        if (sectionIndex === -1) {
            error = 'Section not found';
            return;
        }

        const sectionToRemove = formSections[sectionIndex];
        
        // Don't allow removal if it's the only household section
        if (householdMemberCount <= 1) {
            error = 'At least one household member is required';
            return;
        }

        // Remove field values for this section
        sectionToRemove.fields.forEach((field: any) => {
            delete fieldValues[field.id];
            delete originalFieldValues[field.id];
            delete otherTextValues[field.id];
            delete originalOtherTextValues[field.id];
        });

        // Remove section from formSections
        formSections = formSections.filter((_, index) => index !== sectionIndex);
        householdMemberCount--;

        // Call server action to sync with database
        const formData = new FormData();
        formData.append('sectionId', sectionId);

        fetch('?/removeHouseholdMemberSection', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(result => {
            if (result.type === 'success') {
                successMessage = `Removed household member section`;
                setTimeout(() => {
                    successMessage = null;
                }, 3000);
            } else {
                error = result.data?.message || 'Failed to remove household member';
            }
        }).catch(err => {
            console.error('Error removing household member:', err);
            error = 'Failed to remove household member';
        });

        clearMessages();
    }

    // Check if section is a household member type
    function isHouseholdSection(section: any): boolean {
        return section.repeatable && (
            section.sectionType === 'household_member' || 
            section.title.toLowerCase().includes('household') ||
            section.title.toLowerCase().includes('member')
        );
    }

    // Check if this is the original household section (not a dynamically added one)
    function isOriginalHouseholdSection(section: any): boolean {
        return isHouseholdSection(section) && !section.id.includes('household_member_');
    }
</script>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<div class="bg-[#F6F8FF] min-h-screen">
    <!-- Header Section -->
    <Header 
         name={getDisplayTitle(data.form)} 
        search={false} 
        backButton={true} 
    />

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
        <div class="mb-2">{getDisplayTitle(data.form)}</div>
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
                                        } else if (result.type === 'failure') {
                                            error = typeof result.data?.message === 'string'
                                                ? result.data.message
                                                : 'Failed to save fields';
                                        }
                                    };
                                }}>
                                    <input type="hidden" name="formId" value={data.form.id} />
                                    <!-- Include all field values in the form -->
                                    {#each formSections as section}
                                        {#if section.repeatable && section.instances}
                                            {#each section.instances as instance}
                                                {#each instance.fields as field}
                                                    <input type="hidden" name={field.name} value={Array.isArray(fieldValues[field.name]) ? fieldValues[field.name].join(',') : (fieldValues[field.name] || '')} />
                                                    {#if field.type === 'radio_with_other'}
                                                        <input type="hidden" name="{field.name}_other" value={otherTextValues[field.name] || ''} />
                                                    {/if}
                                                {/each}
                                            {/each}
                                        {:else}
                                            {#each section.fields as field}
                                                <input type="hidden" name="field_{field.id}" value={Array.isArray(fieldValues[field.id]) ? fieldValues[field.id].join(',') : (fieldValues[field.id] || '')} />
                                                {#if field.type === 'radio_with_other'}
                                                    <input type="hidden" name="field_{field.id}_other" value={otherTextValues[field.id] || ''} />
                                                {/if}
                                            {/each}
                                        {/if}
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
                {#if formSections && formSections.length > 0}
                    <div class="p-6 space-y-8">
                        {#each formSections as section, sectionIndex}
                            <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden">
                                <!-- Section Header -->
                                <div class="bg-[#474C58] text-white px-6 py-4 flex justify-between items-center">
                                    <h2 class="text-xl font-bold">{section.title}</h2>
                                    
                                    <div class="flex items-center gap-3">
                                        <!-- Add Household Member Button (only for household sections) -->
                                        {#if isHouseholdSection(section) && isOriginalHouseholdSection(section)}
                                            <button 
                                                type="button" 
                                                class="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-md shadow-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                                                on:click={addHouseholdMember}
                                                disabled={isLoading || householdMemberCount >= 20}
                                            >
                                                <span class="text-lg">+</span>
                                                Add Member
                                                <span class="text-sm opacity-75">({householdMemberCount}/20)</span>
                                            </button>
                                        {/if}
                                        
                                        <!-- Remove Household Member Button (only for dynamically added sections) -->
                                        {#if isHouseholdSection(section) && !isOriginalHouseholdSection(section) && (editMode || isAlwaysEditableField('text'))}
                                            <button 
                                                type="button" 
                                                class="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center gap-1"
                                                on:click={() => removeHouseholdMember(section.id)}
                                                disabled={isLoading}
                                            >
                                                <span class="text-lg">×</span>
                                                Remove
                                            </button>
                                        {/if}
                                    </div>
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
                                                                        <label class="flex items-center gap-3 cursor-pointer" for={"field-" + field.id + "-radio-" + i}>
                                                                            <input
                                                                                id={"field-" + field.id + "-radio-" + i}
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
                                                                                    value={typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option}
                                                                                    checked={fieldValues[field.id] === (typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option)}
                                                                                    required={field.required}
                                                                                    on:change={() => handleRadioWithOtherChange(field.id, typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option, field)}
                                                                                    on:focus={clearMessages}
                                                                                />
                                                                                <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                            </label>
                                                                            
                                                                            <!-- Show text input if this option has showTextField = true and is selected -->
                                                                            {#if typeof option === 'object' && option.showTextField && fieldValues[field.id] === (option.value || option.label.toLowerCase().replace(/\s+/g, '_'))}
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
                                                                                checked={isCheckboxChecked(field.id, typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option)}
                                                                                on:change={(e) => handleCheckboxChange(
                                                                                    field.id,
                                                                                    typeof option === 'object' ? (option.value || option.label.toLowerCase().replace(/\s+/g, '_')) : option,
                                                                                    e.target ? (e.target as HTMLInputElement).checked : false
                                                                                )}
                                                                            />
                                                                            <span class="text-gray-700">{typeof option === 'object' ? option.label : option}</span>
                                                                        </label>
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

<style>
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
        .animate-spin {
            animation: spin 1s linear infinite;
        }
</style>
