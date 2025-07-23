<script lang="ts">
    import Header from '../../../../../../components/Header.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
  
    interface OptionObject {
        value: string;
        label: string;
    }

    interface FormSection {
        id: string;
        title: string;
        fields: FormField[];
    }

    interface FISRecord {
        sc_id: number;
        sc_name: string;
        answer_id: string;
        form_id: string;
        [key: string]: any;
    }

    // Update your FormField interface
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
    
    // Get data from the server load function
    export let data: {
        record: FISRecord;
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
    // This can now hold both string values (for radio) and objects (for checkbox)
    // Define a more specific type for combined answers
    type CombinedAnswer = string | Record<string, string>;
    let combinedAnswers: Record<string, CombinedAnswer> = {};
    
    // Initialize the form with current values
    onMount(() => {
        organizedData.forEach(section => {
            section.fields.forEach(field => {
                // Parse options if they're stored as a string
                if (field.options && typeof field.options === 'string') {
                    try {
                        // Try to parse as JSON first
                        const parsedOptions = JSON.parse(field.options as string);
                        field.options = parsedOptions as (string | OptionObject)[];
                    } catch {
                        // If parsing fails, create a string array with the single option
                        const singleOption = field.options as unknown as string;
                        field.options = [singleOption];
                    }
                }

                // Handle different field types
                if (field.type.trim() === 'checkbox') {
                    // Existing checkbox handling...
                } else {
                    editedAnswers[field.id] = field.answer || '';
                    
                    // Check if this is an "Other" answer with text
                    if (field.answer && typeof field.answer === 'string' && field.answer.includes('Other:')) {
                        const parts = field.answer.split(':', 2);
                        if (parts.length === 2) {
                            const otherValue = parts[0].trim();
                            const otherText = parts[1].trim();
                            
                            // Set the radio to "Other"
                            editedAnswers[field.id] = otherValue;
                            
                            // Set the text for "Other"
                            otherValues[field.id] = otherText;
                            
                            // Store combined value
                            combinedAnswers[field.id] = field.answer;
                        }
                    }
                }
            });
        });
    });

    // Handle form submission
    async function handleSubmit() {
        isSubmitting = true;
        error = null;
        successMessage = null;
        
        try {
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
                                if (combinedObj[value] && value.toLowerCase().includes('other')) {
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
            const response = await fetch(`/api/fis/${record.sc_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answerId: record.answer_id,
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
                goto(`/admin/data/fis/${record.sc_id}`);
            }, 1500);
            
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred during update';
            console.error('Update error:', err);
        } finally {
            isSubmitting = false;
        }
    }
    
    function cancelEdit() {
        goto(`/admin/data/fis/${record.sc_id}`);
    }
</script>

<div class="app-container">
    <!-- Header -->
    <Header name="Edit Family Introduction Sheet" search={false} backButton={true} />

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
                                            
                                            <!-- Use label as fallback when value is empty -->
                                            {@const optionValue = isObject ? 
                                                ((option as OptionObject).value || optionLabel) : 
                                                String(option)}
                                            
                                            {@const fieldValue = editedAnswers[field.id] || []}
                                            {@const values = Array.isArray(fieldValue) ? fieldValue : (typeof fieldValue === 'string' ? fieldValue.split(',').map((v: string) => v.trim()) : [])}
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
                                                                // Create a temporary string variable to handle the split safely
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
                                            {@const optionValue = isObject ? (option as OptionObject).value || String(option) : String(option)}
                                            {@const optionLabel = isObject ? (option as OptionObject).label || String(option) : String(option)}
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