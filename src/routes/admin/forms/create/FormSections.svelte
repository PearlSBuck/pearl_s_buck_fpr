<svelte:options runes={true} />
<script lang='ts'>
    import type { IFormSections, IFormFields, Options } from "./model.js";
    let {id,
         formId,
         title,
         orderIndex,
         onFieldsChange = () => {}
    }: IFormSections & { onFieldsChange?: (fields: IFormFields[]) => void } = $props();
    
    let currentField: IFormFields | undefined = $state();
    let editField: IFormFields | undefined = $state();
    let showFieldModal: boolean = $state(false);
    let edit: boolean = $state(false);
    let editIndex: number = $state(-1);
    let otherOption: boolean = $state(false);

    const formFields: IFormFields[] = $state([]);

    $effect(() => {
        onFieldsChange(formFields);
    });

    function resetFields() {
        currentField = undefined;
        editField = undefined;
        showFieldModal = false;
        edit = false;
        editIndex = -1;
        otherOption = false;
    }

    // initializing the form field
    function createFieldHandler() {
        currentField = {
            id: "", // placeholder
            formid: formId,
            sectionid: id,
            label: "",
            name: "",
            placeholder: undefined,
            required: false,
            value: "",
            options: undefined,
            type: "",
            orderindex: 0
        };
        showFieldModal = true;
    }

    function editFieldHandler(index: number) {
        editField = JSON.parse(JSON.stringify(formFields[index]));
        edit = true;
        editIndex = index;
        showFieldModal = true;
    }

    // initializing the field option
    function createOptionHandler() {
        let temp = {
                label: "",
                value: "",
        }

        if (!edit && currentField) {
            if (!currentField.options) {
                currentField.options = [];
            }
            currentField.options.push(temp);
        }
        
        if (edit && editField) {
            if (!editField.options) {
                editField.options = [];
            }
            editField.options.push(temp);
        }
    }

    // adding the newly made field
    function addFieldHandler() {
        let pass = 1;

        if (currentField && !edit) {
            if (currentField.type === "") {
                pass = 0;
                alert("Type cannot be empty!");
            } else if (currentField.label === "") {
                pass = 0;
                alert("Label cannot be empty!");
            } else {
                if (currentField.type === "multiple_choice" || currentField.type === "checkbox") {
                    if (currentField.options) {
                        for (let option of currentField.options) {
                            if (option.label === "") {
                                pass = 0;
                                alert("Empty fields are not allowed!");
                            }
                        }
                        if (otherOption) {
                            currentField.options.push({label: "Others", value: ""});
                        }
                    } else {
                        pass = 0;
                        alert("Multiple Choice cannot be empty!")
                    }
                } else {
                    currentField.options = undefined;
                }
            }
            if (pass === 1) {
                formFields.push(currentField);
                resetFields();
            }
        } else if (editField && edit) {
            if (editField.label === "") {
                pass = 0;
                alert("Label cannot be empty!");
            } else {
                if (editField.type === "multiple_choice" || editField.type === "checkbox") {
                    if (editField.options) {
                        for (let option of editField.options) {
                            if (option.label === "") {
                                pass = 0;
                                alert("Empty fields are not allowed!");
                            }
                        }
                        if (otherOption) {
                            editField.options.push({label: "Others", value: ""});
                        }
                    } else {
                        pass = 0;
                        alert("Multiple Choice cannot be empty!")
                    }
                } else {
                    editField.options = undefined;
                }
            }
            if (pass === 1) {
                formFields[editIndex] = editField;
                resetFields();
            }
        }
    }

    function deleteFieldHandler() {
        if (confirm("Are you sure you want to delete this field?")) {
            formFields.splice(editIndex, 1);
            resetFields();
        }
    }

    function deleteOptionHandler(index: number) {
        if (!edit && currentField && currentField.options) {
            currentField.options.splice(index, 1);
        } else if (edit && editField && editField.options) {
            editField.options.splice(index, 1);
        }
    }
</script>

<div class="py-2">
    <hr class="border-[#808080]">
