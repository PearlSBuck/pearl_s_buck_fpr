<svelte:options runes={true} />
<script lang='ts'>
	import { getContext, onMount } from 'svelte';
    import Header from '../../../../components/Header.svelte';
    let pageName = "Forms Management";

    import FormSections from './FormSections.svelte';
    import type { IForms, IFormSections, IFormFields } from './model.ts';

    // the current form
    let form: IForms = $state({
        title: "",
        version: "",
        dateCreated: "",
    });
    // shows the current form
    let showForm: boolean = $state(false);

    let formSections: IFormSections[] = $state([]);
    let sectionFields: Record<string, IFormFields[]> = $state({});
    let showEditTitle: boolean = $state(false);
    let sectionIndex: number = $state(-1);

    // adding a new section
    function addSectionHandler() {
        formSections.push({
            title: "New Section",
            orderIndex: formSections.length,
        });
    }

    function deleteSectionHandler(index: number) {
        if (confirm("Are you sure you want to delete this section?")) {
            formSections.splice(index, 1);
        }
    }

    function editTitleHandler(val: boolean, index: number) {
        showEditTitle = val;
        sectionIndex = index;
    }

    function resetFields() {
        showForm = false;
        form = {
            title: "",
            version: "",
            dateCreated: "",
        };
        formSections = [];
        sectionFields = {};
        sectionIndex = -1;
    }
    
    function createFormHandler() {
        if (formSections.length === 0) {
            addSectionHandler();
        }
        showForm = true;
    }

    async function saveFormHandler() {
        if (!form) return alert("No form to save!");
        if (form.title === "") return alert("Title cannot be empty!")
        if (form.version === "") return alert("Version cannot be empty!");
        if (formSections.length === 0) return alert("Forms must have at least one section!")

        form.dateCreated = new Date();

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
            resetFields();
        } else {
            alert("Failed to save form.");
        }
    }

    const setPageContext:any = getContext('setPageContext');
    onMount(() => {

    setPageContext(pageName,false,true);
    })
</script>


<div class="fixed overflow-auto top-0 left-0 h-full w-full flex flex-col bg-[#F6F8FF]">
    <div class="pt-27 flex flex-col px-10">   
        <div class="w-full shadow-md/20 rounded-lg bg-white p-5">
            <div>
                <label class="text-lg">
                    Form Title:
                    <input class="rounded-full m-0 h-5 w-47.5" type="text" id="title" name="title" bind:value={form.title} placeholder="Enter a title..." />
                </label>
            </div>
            <div class="md:flex md:justify-between md:pt-3">
                <div>
                    <label class="text-lg">
                        Version: 
                        <input class="rounded-full m-0 h-5" type="text" id="version" name="version" bind:value={form.version} placeholder="Enter form version..." />
                    </label>
                </div>
                <div class="flex justify-center pt-2">
                    <button onclick={createFormHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Create</button>
                </div>
            </div>
        </div> 
        {#if showForm}
            <div class="flex justify-center pt-3">
                <div class="flex justify-end w-full md:w-3/5">
                    <button onclick={saveFormHandler} class="bg-green-600 text-white rounded-lg px-5 ml-2 cursor-pointer">Save Form</button>            
                </div>
            </div>
            <div>
                {#each formSections as section, index}
                    <div class="flex justify-center py-3">
                        <div class="flex flex-col w-full md:w-3/5 shadow-md/20 rounded-lg p-5 md:p-8 bg-white">
                            <div class="flex flex-col-reverse md:flex-row md:justify-between">
                                <div class="flex items-center">
                                    {#if showEditTitle && index === sectionIndex}
                                        <input class="w-53" type="text" id="title" name="title" bind:value={section.title} />
                                        <div class="px-3">
                                            <button onclick={() => editTitleHandler(false, -1)} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Save</button> 
                                        </div>
                                    {:else}
                                        <p class="text-[24px] md:text-[32px] text-[#1A5A9E] font-bold">{section.title}</p>
                                        <!-- svelte-ignore a11y_consider_explicit_label -->
                                        <button onclick={() => editTitleHandler(true, index)} class="ml-2 pt-2 cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 26" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button> 
                                    {/if}
                                </div>
                                <div class="flex justify-end mb-3">
                                    <button onclick={() => deleteSectionHandler(index)} class="cursor-pointer">
                                        <!-- svelte-ignore a11y_consider_explicit_label -->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="size-7 pt-2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <FormSections 
                                title = { section.title }
                                orderIndex = { section.orderIndex } 
                                onFieldsChange={(fields) => sectionFields[section.orderIndex] = fields}
                            />
                        </div>
                    </div>
                {/each}
            </div>
            <div class="flex justify-center">
                <div class="flex justify-end w-full md:w-3/5">
                    <button onclick={addSectionHandler} class="bg-[#0C376C] text-white rounded-lg px-5 cursor-pointer">Add Section</button>
                </div>
            </div>
        {/if}
    </div>
</div>