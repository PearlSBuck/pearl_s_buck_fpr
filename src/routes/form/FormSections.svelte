<script lang='ts'>
    import type { IFormSections, IFormFields, Options } from "./model.js";
    let {id,
         formId,
         title = $bindable(),
         orderIndex,
    }: IFormSections = $props();
    
    let showEditTitle: boolean = $state(false);
    let showFormPopup: boolean = $state(false);
    let currentField: IFormFields | undefined = $state();
    let showOptionPrompt: boolean = $state(false);
    let currentOption: Options | undefined = $state();

    const formFields: IFormFields[] = $state([]);

    function createFieldHandler() {
        currentField = {
            id: 0, // placeholder
            formId: formId,
            sectionId: id,
            label: "",
            name: "",
            placeholder: undefined,
            required: false,
            value: "",
            options: undefined,
            type: "",
        };
        showFormPopup = true;
    }

    function createOptionHandler() {
        currentOption = {
            label: "",
            value: "",
        }
        showOptionPrompt = true;
    }

    function addFieldHandler() {
        if (currentField) {
            formFields.push(currentField);
        }
        showFormPopup = false;
    }

    function addOptionHandler() {
        if (currentField) {
            if (!currentField.options) {
                currentField.options = [];
            }
            if (currentField.options && currentOption) {
                currentField.options.push(currentOption);
            }
        }
        showOptionPrompt = false;
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col w-1/2 shadow-xl/10 inset-shadow-sm rounded-lg">
        <div>
            {#if !showEditTitle}
                <p>Section Title: {title}</p>
                <button onclick={() => showEditTitle = true} class="bg-[#0C376C] text-white rounded-lg">Edit Title</button> 
            {:else}
                <input type="text" id="title" name="title" bind:value={title} required />
                <button onclick={() => showEditTitle = false} class="bg-[#0C376C] text-white rounded-lg">Save</button> 
            {/if}
        </div>
        {#each formFields as field}
            <p>Label: {field.label}</p>
            <p>Name: {field.name}</p>
            <p>Required: {field.required}</p>
            <p>Type: {field.type}</p>
        {/each}
        <div>
            {#if !showFormPopup}
                <button onclick={createFieldHandler}>Add Question</button>
            {:else}
                {#if currentField}
                    <!-- need to make this a popup -->
                    <div class="shadow-md rounded-lg">
                        <select id="type" name="type" bind:value={currentField.type} required>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="multiple_choice">Multiple Choice</option>
                        </select>
                        <label>
                            Label:
                            <input type="text" id="label" name="label" bind:value={currentField.label} required placeholder="Add Label" />
                        </label>
                        <label>
                            <input type="checkbox" id="required" name="required" bind:checked={currentField.required} />
                            Required
                        </label>
                        
                        {#if currentField.options}
                            {#each currentField.options as option}
                                <label>
                                    <input type="checkbox" id="option" name="option" readonly />
                                    {option.label}
                                </label>
                            {/each}
                        {/if}
                        {#if currentField.type === "multiple_choice" && !showOptionPrompt}
                            <button onclick={createOptionHandler} class="bg-[#0C376C] text-white rounded-lg">Add Option</button>
                        {:else if currentOption}
                            <input type="text" id="option" name="option" bind:value={currentOption.label} placeholder="Add Option" />
                            <button onclick={() => showFormPopup = false} class="bg-[#0C376C] text-white rounded-lg">Cancel</button>
                            <button onclick={addOptionHandler} class="bg-[#0C376C] text-white rounded-lg">Confirm</button> 
                        {/if}
                        <button onclick={() => showFormPopup = false} class="bg-[#0C376C] text-white rounded-lg">Cancel</button>
                        <button onclick={addFieldHandler} class="bg-[#0C376C] text-white rounded-lg">Confirm</button> 
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>