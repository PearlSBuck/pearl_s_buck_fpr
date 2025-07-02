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
    let versionInput: string = $state("");
    // shows the current form
    let showForm: boolean = $state(false);

    const formSections: IFormSections[] = $state([]);
    const sectionFields: Record<string, IFormFields[]> = $state({});
    let showEditTitle: boolean = $state(false);

    // initializing the form
    function CreateFormHandler() {
        titleInput = "";
        versionInput = "";
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
                version: "",
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

    function deleteSectionHandler(index: number) {
        if (confirm("Are you sure you want to delete this section?")) {
            formSections.splice(index, 1);
        }
    }

    async function saveFormHandler() {
        if (!form) return alert("No form to save!");
        if (form.version === "") return alert("Version cannot be empty!");

        const response = await fetch('/admin/forms/create', {
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
            showForm = false;
        } else {
            alert("Failed to save form.");
        }
    }
</script>

<div class="fixed overflow-auto top-0 left-0 h-full w-full flex flex-col bg-[#F6F8FF]">
    {#if !showForm}
        <div>
            {#if !showTitleInput}
                <button onclick={CreateFormHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Create</button>
            {:else}
                <input type="text" id="title" name="title" bind:value={titleInput} required placeholder="Enter a title..." />
                <button onclick={AddFormHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Create Form</button>
                <button onclick={() => showTitleInput = false} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Cancel</button>
            {/if} 
        </div>
    {:else}
        {#if form}
            <div>
                <p>Form Title: {form.title}</p>
                <p>Date Created: {form.dateCreated}</p>
                <label>
                    Version: 
                    <input type="text" id="version" name="version" bind:value={form.version} placeholder="Enter form version..." />
                </label>
                <button onclick={AddSectionHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Add Section</button>
                <button onclick={saveFormHandler} class="bg-green-600 text-white rounded-lg px-5 ml-2 cursor-pointer">Save Form</button>            
            </div>
        {/if}
        <div>
            {#each formSections as section, index}
                <div class="flex justify-center py-3">
                    <div class="flex flex-col w-3/5 shadow-xl/10 inset-shadow-sm rounded-lg p-8 bg-white">
                        <div class="flex justify-between">
                            <div class="flex items-center">
                                {#if !showEditTitle}
                                    <p class="text-[32px] text-[#1A5A9E] font-bold">{section.title}</p>
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button onclick={() => showEditTitle = true} class="ml-2 pt-2 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 26" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                        </svg>
                                    </button> 
                                {:else}
                                    <input type="text" id="title" name="title" bind:value={section.title} required />
                                    <div class="px-3">
                                        <button onclick={() => showEditTitle = false} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Save</button> 
                                    </div>
                                {/if}
                            </div>
                            <div>
                                <button onclick={() => deleteSectionHandler(index)} class="cursor-pointer">
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="size-7 pt-2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <FormSections 
                            id = { section.id }
                            formId = { section.formId }
                            title = { section.title }
                            orderIndex = { section.orderIndex } 
                            onFieldsChange={(fields) => sectionFields[section.id] = fields}
                        />
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>