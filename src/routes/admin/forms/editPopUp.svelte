<script lang='ts'>
import DataInput from "./DataInput.svelte";
import { formDelta } from '$lib/stores/formEditor';
import { handleSectionChanges } from '$lib/stores/formEditor'
import type { Field } from '$lib/stores/formEditor';
import type { Section } from '$lib/stores/formEditor';
import { dndzone } from 'svelte-dnd-action';

export let openEditPopup: boolean;
export let openDeletePopup: boolean;
export let openAddPopup: boolean;
export let openAddSectionPopup: boolean;
export let openDeleteSectionPopup: boolean;
export let openEditSectionPopup: boolean;
export let openEditOrderPopup: boolean;
export let openEditFieldOrderPopup: boolean;

export let displayedFormData: any;
export let field: any;
export let section:any;
export let fieldId: string;
export let sectionId: any;
export let formId: string;
export let items: ({ 
    id: string;
    title: string;
    orderIndex: number;
    formId: string;
    fields:[]
}[] )= [];

export let fieldItems: ({
    id: string;
    label: string;
    name: string;
    placeholder?: string;
    required: boolean;
    value?: string;
    options?: { label: string; value: string }[];
    type: string;
    orderindex: number;
    sectionId: string;
}[] ) = [];




let addOthersOption:boolean;
let newOption = '';
function setHidden(el: HTMLElement, shouldHide: boolean) {
  el.classList.toggle('hidden', shouldHide);
}
// for add field

let editorField: Field = {
    label: '',
    name: '',
    placeholder: '',
    required: false,
    sectionid: '',
    type: '',
    orderindex: 0,
    options: []
};

function clearEditorField() {
	editorField = {
		label: '',
		name: '',
		placeholder: '',
		required: false,
		sectionid: '',
		type: '',
		orderindex: 0,
		options: []
	};
    fieldItems =[];
}

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

function checkOthersOption(){
    if(addOthersOption && !editorField.options.find((option:any) => option.label === 'Others')){
        editorField.options.push({label:'Others', value:''});
    }
    else{
        editorField.options = editorField.options.filter(option => option.label !== 'Others');
    }
}

