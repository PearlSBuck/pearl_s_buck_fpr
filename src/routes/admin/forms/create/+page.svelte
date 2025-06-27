<!-- TODO:
- Make popups for questions
- Add edit functionality
- Add delete functionality
- Connect to database
- Frontend
-->
<svelte:options runes={true} />
<script lang='ts'>
    import FormSections from './FormSections.svelte';
    import type { IForms, IFormSections, IFormFields } from './model.ts';

    // the current form
    let form: IForms | undefined = $state();
    // prompt when asking for the title of the form
    let showTitleInput: boolean = $state(false);
    // the title of the form
    let titleInput: string = $state("");
    // shows the current form
    let showForm: boolean = $state(false);

    const formSections: IFormSections[] = $state([]);
    const sectionFields: Record<string, IFormFields[]> = $state({});

    // initializing the form
    function CreateFormHandler() {
        titleInput = "";
        showTitleInput = true;
    }

    // adding the newly made form
    function AddFormHandler() {
        if (titleInput != "") {
            let currentDate = new Date();
            form = {
                id: "", // placeholder
                title: titleInput,
                dateCreated: currentDate,
            };
            showTitleInput = false;
            showForm = true;
        } else {
            alert("Title cannot be empty!")
        }
    }

    // adding a new section
    function AddSectionHandler() {
        if (form) {
            formSections.push({
                id: "", // placeholder
                formId: form.id,
                title: "New Section",
                orderIndex: formSections.length,
            });
        }
    }

    async function saveFormHandler() {
    if (!form) return alert("No form to save!");

    const response = await fetch('/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            form,
            formSections,
            sectionFields
        })
    });

    const result = await response.json();
    if (result.success) {
        alert("Form saved!");
        // Optionally, clear/reset the form here
    } else {
        alert("Failed to save form.");
    }
}
</script>

<div class="flex flex-col bg-[#F6F8FF]">
    {#if !showForm}
        <div>
            {#if !showTitleInput}
                <button onclick={CreateFormHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Create</button>
            {:else}
                <input type="text" id="title" name="title" bind:value={titleInput} required placeholder="Enter a title..." />
                <button onclick={AddFormHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Create Form</button>
                <button onclick={() => showTitleInput = false} class="bg-[#0C376C] text-white rounded-lg px-5">Cancel</button>
            {/if} 
        </div>
    {:else}
        <div>
            <p>Form Title: {form?.title}</p>
            <p>Date Created: {form?.dateCreated}</p>
            <button onclick={AddSectionHandler} class="bg-[#0C376C] text-white rounded-lg px-5">Add Section</button>
            <button onclick={saveFormHandler} class="bg-green-600 text-white rounded-lg px-5 ml-2">Save Form</button>            
        </div>
        <div>
            {#each formSections as section}
                <FormSections 
                    id = { section.id }
                    formId = { section.formId }
                    bind:title = { section.title }
                    orderIndex = { section.orderIndex } 
                    onFieldsChange={(fields) => sectionFields[section.id] = fields}
                />
            {/each}
        </div>
    {/if}
</div>