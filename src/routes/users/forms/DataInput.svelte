<script lang="ts">
    import SignaturePad from './SignaturePad.svelte'; 
    // 

    let sigRef: any;
    let img = '';

    function save() {
        if (sigRef && !sigRef.isEmpty()) {
            img = sigRef.toDataURL();
        }
    }
    let file: File | null = null;
    let previewUrl: string | null = null;
    let uploading = false;

    function clear() {
        sigRef.clear();
        img = '';
    }
    interface Option {
        label?: string;
        value?: string;
    }
    export interface Props {
        id?: string;
        label: string;
        value: string | string[];
        name: string;
        placeholder?: string;
        required: boolean;
        type: string;
        options?: Option[];
        customOther?: string;
        otherText?: string;
        otherChecked?: boolean;
    }

    let { 
        id = '',
        label = '', 
        value =  $bindable(),
        name = '', 
        placeholder = '', 
        required = false,
        type = '',
        options = [],
        customOther = $bindable(),
        otherText = $bindable(),
        otherChecked = false
    }: Props = $props();

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function handleChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch('change', target.value); // send selected value as `e.detail`
    }

    // Watch for changes to "Other" checkbox or text input
    $effect(() => {
        if (Array.isArray(value)) {
            let othersValue = otherChecked && otherText ? [`Other: ${otherText}`] : [];

            // Filter out old "Other:" entries, and add updated one if needed
            let cleaned = value.filter(v => !v.startsWith('Other:'));
            let updated = [...cleaned, ...othersValue];

            if (JSON.stringify(updated) !== JSON.stringify(value)) {
                value = updated;
                dispatch('change', value);
            }
        }
    });

    // Reactively clears the textfield in others when others is unchecked
    $effect(() =>{
        if (!otherChecked) {
                otherText = '';
            }
    });
</script>

<!-- 
    Data Input Types:
        - text
        - radio
        - checkbox
        - dropdown
        - signature
        - image
-->
<div class="mb-4">
    <label for={name} class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">{label}{#if required} <label class='text-red-400'> *</label>{/if}</label>
    <!-- UI for text input -->
    {#if type === 'text' || type==='number'}
        <textarea
            id={"field-" + id}
            class="w-full p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg h-13 focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none"
            placeholder={placeholder || 'Enter value...'}
            required={required}
            rows="4"
            bind:value
            oninput={() => dispatch('change', value)}
        ></textarea>

    <!-- UI for radio group input -->
    {:else if type === 'radio'}
        <div class="space-y-2 ml-2">
            {#each options as option}
            <label class="flex items-center space-x-2">
                {#if option.label != 'Others'}
                    <input
                    type="radio"
                    name={name}
                    bind:group={value}
                    value={option.value}
                    required={required}
                    onchange={() => dispatch('change', option.value)}
                    />
                    <span>{option.label}</span>
                {:else}
                    <div class="flex items-center w-full space-x-2">
                        <input
                            type="radio"
                            name={name}
                            bind:group={value}
                            value="__other__"
                            onchange={() => {
                                // When selected, start tracking as 'Other: '
                                dispatch('change', 'Other: ');
                            }}
                        />
                        <span>Others:</span>
                        <input
                            type="text"
                            class="ml-2 p-2 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none text-sm"
                            placeholder="Please specify..."
                            bind:value={customOther}
                            oninput={(e) => {
                                // Update the answer as: "Other: <custom text>"
                                const input = e.target as HTMLInputElement;
                                const text = input.value;
                                dispatch('change', `Other: ${text}`);
                            }}
                        />
                    </div>
                {/if}
            </label>
            {/each}
        </div>
    
    <!-- UI for check box group input -->
    {:else if type === 'checkbox'}
        <div class="space-y-2 ml-2">
            {#each options as option}
            <label class="flex items-center space-x-2">
                {#if option.label != 'Others'}
                    <input
                    type="checkbox"
                    class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E] rounded"
                    name={name}
                    bind:group={value}
                    value={option.value}
                    required={required}
                    onchange={() => dispatch('change', value)}
                />
                <span>{option.label}</span>
                {:else}
                    <div class="flex items-center w-full">
                    <input
                        type="checkbox"
                        class="w-4 h-4 text-[#1A5A9E] focus:ring-[#1A5A9E] rounded"
                        bind:checked={otherChecked}
                    />
                    <input
                        type="text"
                        bind:value={otherText}
                        class="w-full ml-2 p-2 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none text-sm"
                        placeholder={'Please specify...'}
                        disabled={!otherChecked}                                                                                
                    />
                </div>
                {/if}
            </label>
            {/each}
        </div>

    <!-- UI for dropdown input -->
    {:else if type === 'select'}
        <select class="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm" required={required} name={name} onchange={handleChange} bind:value>
            {#each options as option}
            <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    {:else if type == 'date'}
        <input
            id={name}
            name={name}
            class="border-0 border-b-2 bg-[#DDE1E6] rounded-md border-gray-300 focus:border-indigo-600 focus:outline-none p-2 w-full"
            type="date"
            bind:value 
            required={required}
            />

    {:else if type === 'signature'}
        <SignaturePad bind:this={sigRef} penColor="blue" />

        <div class="place-self-center">
            <button onclick={clear} class=" text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ">Clear</button>
        </div>

        {#if img}
        <h3>Preview:</h3>
        <img src={img} alt="Signature" />
        {/if}
    
    {/if}
    
</div>