function removeOption(index:number) {
    editorField.options.splice(index, 1);
    editorField.options = [...editorField.options];
    console.log('Successfully removed');
}
// handles changes to the formfield
function handleFieldChanges(updatedField: any, changeType:string, sectionid?: string) {
    // adds a new field
    if(changeType == 'add'){
        formDelta.update(delta => {
            delta.fields.push({
            type: changeType,
            id:'',
            field: {
                sectionid: sectionid,
                label: updatedField.label,
                name: updatedField.name,
                placeholder: updatedField.placeholder,
                required: updatedField.required,
                type: updatedField.type,
                orderindex: updatedField.orderindex,
                options: updatedField.options,
                
            }
            });
            handleReactiveUI(updatedField, changeType, sectionid);
            return delta;
        });
    }
    else{
        formDelta.update(delta => {
            delta.fields.push({
            type: changeType,
            id:fieldId,
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

            handleReactiveUI(updatedField, changeType);
            return delta;
        });
    }
    openEditPopup=false;
    clearEditorField();
}

function handleReactiveUI(updatedField: any, changeType: string, sectionid?:string){
    if(changeType == 'update'){
        let sectionIndex = -1;
        let fieldIndex = -1;

        console.log('test fieldId: ', fieldId);
        console.log('test updatedField.id: ', updatedField.id);
        for (let sIdx = 0; sIdx < displayedFormData.sections.length; sIdx++) {
            const section = displayedFormData.sections[sIdx];
            const fIdx = section.fields.findIndex((field: any) => (field.id === fieldId) || (field.id === updatedField.id));

            if (fIdx !== -1) {
                console.log('successfully found field index');

                sectionIndex = sIdx;
                fieldIndex = fIdx;

                displayedFormData.sections[sectionIndex].fields[fieldIndex] = {
                    ...displayedFormData.sections[sectionIndex].fields[fieldIndex],
                    label: updatedField.label,
                    name: updatedField.name,
                    placeholder: updatedField.placeholder,
                    required: updatedField.required,
                    type: updatedField.type,
                    orderIndex: updatedField.orderindex,
                    options: updatedField.options,
                };
                displayedFormData.sections[sectionIndex].fields.sort((a:any, b:any) => a.orderIndex - b.orderIndex);
                console.log(displayedFormData.sections[sectionIndex].fields[fieldIndex]);
                break; // exit loop once match is found
            } else {
                console.log('Failed to find field index in section', sIdx);
            }
        }
    }
    else if(changeType == 'add'){
        let sectionIndex = displayedFormData.sections.findIndex((section:any) => section.id === sectionid);
        try {
            console.log(displayedFormData.sections[sectionIndex].fields);
            displayedFormData.sections[sectionIndex].fields.push({
                id: 'placeholderId',
                label: updatedField.label,
                name: updatedField.name,
                placeholder: updatedField.placeholder,
                required: updatedField.required,
                sectionId: sectionid,
                type: updatedField.type,
                orderIndex: updatedField.orderindex,
                options: updatedField.options,
            });
            console.log('Successfully added: ', updatedField);
            console.log(displayedFormData.sections[sectionIndex].fields);
            displayedFormData = {...displayedFormData};
        } catch(error){
            console.error('Failed to push updated field:', error);
        }

    }
    else if(changeType == 'delete'){
        for (let sIdx = 0; sIdx < displayedFormData.sections.length; sIdx++) {
            const section = displayedFormData.sections[sIdx];
            const fIdx = section.fields.findIndex((field: any) => field.id === fieldId);
            if(fIdx !== -1){
                displayedFormData.sections[sIdx].fields = displayedFormData.sections[sIdx].fields.filter((field:any) => field.id !== fieldId);           
                displayedFormData = {...displayedFormData};
                console.log('Successfully deleted field');
                break;
            } else{
            console.log('Failed to push deleted field');
            }
        }
    }   
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const inputValue = (event.target as HTMLInputElement).value;
        handleEnter(inputValue);
        newOption='';

    }
}


function handleDndConsider(e:any){
    items = e.detail.items;
};
function handleDndFinalize(e:any){
    items = e.detail.items;
};
function handleDndConsiderField(e:any){
    fieldItems = e.detail.items;
};
function handleDndFinalizeField(e:any){
    fieldItems = e.detail.items;
};



// makes sure field being updatd is correct
$: if(openEditPopup && field){
  editorField = field;
}

$: if(openEditSectionPopup && section){
  addNewSection = section;
}

$: if((openEditPopup||openAddPopup) && field){
  addOthersOption = field.options.find((option:any) => option.label === 'Others');
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
                    { label: 'Checkbox', value: 'checkbox' },
                    { label: 'Select', value: 'select' },
                    { label: 'Date', value: 'date'}
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
            <!-- With options (Radio, Checkbox) -->
             <!-- type: multiple_choice is temporarily added to conform to the database -->
            {:else if (editorField.type==='radio')  || (editorField.type==='checkbox') || editorField.type === 'multiple_choice'} 
                <p class="block text-sm font-medium mb-1">Options:</p>
                {#each editorField.options as option, index}
                    <input
                        type={editorField.type == 'multiple_choice' ? 'checkbox' : editorField.type}
                        value={option.label}
                        disabled={true}
                    />
                    <span>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></span><br>
                    

                {/each}
                <!-- option for adding more options -->
                
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-1">Type a new option</p>
                    <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
                        <input
                            type={editorField.type == 'multiple_choice' ? 'checkbox' : editorField.type}
                            disabled
                            class="h-5 w-5 text-indigo-600"
                        />
                        <input
                            type="text"
                            bind:value={newOption}
                            placeholder="Add option"
                            class="flex-1 border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none py-1"
                            on:keydown={handleKeydown}
                        />
                        
                    </div>
                    <p class="text-xs text-gray-400 mt-1">Press <kbd>Enter</kbd> to add</p>
                </div>
                <!-- others option -->
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-1">Tick to add others option</p>
                    <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
                        <input
                            type='checkbox'
                            bind:checked={addOthersOption}
                            class="h-5 w-5 text-indigo-600"
                        />
                        <span>Add others option</span>
                    </div>
                </div>

            {:else if editorField.type === "select"}
                <p>Options:</p>
                {#each editorField.options as option, index}
                    <li>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></li>
                {/each}
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-1">Type a new option</p>
                    <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
                        <li>
                        <input
                            type="text"
                            bind:value={newOption}
                            placeholder="Add option"
                            class="flex-1 border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none py-1"
                            on:keydown={handleKeydown}
                        />
                        </li>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">Press <kbd>Enter</kbd> to add</p>
                </div>
            {/if}
            <!-- With Image (Signature and Image Attachments) -->


            <!-- Save Button For Pop Up -->
            <div class='flex justify-end'>
                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => openEditPopup=false}>Cancel</button>
                <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => {
                    checkOthersOption();
                    handleFieldChanges(editorField, 'update');
                    newOption='';
                }
                    }>Confirm</button>
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
            <button class="m-1 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition" on:click={() => {
                handleFieldChanges(editorField, 'delete', fieldId)
                newOption='';
                openDeletePopup = false
            }}>Delete</button>

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
                bind:value={editorField.type}
                options={[
                    { label: 'Text', value: 'text' },
                    { label: 'Number', value: 'number' },
                    { label: 'Radio', value: 'radio' },
                    { label: 'Checkbox', value: 'checkbox' },
                    { label: 'Select', value: 'select' },
                    { label: 'Date', value: 'date'}
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
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-1">Type a new option</p>
                    <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
                        <input
                            type={editorField.type}
                            disabled={false}
                            class="h-5 w-5 text-indigo-600"
                        />
                        <input
                            type="text"
                            bind:value={newOption}
                            placeholder="Add option"
                            class="flex-1 border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none py-1"
                            on:keydown={handleKeydown}
                        />
                    </div>
                    <p class="text-xs text-gray-400 mt-1">Press <kbd>Enter</kbd> to add</p>
                    <div class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-1">Tick to add others option</p>
                    <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
                        <input
                            type='checkbox'
                            bind:checked={addOthersOption}
                            class="h-5 w-5 text-indigo-600"
                        />
                        <span>Add others option</span>
                    </div>
                </div>
                </div>

            {:else if editorField.type === "select"}
                <p>Options:</p>
                {#each editorField.options as option, index}
                    <li>{option.label}<button class="float-right text-gray-500" on:click={() => removeOption(index)}>×</button></li>
                {/each}
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-1">Type a new option</p>
                    <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
                        <li>
                        <input
                            type="text"
                            bind:value={newOption}
                            placeholder="Add option"
                            class="flex-1 border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none py-1"
                            on:keydown={handleKeydown}
                        />
                        </li>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">Press <kbd>Enter</kbd> to add</p>
                </div>

            {/if}
            <!-- With Image (Signature and Image Attachments) -->

            <br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openAddPopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-green-600 text-white rounded hover:bg-green-700 transition" on:click={() => {
                checkOthersOption();
                handleFieldChanges(editorField, 'add', sectionId)
                newOption='';
                openAddPopup=false}}>Add</button>

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
                name='sectionTitle'
                required={true}
                bind:value={addNewSection.title}
            />
            
            <br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openAddSectionPopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-green-600 text-white rounded hover:bg-green-700 transition" on:click={() => 
            {handleSectionChanges(addNewSection, 'add', formId);
            openAddSectionPopup=false;
            newOption='';}
            }>Add</button>

        </div>
    </div>
</div>

<!-- Opens the delete confirmation section -->
{:else if openDeleteSectionPopup}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div class='w-20 h-20 justify-self-center'>
                <svg fill="#e01f1f" viewBox="0 -8 72 72" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" stroke="#e01f1f"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>warning</title>
                    <path d="M15.8,49.7H56.22a3.78,3.78,0,0,0,3.36-5.5L39.38,8.39a3.8,3.8,0,0,0-6.78,0L12.4,44.2A3.81,3.81,0,0,0,15.8,49.7Zm23.38-8.33a3.29,3.29,0,1,1-6.58,0V41.3a3.29,3.29,0,0,1,6.58,0ZM34.11,17.18h3.8a1.63,1.63,0,0,1,1.54,2L37.79,33.75a1.78,1.78,0,0,1-3.56,0L32.56,19.19A1.64,1.64,0,0,1,34.11,17.18Z"></path>
                </g></svg>
            </div>
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">"{section.title}" Section</h1>
            <p>Are you sure you would like to delete this section?</p>
            <br><br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openDeleteSectionPopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition" on:click={() => {
                handleSectionChanges(section, 'delete', formId)
                openDeleteSectionPopup = false
            }}>Delete</button>

        </div>
    </div>
