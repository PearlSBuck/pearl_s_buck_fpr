<!-- TODO:
- Make popups for questions
- Add edit functionality
- Add delete functionality
- Connect to database
- Frontend
-->

<script lang='ts'>
    import FormSections from './FormSections.svelte';
    import type { IForms, IFormSections } from './model.ts';

    // the current form
    let form: IForms | undefined = $state();
    // prompt when asking for the title of the form
    let showTitleInput: boolean = $state(false);
    // the title of the form
    let titleInput: string = $state("");
    // shows the current form
    let showForm: boolean = $state(false);

    const formSections: IFormSections[] = $state([]);

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
                id: 0, // placeholder
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
                id: 0, // placeholder
                formId: form.id,
                title: "New Section",
                orderIndex: formSections.length,
            });
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
            <button class="bg-green-600 text-white rounded-lg px-5 ml-2">Save Form</button>            
        </div>
        <div>
            {#each formSections as section}
                <FormSections 
                    id = { section.id }
                    formId = { section.formId }
                    bind:title = { section.title }
                    orderIndex = { section.orderIndex } 
                />
            {/each}
        </div>
    {/if}
</div>