<script lang="ts">
    import Header from '../../../../../../../components/Header.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    // Define proper types
    interface OptionObject {
        value: string;
        label: string;
    }

    interface FormField {
        id: string;
        label: string;
        type: string;
        orderindex: number;
        options: (string | OptionObject)[] | null;
        answer: string | null;
        placeholder?: string;
        required?: boolean;
    }

    interface FormSection {
        id: string;
        title: string;
        fields: FormField[];
    }

    interface FPRRecord {
        sc_id: number;
        sc_name: string;
        answer_id: string;
        form_id: string;
        created_at: string;
        forms?: {
            version: number;
        };
        [key: string]: any;
    }
    
    // Get data from the server load function
    export let data: {
        record: FPRRecord;
        organizedData: FormSection[];
    };
    
    // Extract the main record and form data
    const { record, organizedData } = data;
    
    // Create a copy of the data for editing
    let editedAnswers: Record<string, string | string[]> = {};
    let isSubmitting = false;
    let error: string | null = null;
    let successMessage: string | null = null;
    
    // For handling "Other" option text inputs
    let otherValues: Record<string, string> = {};
    // Define a more specific type for combined answers
    type CombinedAnswer = string | Record<string, string>;
    let combinedAnswers: Record<string, CombinedAnswer> = {};
    
    // Initialize the form with current values
    onMount(() => {
        // Create an object with all current answers
        organizedData.forEach(section => {
            section.fields.forEach(field => {
                // Parse options if they're stored as a string
                if (field.options && typeof field.options === 'string') {
                    try {
                        field.options = JSON.parse(field.options as unknown as string) as (string | OptionObject)[];
                    } catch {
                        field.options = [field.options as unknown as string];
                    }
                }
                
                // Handle different field types
                if (field.type.trim() === 'checkbox') {
                    try {
                        // Parse the answer first
                        let values = field.answer ? JSON.parse(field.answer) : [];
                        if (!Array.isArray(values)) values = [values];
                        
                        // Process each value to properly handle "Others: Something" entries
                        const processedValues = [];
                        
                        for (const val of values) {
                            if (typeof val === 'string' && val.includes(':')) {
                                const parts = val.split(':', 2);
                                if (parts.length === 2) {
                                    const optionValue = parts[0].trim();
                                    const optionText = parts[1].trim();
                                    
                                    if ((optionValue.toLowerCase() === 'other' || optionValue.toLowerCase() === 'others')) {
                                        // Store just "Others" in the checkbox values
                                        processedValues.push(optionValue);
                                        
                                        // Store the text separately
                                        otherValues[field.id] = optionText;
                                        
                                        // Initialize combined answers
                                        if (!combinedAnswers[field.id]) {
                                            combinedAnswers[field.id] = {};
                                        }
                                        (combinedAnswers[field.id] as Record<string, string>)[optionValue] = optionText;
                                    } else {
                                        // Not an Others option, keep as is
                                        processedValues.push(val);
                                    }
                                } else {
                                    processedValues.push(val);
                                }
                            } else {
                                processedValues.push(val);
                            }
                        }
                        
                        // Use the processed values
                        editedAnswers[field.id] = processedValues;
                    } catch {
                        // Same processing for comma-separated format
                        // Fallback to comma-separated string
                        editedAnswers[field.id] = field.answer ? 
                            field.answer.split(',').map(v => v.trim()) : 
                            [];
                        const values = field.answer ? field.answer.split(',').map(v => v.trim()) : [];
                        // (Apply the same processing logic as above)
                        // ...
                    }
                } else {
                    editedAnswers[field.id] = field.answer || '';
                    
                    // Check if this is an "Other" answer with text
                    if (field.answer && typeof field.answer === 'string' && field.answer.includes(':')) {
                        let otherValue = '';
                        let otherText = '';
                        
                        if (field.answer.includes('Others:') && field.answer.indexOf('Others:') !== field.answer.lastIndexOf('Others:')) {
                            // Extract just the most recent "Others:" entry (the entire string after the last occurrence)
                            const lastOthersIndex = field.answer.lastIndexOf('Others:');
                            const latestEntry = field.answer.substring(lastOthersIndex);
                            const parts = latestEntry.split(':', 2);
                            if (parts.length === 2) {
                                otherValue = parts[0].trim();
                                otherText = parts[1].trim();
                            }
                        } else {
                            // Normal case with just one entry
                            const parts = field.answer.split(':', 2);
                            if (parts.length === 2) {
                                otherValue = parts[0].trim();
                                otherText = parts[1].trim();
                            }
                        }
                        
                        // Check if this is actually an "Other" option
                        if ((otherValue.toLowerCase() === 'other' || otherValue.toLowerCase() === 'others') && otherText) {
                            // Replace the whole answer with just the cleaned version to fix accumulation
                            editedAnswers[field.id] = otherValue;
                            otherValues[field.id] = otherText;
                            combinedAnswers[field.id] = `${otherValue}: ${otherText}`;
                            
                            // Update the original field answer to prevent accumulation in future edits
                            field.answer = `${otherValue}: ${otherText}`;
                        }
                    }
                }
            });
        });
    });

    // Get record year from created_at date
    const recordYear = new Date(record.created_at).getFullYear();

    // Handle form submission
    async function handleSubmit() {
        isSubmitting = true;
        error = null;
        successMessage = null;
        
        try {
            // Clear out any accumulated "Others:" values
            organizedData.forEach(section => {
                section.fields.forEach(field => {
                    // Check if this is a radio field with "Others" selected
                    if (
                        (field.type.trim() === 'radio' || field.type.trim() === 'multiple_choice') &&
                        typeof editedAnswers[field.id] === 'string' &&
                        (
                            (editedAnswers[field.id] as string).toLowerCase() === 'other' ||
                            (editedAnswers[field.id] as string).toLowerCase() === 'others'
                        )
                        ) {
                        // Make sure we're only sending the latest clean value
                        const otherText = otherValues[field.id] || '';
                        combinedAnswers[field.id] = `${editedAnswers[field.id]}: ${otherText}`;
                    }
                });
            });
            
            // Client-side validation
            let hasEmptyRequired = false;
            
            // Prepare final answers by combining with "Other" text where needed
            const finalAnswers = { ...editedAnswers };

            organizedData.forEach(section => {
                section.fields.forEach(field => {
                    // For radio buttons - we're already handling this with combinedAnswers[field.id] as string
                    if (field.type.trim() === 'radio' || field.type.trim() === 'multiple_choice') {
                        if (combinedAnswers[field.id] && typeof combinedAnswers[field.id] === 'string') {
                            finalAnswers[field.id] = combinedAnswers[field.id] as string;
                        }
                    } 
                    // For checkboxes - we need to transform the array
                    else if (field.type.trim() === 'checkbox') {
                        if (combinedAnswers[field.id] && typeof combinedAnswers[field.id] === 'object') {
                            // Get the current array of checkbox values
                            const checkboxValues = Array.isArray(finalAnswers[field.id]) ? 
                                finalAnswers[field.id] as string[] : 
                                [finalAnswers[field.id]].filter(Boolean) as string[];
                                
                            // Create a new array with "Others" replaced by the combined value
                            const transformedValues = checkboxValues.map(value => {
                                // If this value has a corresponding entry in combinedAnswers
                                const combinedObj = combinedAnswers[field.id] as Record<string, string>;
                                if (
                                    typeof value === 'string' &&
                                    combinedObj[value] &&
                                    value.toLowerCase().includes('other')
                                ) {
                                    // Return the combined format
                                    return `${value}: ${combinedObj[value]}`;
                                }
                                return value;
                            });
                            
                            // Ensure we're assigning a proper string array
                            finalAnswers[field.id] = transformedValues;
                        }
                    }
                    
                    // Check required fields
                    const answer = finalAnswers[field.id];
                    const isEmpty = typeof answer === 'string' ? 
                        (!answer || answer.trim() === '') : 
                        (!answer || answer.length === 0);
                        
                    if (field.required && isEmpty) {
                        hasEmptyRequired = true;
                    }
                });
            });
            
            if (hasEmptyRequired) {
                throw new Error('Please fill in all required fields');
            }
            
            // Send update request to server
            const response = await fetch(`/api/fpr/${record.sc_id}/${record.answer_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answers: finalAnswers
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to update record');
            }
            
            successMessage = 'Record updated successfully';
            
            // Navigate back to view page after short delay
            setTimeout(() => {
                goto(`/admin/data/fpr/${record.sc_id}/${record.answer_id}`);
            }, 1500);
            
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred during update';
            console.error('Update error:', err);
        } finally {
            isSubmitting = false;
        }
    }
    
    function cancelEdit() {
        goto(`/admin/data/fpr/${record.sc_id}/${record.answer_id}`);
    }
</script>

<div class="app-container">
    <!-- Header -->
    <Header name="Edit Family Progress Report" search={false} backButton={true} />

    <div class="content-area flex flex-col items-center pt-8 px-6 pb-8">
        <!-- Child Identification Card -->
        <div class="w-full max-w-7xl bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center justify-between mb-8">
            <div class="flex flex-col items-center md:items-start">
                <p class="text-xl mb-2">
                    SC Name: <span class="font-bold">{record.sc_name}</span>
                </p>
                <p class="text-xl">
                    SCN: <span class="font-bold">{record.sc_id}</span>
                </p>
                <p class="text-xl mt-2">
                    Year: <span class="font-bold">{recordYear}</span>
                </p>
            </div>
        </div>

        <!-- Success/Error Messages -->
        {#if successMessage}
            <div class="w-full max-w-7xl bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>{successMessage}</p>
            </div>
        {/if}

        {#if error}
            <div class="w-full max-w-7xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
            </div>
        {/if}

        <!-- Edit Form -->
        <form on:submit|preventDefault={handleSubmit} class="w-full max-w-7xl">
            {#each organizedData as section}
                <div class="section-card mb-8">
                    <h2 class="section-title">{section.title}</h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {#each section.fields as field}
                            <div class="mb-4">
                                <label for={`field-${field.id}`} class="block mb-2 font-medium">
                                    {field.label}
                                    {#if field.required}
                                        <span class="text-red-500">*</span>
                                    {/if}
                                </label>
                                
                                <!-- Dynamic Input Field -->
                                {#if field.type.trim() === 'text' || field.type.trim() === 'email' || field.type.trim() === 'number' || field.type.trim() === 'date'}
                                    <input
                                        type={field.type}
                                        id={`field-${field.id}`}
                                        class="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                        bind:value={editedAnswers[field.id] as string}
                                        placeholder={field.placeholder || ''}
                                        required={field.required || false}
                                    />
                                {:else if field.type.trim() === 'textarea'}
                                    <textarea
                                        id={`field-${field.id}`}
                                        class="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                        bind:value={editedAnswers[field.id] as string}
                                        placeholder={field.placeholder || ''}
                                        required={field.required || false}
                                        rows="4"
                                    ></textarea>
                                {:else if field.type.trim() === 'checkbox'}
                                    <div class="space-y-2 bg-green-50 p-3 rounded-md">
                                        <p class="text-sm text-green-700 mb-2">Select all that apply:</p>
                                        {#each field.options || [] as option}
                                            {@const isObject = typeof option === 'object' && option !== null}
                                            {@const optionLabel = isObject ? (option as OptionObject).label || String(option) : String(option)}
                                            {@const optionValue = isObject ? 
                                                ((option as OptionObject).value || optionLabel) : 
                                                String(option)}
                                            {@const fieldValue = editedAnswers[field.id] || []}
                                            {@const values = Array.isArray(fieldValue) 
                                                ? fieldValue 
                                                : (typeof fieldValue === 'string' ? fieldValue.split(',').map((v: string) => v.trim()) : [])}
                                            {@const isOtherOption = optionLabel.toLowerCase() === 'other' || optionLabel.toLowerCase() === 'others'}
                                            
                                            <label class="flex items-center space-x-2 cursor-pointer hover:bg-green-100 p-1 rounded transition duration-150">
                                                <input
                                                    type="checkbox"
                                                    value={optionValue}
                                                    checked={values.includes(optionValue)}
                                                    on:change={(e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        let currentValues = editedAnswers[field.id] || [];
                                                        
                                                        // Convert string to array if needed
                                                        if (typeof currentValues === 'string') {
                                                            try {
                                                                currentValues = JSON.parse(currentValues);
                                                            } catch {
                                                                const currentValuesStr = currentValues as string;
                                                                currentValues = currentValuesStr.split(',').map((v: string) => v.trim());
                                                            }
                                                        }
                                                        
                                                        // Ensure currentValues is treated as an array
                                                        const valueArray = Array.isArray(currentValues) ? currentValues : [currentValues];
                                                        
                                                        if (target.checked) {
                                                            if (!valueArray.includes(optionValue)) {
                                                                editedAnswers[field.id] = [...valueArray, optionValue];
                                                            }
                                                            
                                                            // Initialize other text if needed
                                                            if (isOtherOption && !otherValues[field.id]) {
                                                                otherValues[field.id] = '';
                                                            }
                                                        } else {
                                                            editedAnswers[field.id] = valueArray.filter((v: string) => v !== optionValue);
                                                        }
                                                    }}
                                                />
                                                <span>{optionLabel}</span>
                                            </label>
                                            
                                            <!-- Show text field if "Other" is checked -->
                                            {#if isOtherOption && values.includes(optionValue)}
                                                <div class="ml-6 mt-1 mb-2">
                                                    <input
                                                        type="text"
                                                        class="w-full p-2 rounded-md bg-white border border-green-300 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                        placeholder="Please specify..."
                                                        bind:value={otherValues[field.id]}
                                                        on:input={() => {
                                                            // Create or initialize combinedAnswers entry for this field
                                                            if (!combinedAnswers[field.id]) {
                                                                combinedAnswers[field.id] = {};
                                                            } else if (typeof combinedAnswers[field.id] === 'string') {
                                                                // Convert from string to object if needed
                                                                combinedAnswers[field.id] = {};
                                                            }
                                                            
                                                            // Safe access with type assertion
                                                            const combinedObj = combinedAnswers[field.id] as Record<string, string>;
                                                            combinedObj[optionValue] = otherValues[field.id];
                                                        }}
                                                    />
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                {:else if field.type.trim() === 'radio' || field.type.trim() === 'multiple_choice'}
                                    <div class="space-y-2 bg-blue-50 p-3 rounded-md">
                                        <p class="text-sm text-blue-700 mb-2">Select one option:</p>
                                        {#each field.options || [] as option}
                                            {@const isObject = typeof option === 'object' && option !== null}
                                            {@const optionLabel = isObject ? (option as OptionObject).label || String(option) : String(option)}
                                            {@const optionValue = isObject ? 
                                                ((option as OptionObject).value || optionLabel) : 
                                                String(option)}
                                            {@const isOtherOption = optionLabel.toLowerCase() === 'other' || optionLabel.toLowerCase() === 'others'}
                                            
                                            <label class="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-1 rounded transition duration-150">
                                                <input
                                                    type="radio"
                                                    id={`field-${field.id}-${typeof optionValue === 'string' ? optionValue.replace(/\s+/g, '-') : ''}`}
                                                    name={`field-${field.id}`}
                                                    value={optionValue}
                                                    checked={editedAnswers[field.id] === optionValue}
                                                    on:change={() => {
                                                        editedAnswers[field.id] = optionValue;
                                                        
                                                        // Initialize other text if needed
                                                        if (isOtherOption && !otherValues[field.id]) {
                                                            otherValues[field.id] = '';
                                                        }
                                                    }}
                                                />
                                                <span>{optionLabel}</span>
                                            </label>
                                            
                                            <!-- Show text field if "Other" is selected -->
                                            {#if isOtherOption && editedAnswers[field.id] === optionValue}
                                                <div class="ml-6 mt-1 mb-2">
                                                    <input
                                                        type="text"
                                                        class="w-full p-2 rounded-md bg-white border border-blue-300 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                                        placeholder="Please specify..."
                                                        bind:value={otherValues[field.id]}
                                                        on:input={() => {
                                                            // Store combined value: "Other: user text"
                                                            const otherText = otherValues[field.id];
                                                            if (otherText) {
                                                                combinedAnswers[field.id] = `${optionValue}: ${otherText}`;
                                                            } else {
                                                                combinedAnswers[field.id] = optionValue;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                {:else if field.type.trim() === 'select' || field.type.trim() === 'dropdown'}
                                    <div class="bg-purple-50 p-3 rounded-md">
                                        <select
                                            id={`field-${field.id}`}
                                            class="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                            bind:value={editedAnswers[field.id] as string}
                                        >
                                            <option value="">-- Select an option --</option>
                                            {#each field.options || [] as option}
                                                {@const isObject = typeof option === 'object' && option !== null}
                                                {@const optionValue = isObject ? (option as OptionObject).value || String(option) : String(option)}
                                                {@const optionLabel = isObject ? (option as OptionObject).label || String(option) : String(option)}
                                                <option value={optionValue} selected={editedAnswers[field.id] === optionValue}>
                                                    {optionLabel}
                                                </option>
                                            {/each}
                                        </select>
                                    </div>
                                {:else}
                                    <input
                                        type="text"
                                        id={`field-${field.id}`}
                                        class="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
                                        bind:value={editedAnswers[field.id] as string}
                                        placeholder={field.placeholder || ''}
                                    />
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Form Actions -->
            <div class="flex justify-end gap-4 mt-8 mb-12">
                <button 
                    type="button" 
                    class="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    on:click={cancelEdit}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    class="px-6 py-3 bg-[#1A5A9E] text-white rounded-md hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting}
                >
                    {#if isSubmitting}
                        <span class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    {:else}
                        Save Changes
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>

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
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1A5A9E;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
    }
</style>