</div>
<div>
    {#each formFields as field, index}
        <div class="flex pt-1">
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button onclick={() => editFieldHandler(index)} class="pt-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
            </button> 
            <div class="bg-[#1A5A9E] text-white rounded-lg w-[80px] text-center">
                {#if field.type === "text"}
                    Text
                {:else if field.type === "number"}
                    Number
                {:else if field.type === "date"}
                    Date
                {:else if field.type === "multiple_choice"}
                    <p class="text-xs">Multiple Choice</p>
                {:else if field.type === "checkbox"}
                    Checkbox
                {:else}
                    NaN
                {/if}
            </div>
            <p class="text-[#697077] px-2">{field.label}:</p>
        </div>
        {#if field.options}
            <div class="pb-1">
                {#each field.options as option}
                    <div>
                        <label class="ml-28">
                            {#if field.type === "multiple_choice"}
                                <input type="radio" id="option" name="option" disabled />
                            {:else if field.type === "checkbox"}
                                <input type="checkbox" id="option" name="option" disabled />
                            {/if}
                            {option.label}
                        </label>
                    </div>
                {/each}
            </div>
        {/if}
    {/each}
</div>
<div class="pt-3">
    <button onclick={createFieldHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Add Question</button>
</div>

<!-- modal for fields -->
{#if showFieldModal && (currentField || editField)}
    <div class="fixed top-0 left-0 h-full w-full flex justify-center items-center bg-black/25">      
        <div class="absolute w-2/7 shadow-xl/10 rounded-lg bg-white p-7">
            {#if !edit && currentField}
                <div class="flex justify-center">
                    <select id="type" name="type" bind:value={currentField.type} >
                        <option value="" disabled hidden>Select Type of Question</option>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="checkbox">Checkbox</option>
                    </select>
                </div>
            {:else if edit && editField}
                <div class="flex justify-between">       
                    <div></div>
                    <div>    
                        <select id="type" name="type" bind:value={editField.type} >
                            <option value="" disabled hidden>Select Type of Question</option>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="checkbox">Checkbox</option>
                        </select>
                    </div>
                    <div>
                        <button onclick={() => deleteFieldHandler()} class="cursor-pointer">
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="size-6 pt-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            {/if}
            <div class="py-5">
                <hr class="border-[#808080]">
            </div>
            <div class="pb-1">
                <label>
                    Label:
                    {#if !edit && currentField}
                        <input type="text" id="label" name="label" bind:value={currentField.label} required placeholder="Add Label" />
                    {:else if edit && editField}
                        <input type="text" id="label" name="label" bind:value={editField.label} required placeholder="Add Label" />
                    {/if}
                </label>
                <label class="pl-2">
                    {#if !edit && currentField}
                        <input type="checkbox" id="required" name="required" bind:checked={currentField.required} />
                    {:else if edit && editField}
                        <input type="checkbox" id="required" name="required" bind:checked={editField.required} />
                    {/if}
                    Required
                </label>
            </div>
            {#if !edit && currentField && currentField.options && (currentField.type === "multiple_choice" || currentField.type === "checkbox")}
                {#each currentField.options as option, index}
                    <div class="pt-2">
                        <button onclick={() => deleteOptionHandler(index)} class="cursor-pointer">
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="size-6 pt-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                        <label>
                            Option:
                            <input type="text" id="option" name="option" bind:value={option.label} placeholder="Add Option" />
                        </label>
                    </div>
                {/each}
                {#if otherOption}
                    <div class="pt-2">
                            Others:
                    </div>
                {/if}
            {/if}
            {#if edit && editField?.options && (editField.type === "multiple_choice" || editField.type === "checkbox")}
                {#each editField.options as option, index}
                    <div class="pt-2">
                        <button onclick={() => deleteOptionHandler(index)}>
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="size-6 pt-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                        <label>
                            Option:
                            <input type="text" id="option" name="option" bind:value={option.label} placeholder="Add Option" />
                        </label>
                    </div>
                {/each}
                {#if otherOption}
                    <div class="pt-2">
                            Others:
                    </div>
                {/if}
            {/if}
            {#if !edit && currentField && (currentField.type === "multiple_choice" || currentField.type === "checkbox")}
                <div class="pt-2">
                    <button onclick={createOptionHandler} class="px-5 cursor-pointer">
                        <div class="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pt-1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Add Option
                        </div>
                    </button>
                </div>
                {#if !otherOption && currentField.options && currentField.options.length > 0}
                    <div class="pt-1">
                    <button onclick={() => otherOption = true} class="px-5 cursor-pointer">
                        <div class="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pt-1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Add "Other" Option
                        </div>
                    </button>
                </div>
                {/if}
            {/if}
            {#if edit && editField && (editField.type === "multiple_choice" || editField.type === "checkbox")}
                <div class="pt-2">
                    <button onclick={createOptionHandler} class="px-5 cursor-pointer">
                        <div class="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pt-1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Add Option
                        </div>
                    </button>
                </div>
                {#if !otherOption && editField.options && editField.options.length > 0}
                    <div class="pt-1">
                    <button onclick={() => otherOption = true} class="px-5 cursor-pointer">
                        <div class="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pt-1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Add "Other" Option
                        </div>
                    </button>
                </div>
                {/if}
            {/if}
            <div class="flex justify-end pt-5">
                <div>
                    <button onclick={resetFields} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Cancel</button>
                </div>
                <div class="pl-2">
                    <button onclick={addFieldHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Confirm</button> 
                </div>
            </div>
        </div>
    </div>
{/if}