<svelte:options runes={true} />
<script lang='ts'>
	import { onMount } from "svelte";
    import type { IFormSections, IFormFields, Options } from "./model.js";
    let {id,
         formId,
         title = $bindable(),
         orderIndex,
         onFieldsChange = () => {}
    }: IFormSections & { onFieldsChange?: (fields: IFormFields[]) => void } = $props();
    
    let showEditTitle: boolean = $state(false);
    let currentField: IFormFields | undefined = $state();
    let options: Options[] | undefined = $state();

    const formFields: IFormFields[] = $state([]);

    $effect(() => {
        onFieldsChange(formFields);
    });

    // shows the dialog for the fields
    let dialog: HTMLDialogElement;
    onMount(() => {
        dialog = <HTMLDialogElement>document.getElementById('field-dialog'); 
    });
    
    function showFieldDialog(val: boolean) {
        if (val === true) {
            dialog.showModal();
        } else {
            options = undefined;
            dialog.close();
        }
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
        showFieldDialog(true);
    }

    // initializing the field option
    function createOptionHandler() {
        if (!options) {
            options = [];
        }

        let temp = {
            label: "",
            value: "",
        }

        options.push(temp);
    }

    // adding the newly made field
    function addFieldHandler() {
        let pass = 1;

        if (currentField) {
            if (currentField.type === "") {
                pass = 0;
                alert("Type cannot be empty!");
            } else if (currentField.label === "") {
                pass = 0;
                alert("Label cannot be empty!");
            } else {
                if (currentField.type != "multiple_choice") {
                    options = undefined;
                } else {
                    if (options) {
                        for (let option of options) {
                            if (option.label === "") {
                                pass = 0;
                                alert("Empty fields are not allowed!");
                            }
                        }
                    } else {
                        pass = 0;
                        alert("Multiple Choice cannot be empty!")
                    }
                }
            }
            if (pass === 1) {
                currentField.options = options;
                formFields.push(currentField);
                showFieldDialog(false);
            }
        }
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col w-3/5 shadow-xl/10 inset-shadow-sm rounded-lg p-8 bg-white">
        <div>
            {#if !showEditTitle}
                <p class="text-[32px] text-[#1A5A9E] font-bold">{title}</p>
                <button onclick={() => showEditTitle = true} class="bg-[#0C376C] text-white rounded-lg px-5">Edit Title</button> 
            {:else}
                <input type="text" id="title" name="title" bind:value={title} required />
                <button onclick={() => showEditTitle = false} class="bg-[#0C376C] text-white rounded-lg px-5">Save</button> 
            {/if}
        </div>
        <div class="py-2">
            <hr class="border-[#808080]">
        </div>
        <div>
            {#each formFields as field}
                <div class="flex p-1">
                    <div class="bg-[#1A5A9E] text-white rounded-lg w-[80px] text-center">
                        {#if field.type === "text"}
                            Text
                        {:else if field.type === "number"}
                            Number
                        {:else if field.type === "date"}
                            Date
                        {:else if field.type === "multiple_choice"}
                            <p class="text-xs">Multiple Choice</p>
                        {:else}
                            NaN
                        {/if}
                    </div>
                    <p class="text-[#697077] px-2">{field.label}:</p>
                </div>
                {#if field.options}
                    {#each field.options as option}
                        <label>
                            <input type="checkbox" id="option" name="option" disabled />
                            {option.label}
                        </label>
                    {/each}
                {/if}
            {/each}
        </div>
        <div class="pt-3">
            <button onclick={createFieldHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Add Question</button>
        </div>
    </div>
</div>

<!-- dialog box for fields -->
<dialog id="field-dialog" class="m-auto shadow-xl/10 rounded-lg w-2/7">    
    {#if currentField}
        <div class="p-7">
            <div class="flex justify-center">
                <select id="type" name="type" bind:value={currentField.type} >
                    <option value="" disabled hidden>Select Type of Question</option>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="multiple_choice">Multiple Choice</option>
                </select>
            </div>
            <div class="py-5">
                <hr class="border-[#808080]">
            </div>
            <div class="pb-1">
                <label>
                    Label:
                    <input type="text" id="label" name="label" bind:value={currentField.label} required placeholder="Add Label" />
                </label>
                <label class="pl-2">
                    <input type="checkbox" id="required" name="required" bind:checked={currentField.required} />
                    Required
                </label>
            </div>
            <div>
                {#if currentField.options}
                    {#each currentField.options as option}
                        <label>
                            <input type="checkbox" id="option" name="option" readonly />
                            {option.label}
                        </label>
                    {/each}
                {/if}
            </div>
            {#if options}
                {#each options as option}
                    <div class="py-3">
                        <label>
                            Option: 
                            <input type="text" id="option" name="option" bind:value={option.label} placeholder="Add Option" />
                        </label>
                    </div>
                {/each}
            {/if}
            {#if currentField.type === "multiple_choice"}
                <div class="pt-5">
                    <button onclick={createOptionHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Add Option</button>
                </div>
            {/if}
            <div class="flex justify-end pt-5">
                <div>
                    <button onclick={() => showFieldDialog(false)} class="bg-[#0C376C] text-white rounded-lg px-5">Cancel</button>
                </div>
                <div class="pl-2">
                    <button onclick={addFieldHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Confirm</button> 
                </div>
            </div>
        </div>
    {/if}
</dialog>