</div>

<!-- Opens the edit section popup -->
{:else if openEditSectionPopup}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div class='w-20 h-20 justify-self-center'>
                <svg viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#1E88E5" ></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                    <path d="M18.9445 9.1875L14.9445 5.1875M18.9445 9.1875L13.946 14.1859C13.2873 14.8446 12.4878 15.3646 11.5699 15.5229C10.6431 15.6828 9.49294 15.736 8.94444 15.1875C8.39595 14.639 8.44915 13.4888 8.609 12.562C8.76731 11.6441 9.28735 10.8446 9.946 10.1859L14.9445 5.1875M18.9445 9.1875C18.9445 9.1875 21.9444 6.1875 19.9444 4.1875C17.9444 2.1875 14.9445 5.1875 14.9445 5.1875M20.5 12C20.5 18.5 18.5 20.5 12 20.5C5.5 20.5 3.5 18.5 3.5 12C3.5 5.5 5.5 3.5 12 3.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            </div>
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">"{section.title}" Section</h1>
            <DataInput
                type = 'text'
                label='Enter new section title:'
                name='sectionTitle'
                required={true}
                bind:value={addNewSection.title}
            />
            <br><br><br>
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openEditSectionPopup=false}>Cancel</button>
            <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => {
                handleSectionChanges(addNewSection, 'update', formId)
                openEditSectionPopup = false
            }}>Edit</button>

        </div>
    </div>
