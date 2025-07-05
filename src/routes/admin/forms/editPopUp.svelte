<script lang='ts'>
export let openEditPopup: boolean;
export let openDeletePopup: boolean;
export let openAddPopup: boolean;
export let openAddSectionPopup: boolean;

export let field: any;
export let section: any;
export let formId: string;
let editorField:any;
import DataInput from "./DataInput.svelte";
import { formDelta } from '$lib/stores/formEditor';
import { handleSectionChanges } from '$lib/stores/formEditor'
import { createEventDispatcher } from 'svelte';
import type { Field } from '$lib/stores/formEditor';
import type { Section } from '$lib/stores/formEditor';



const dispatch = createEventDispatcher();

let popupRef: HTMLDivElement;
let newOption = '';
function setHidden(el: HTMLElement, shouldHide: boolean) {
  el.classList.toggle('hidden', shouldHide);
}
// for add field
let addNewField: Field = {
    label: '',
    name: '',
    placeholder: '',
    required: false,
    type: '',
    orderindex: 0,
    options: []
};
// form add section
let addNewSection: Section = {
    title: '', 
    formid: '',
    orderindex: 0,
    created_at: ''
}

function handleEnter(addedOption:string){
    let option = {label: addedOption, value:addedOption}
    editorField.options = [...editorField.options, option]
    console.log('Successfully Added new option')
}

function removeOption(index:number) {
    editorField.options.splice(index, 1);
    editorField.options = [...editorField.options];
    console.log('Successfully removed');
}
// handles changes to the formfield
function handleFieldChanges(updatedField: any, changeType:string) {
    formDelta.update(delta => {
        delta.fields.push({
        type: changeType,
        id:updatedField.id,
        field: {
            label: updatedField.label,
            name: updatedField.name,
            placeholder: updatedField.placeholder,
            required: updatedField.required,
            type: updatedField.type,
            orderindex: updatedField.orderindex,
            options: updatedField.options,
        }
        });
        return delta;
    });

    openEditPopup=false;
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const inputValue = (event.target as HTMLInputElement).value;
        handleEnter(inputValue);
        newOption='';

    }

  }

// makes sure field being updatd is correct
$: if(openEditPopup && field){
  editorField = structuredClone(field);
}



