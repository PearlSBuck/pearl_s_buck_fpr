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

    // initializing the form field
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

    // initializing the field option
    function createOptionHandler() {
        currentOption = {
            label: "",
            value: "",
        }
        showOptionPrompt = true;
    }

    // adding the newly made field
    function addFieldHandler() {
        if (currentField) {
            if (currentField.type === "") {
                alert("Type cannot be empty!");
            } else if (currentField.label === "") {
                alert("Label cannot be empty!");
            } else {
                formFields.push(currentField);
                showFormPopup = false;
            }
        }
        
    }

    // adding the newly made option
    function addOptionHandler() {
        if (currentField && currentOption) {
            if (currentOption.label != "") {
                if (!currentField.options) {
                    currentField.options = [];
                } else {
                    currentField.options.push(currentOption);
                    showOptionPrompt = false;
                }
            } else {
                alert("Label cannot be empty!");
            }
        }
        
    }
</script>

<div class="flex justify-center">
    <div class="flex flex-col w-1/2 shadow-xl/10 inset-shadow-sm rounded-lg">
        <div>
            {#if !showEditTitle}
                <p>Section Title: {title}</p>
                <button onclick={() => showEditTitle = true} class="bg-[#0C376C] text-white rounded-lg px-5">Edit Title</button> 
            {:else}
                <input type="text" id="title" name="title" bind:value={title} required />
                <button onclick={() => showEditTitle = false} class="bg-[#0C376C] text-white rounded-lg px-5">Save</button> 
            {/if}
        </div>
        {#each formFields as field}
            <!-- placeholder -->
            <p>Label: {field.label}</p>
            <p>Required: {field.required}</p>
            <p>Type: {field.type}</p>
            {#each field.options as option}
                <label>
                    <input type="checkbox" id="option" name="option" disabled />
                    {option.label}
                </label>
            {/each}
        {/each}
        <!-- currently broken, have to make this part a popup -->
        <div>
            {#if !showFormPopup}
                <button onclick={createFieldHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Add Question</button>
            {:else}
                {#if currentField}
                    <!-- need to make this a popup -->
                    <div class="flex flex-col shadow-md rounded-lg">
                        <div>
                            <select id="type" name="type" bind:value={currentField.type} >
                                <option value="" disabled hidden>Select Type of Question</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="multiple_choice">Multiple Choice</option>
                            </select>
                        </div>
                        <div>
                            <label>
                                Label:
                                <input type="text" id="label" name="label" bind:value={currentField.label} required placeholder="Add Label" />
                            </label>
                        </div>
                        <div>
                            <label>
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
                        <!-- another popup for options as well -->
                        {#if currentField.type === "multiple_choice" && !showOptionPrompt}
                            <div>
                                <button onclick={createOptionHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Add Option</button>
                            </div>
                        {:else if currentOption}
                            <div>
                                <input type="text" id="option" name="option" bind:value={currentOption.label} placeholder="Add Option" />
                            </div>
                            <div>
                                <button onclick={() => showFormPopup = false} class="bg-[#0C376C] text-white rounded-lg px-5">Cancel</button>
                                <button onclick={addOptionHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Confirm</button> 
                            </div>
                        {/if}
                        <div>
                            <button onclick={() => showFormPopup = false} class="bg-[#0C376C] text-white rounded-lg px-5">Cancel</button>
                            <button onclick={addFieldHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Confirm</button> 
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>