</div>

{:else if openEditOrderPopup}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">Drag and drop to reorder sections</h1><br>
            <!-- Draggable List (Step 1) -->
            <div
                use:dndzone={{ items }}
                on:consider="{handleDndConsider}"
                on:finalize="{handleDndConsider}"
                class="space-y-2"
                >
                {#each items as item (item.id)}
                    <div
                    class="p-3 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition cursor-move"
                    >
                    <span class="font-medium text-gray-800">{item.title}</span>
                    </div>
                {/each}
            </div>

            <br>
            <!-- Action buttons -->
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openEditOrderPopup = false}>Cancel</button>
            <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => {
                const newOrder = items.map((item, index) => ({
                    id: item.id,
                    title: item.title,
                    orderindex: index
                    }));
                console.log('newOrder check:');
                console.log(newOrder);
                console.log(formId);
                newOrder.forEach((section) => {
                    handleSectionChanges(section, 'update', formId);
                });
                openEditOrderPopup = false;
            }}>Save</button>
            
        </div>
  </div>
</div>

{:else if openEditFieldOrderPopup}
<div class="fixed inset-0 bg-gray-950/70 z-60 flex items-start justify-center overflow-y-auto p-6">
    <div class="rounded shadow-lg w-full max-w-md mt-20 mb-20">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h1 class="block font-bold text-gray-700 lg:text-lg md:text-base sm:text-sm">Drag and drop to reorder sections</h1><br>
            <!-- Draggable List (Step 1) -->
            <div
                use:dndzone={{ items: fieldItems }}
                on:consider="{handleDndConsiderField}"
                on:finalize="{handleDndFinalizeField}"
                class="space-y-2"
                >
                {#each fieldItems as item (item.id)}
                    <div
                    class="p-3 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition cursor-move"
                    >
                    <span class="font-medium text-gray-800">{item.label}</span>
                    </div>
                {/each}
            </div>

            <br>
            <!-- Action buttons -->
            <button class="m-1 p-1 bg-zinc-50 outline-1 text-black rounded hover:bg-zinc-200 transition" on:click={() => openEditFieldOrderPopup = false}>Cancel</button>
            <button class="m-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => {
                const newOrder = fieldItems.map((item, index) => ({
                    id: item.id,
                    label: item.label,
                    orderindex: index,
                    sectionid: item.sectionId
                    }));
                console.log('newOrder check:');
                console.log(newOrder);
                console.log(formId);
                newOrder.forEach((field) => {
                    handleFieldChanges(field, 'update', field.sectionid);

                });
                openEditFieldOrderPopup = false;
            }}>Save</button>
            
        </div>
  </div>
</div>
{/if}


