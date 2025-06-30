<script lang='ts'>
export let open: boolean;
export let field: any
import DataInput from "./DataInput.svelte";

let popupRef: HTMLDivElement;
let newOption = '';
function setHidden(el: HTMLElement, shouldHide: boolean) {
  el.classList.toggle('hidden', shouldHide);
}

// let editorType = field.type;
// let editorLabel = field.label;
// let editorName = field.name;

let editorOptions:any;
// let editorPlaceholder = field.placeholder;
// let editorRequired = field.required;
function handleEnter(addedOption:string){
    let option = {label: addedOption, value:addedOption}
    editorOptions = [...editorOptions, option]
    console.log('Successfully Added new option')
}

function removeOption(index:number) {
    editorOptions.splice(index, 1);
    editorOptions = [...editorOptions];
    console.log('Successfully removed');
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const inputValue = (event.target as HTMLInputElement).value;
        handleEnter(inputValue);
        newOption='';

    }

  }

$: if(open && field){
    editorOptions=field.options;
}
</script>

{#if open}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <button class="float-right text-gray-500 block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm" on:click={() => (open = false)}>×</button>
            <!-- Field Type -->
            <!-- Displays Current Values in the field -->
            <div>
                <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">Edit {field.label} Field</h1>
                <p>Current Field Type: {field.type}</p>

                
                <!-- Conditional Display-->
                {#if (field.type==='text') || (field.type==='number')} 
                    <p>Current Placeholder: {field.placeholder}</p>

                {:else} 
                    <p>Options:</p>
                    <ul class='list-disc'>
                        {#each field.options as option}
                            <li class='ml-10'>{option.label}</li>
                        {/each}
                    </ul>
                {/if}
            </div>
            
            <br><br>

            <DataInput
                type = 'select'
                label='Field Type'
                name='fieldType'
                required={true}
                value={field.type}
                options={[
                { label: 'Text', value: 'text' },
                { label: 'Number', value: 'number' },
                { label: 'Radio', value: 'radio' },
                { label: 'Radio With Other', value: 'radio_with_other' },
                { label: 'Checkbox', value: 'checkbox' },
                { label: 'Select', value: 'select' }
                ]}
                on:change={(e) => field.type = e.detail}
            />
            <!-- Field Name -->
            <DataInput
                type = 'text'
                label='Field Name'
                name='fieldName'
                required={true}
                value=''
            />

            <!-- Conditional Inputs -->
            <!-- Text Areas -->
            {#if (field.type==='text') || (field.type==='number')} 
                <DataInput
                    type = 'text'
                    label='Placeholder'
                    name='fieldPlaceholder'
                    required={true}
                    value=''
                    placeholder='Enter new placeholder'
                />
            <!-- With options (Radio, Radio with other, Checkbox) -->
            {:else if (field.type==='radio') || (field.type==='radio_with_other') || (field.type==='checkbox')} 
                <p>Options:</p>
                {#each editorOptions as option, index}
                    <input
                        type={field.type}
                        value={option.label}
                        disabled={true}
                    />
                    <span>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></span><br>
                    

                {/each}
                <!-- option for adding more options -->
                    <input
                        type={field.type}
                        value=''
                        disabled={true}
                    />
                    <input
                        type="text"
                        bind:value={newOption}
                        disabled={false}
                        class="border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none p-2 w-30"
                        on:keydown={handleKeydown}
                    />
            {:else if field.type === "select"}
                <p>Options:</p>
                {#each editorOptions as option, index}
                    <li>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></li>
                {/each}
                <li><input
                        type="text"
                        bind:value={newOption}
                        disabled={false}
                        class="border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none p-2 w-30"
                        on:keydown={handleKeydown}
                    /></li>
            {/if}
            <!-- With Image (Signature and Image Attachments) -->


            <!-- Save Button For Pop Up -->
            <div class='flex justify-end'>
                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Cancel</button>
                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Confirm</button>
            </div>
        </div>
    </div>
</div>
{/if}