</script>
<!-- Popup for edit field -->
{#if openEditPopup}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <button class="float-right text-gray-500 block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm" on:click={() => (openEditPopup = false)}>×</button>
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
                type='select'
                label='Field Type'
                name='fieldType'
                required={true}
                bind:value={editorField.type}
                options={[
                    { label: 'Text', value: 'text' },
                    { label: 'Number', value: 'number' },
                    { label: 'Radio', value: 'radio' },
                    { label: 'Radio With Other', value: 'radio_with_other' },
                    { label: 'Checkbox', value: 'checkbox' },
                    { label: 'Select', value: 'select' }
                ]}
            />

            <!-- Field Name -->
            <DataInput
                type = 'text'
                label='Field Name'
                name='fieldName'
                required={true}
                bind:value={editorField.label}
            />

            <!-- Conditional Inputs -->
            <!-- Text Areas -->
            {#if (editorField.type==='text') || (editorField.type==='number')} 
                <DataInput
                    type = 'text'
                    label='Placeholder'
                    name='fieldPlaceholder'
                    required={true}
                    bind:value={editorField.placeholder}
                    placeholder='Enter new placeholder'
                />
            <!-- With options (Radio, Radio with other, Checkbox) -->
            {:else if (editorField.type==='radio') || (editorField.type==='radio_with_other') || (editorField.type==='checkbox')} 
                <p>Options:</p>
                {#each editorField.options as option, index}
                    <input
                        type={editorField.type}
                        value={option.label}
                        disabled={true}
                    />
                    <span>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></span><br>
                    

                {/each}
                <!-- option for adding more options -->
                    <input
                        type={editorField.type}
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
            {:else if editorField.type === "select"}
                <p>Options:</p>
                {#each editorField.options as option, index}
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
                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => openEditPopup=false}>Cancel</button>
                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => handleFieldChanges(editorField, 'update')}>Confirm</button>
            </div>
        </div>
    </div>
</div>

<!-- Opens the delete confirmation pop up -->
{:else if openDeletePopup}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div class='w-20 h-20 justify-self-center'>
                <svg fill="#e01f1f" viewBox="0 -8 72 72" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" stroke="#e01f1f"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>warning</title>
                    <path d="M15.8,49.7H56.22a3.78,3.78,0,0,0,3.36-5.5L39.38,8.39a3.8,3.8,0,0,0-6.78,0L12.4,44.2A3.81,3.81,0,0,0,15.8,49.7Zm23.38-8.33a3.29,3.29,0,1,1-6.58,0V41.3a3.29,3.29,0,0,1,6.58,0ZM34.11,17.18h3.8a1.63,1.63,0,0,1,1.54,2L37.79,33.75a1.78,1.78,0,0,1-3.56,0L32.56,19.19A1.64,1.64,0,0,1,34.11,17.18Z"></path>
                </g></svg>
            </div>
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">"{field.label}" Field</h1>
            <p>Are you sure you would like to delete this field?</p>
            <br><br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openDeletePopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition" on:click={() => handleFieldChanges(editorField, 'delete')}>Delete</button>

        </div>
    </div>
</div>

<!-- Opens add field popup -->
{:else if openAddPopup}
    <div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div class='w-20 h-20 justify-self-center'>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z" fill="#25c11a"></path> </g>
                </svg>
            </div>
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">Create New Field</h1>
            <!-- sets the field type -->
            <DataInput
                type='select'
                label='Field Type'
                name='fieldType'
                required={true}
                bind:value={addNewField.type}
                options={[
                    { label: 'Text', value: 'text' },
                    { label: 'Number', value: 'number' },
                    { label: 'Radio', value: 'radio' },
                    { label: 'Radio With Other', value: 'radio_with_other' },
                    { label: 'Checkbox', value: 'checkbox' },
                    { label: 'Select', value: 'select' }
                ]}
            />

            <!-- Field Name -->
            <DataInput
                type = 'text'
                label='Field Name'
                name='fieldName'
                required={true}
                bind:value={addNewField.label}
            />

            <!-- Conditional Inputs -->
            <!-- Text Areas -->
            {#if (addNewField.type==='text') || (addNewField.type==='number')} 
                <DataInput
                    type = 'text'
                    label='Placeholder'
                    name='fieldPlaceholder'
                    required={true}
                    bind:value={addNewField.placeholder}
                    placeholder='Enter new placeholder'
                />
            <!-- With options (Radio, Radio with other, Checkbox) -->
            {:else if (addNewField.type==='radio') || (addNewField.type==='radio_with_other') || (addNewField.type==='checkbox')} 
                <p>Options:</p>
                {#each addNewField.options as option, index}
                    <input
                        type={addNewField.type}
                        value={option.label}
                        disabled={true}
                    />
                    <span>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></span><br>
                    

                {/each}
                <!-- option for adding more options -->
                    <input
                        type={addNewField.type}
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
            {:else if addNewField.type === "select"}
                <p>Options:</p>
                {#each addNewField.options as option, index}
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

            <br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openAddPopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-green-600 text-white rounded hover:bg-green-700 transition" on:click={() => handleFieldChanges(addNewField, 'add')}>Add</button>

        </div>
    </div>
</div>

<!-- Opens add section popup -->
{:else if openAddSectionPopup}
    <div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div class='w-20 h-20 justify-self-center'>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z" fill="#25c11a"></path> </g>
                </svg>
            </div>
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">Create New Section</h1>
            <!-- Create new section popup content -->
            <DataInput
                type = 'text'
                label='Section Title'
                name='fieldName'
                required={true}
                bind:value={addNewSection.title}
            />
            
            <br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openAddSectionPopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-green-600 text-white rounded hover:bg-green-700 transition" on:click={() => 
            {handleSectionChanges(addNewSection, 'add', formId);
            openAddSectionPopup=false}}>Add</button>

        </div>
    </div>
</div>

{/if}


