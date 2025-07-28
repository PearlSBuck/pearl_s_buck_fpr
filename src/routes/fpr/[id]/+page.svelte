<script lang="ts">
    // +page.svelte - Enhanced form display component with version support and fixed slug handling
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { formAnswers, loadOfflineAnswers, clearAnswers, submitAnswersToSupabase } from '$lib/stores/formAnswers';
    import Header from './Header.svelte'; // Import the Header component
    import cloneDeep from 'lodash/cloneDeep';
    import { displayedData } from '$lib/stores/formEditor';
    import {notification} from '$lib/stores/formEditor';
    import { isOnline } from '$lib/stores/online';
	import DataInput from '../DataInput.svelte';
    import { filledOutBy, SCId } from '$lib/stores/formAnswers';
    import { getUserList } from '$lib/utils/userList';

    export let data;
    let editModeData: any;
    let openDeletePopup = false;
    let openSubmitForm = false;
    let editMode = false;
    let isLoading = false;
    let error: string | null = null;
    let successMessage: string | null = null;
    let userList:[];
    $: show = $notification.type !== null;

    


    // Form data for editing
    let formTitle = data.form?.title || '';

    
    onMount(() => {
        loadOfflineAnswers();
        fetchUsers();
    });

    async function fetchUsers() {
        const { users, error } = await getUserList();
        if (error) {
            console.error('Failed to fetch user list:', error);
        } else {
            userList = users.map((user:any) => ({
                label:user.username,
                value:user.username
            }));
        }
    }



    // changes the referenced fields and sections so that UI is reactive
    // [NOTE to developer]: must implement a type for form data when everything is set in stone
    $: {
    displayedData.set(editMode ? editModeData : data);
    }
    // setter function for making displayedData reactive to temporary changes
    export function setEditMode(value: boolean) {
        editMode = value;

        if (editMode) {
        editModeData = cloneDeep(data);
        } else {
        editModeData = null;
        }
    }

    // useful for form submission
    // $: hasChanges = ($formDelta.fields.length > 0 || $formDelta.sections.length > 0);
    async function printInputs(){
        try {
            //all required answers were submitted successfully
            const missingFields = validateForm(data.form.sections)
            if(missingFields.length === 0){
                console.log($formAnswers);
                console.log($filledOutBy);
                console.log($SCId);
                const success = await submitAnswersToSupabase(data.form.id, 'FPR');
                if (success) {
                    notification.set({ message: 'Successfully submitted form entry', type: 'success' });
                    clearAnswers();
                } else {
                    notification.set({ message: 'Form submission failed', type: 'error' });
                }
            } else{
                console.log($filledOutBy);
                console.log($SCId);
                notification.set({ message: `Fill out ${missingFields[0]}`, type: 'error' });
            }

            setTimeout(() => {
            notification.set({ message: '', type: null });
        }, 3000);
        } catch(error){
            console.error(error);
        }

    }

    function formatDate(dateString: string) {
        if (!dateString) return 'No date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    function validateForm(sections:any) {
        const missingFields = [];

        for (const section of sections) {
            for (const field of section.fields) {
                if (field.required) {
                    const value = $formAnswers[field.id];

                    const isEmpty =
                        value === undefined || value === '' ||
                        (Array.isArray(value) && value.length === 0);

                    if (isEmpty) {
                        missingFields.push(field.label || field.name || field.id);
                    }
                }
            }
        }
        console.log(missingFields);
        console.log($formAnswers);
        // NOTE for QA: 
        //  if you want to test wihtout having to validate, make this return false
        return missingFields;
    }

    function clearMessages() {
        error = null;
        successMessage = null;
    }




  
    

    function getTotalFieldsCount(): number {
        if (!data.form?.sections) return 0;
        return data.form.sections.reduce((acc: number, section: any) => acc + (section.fields?.length || 0), 0);
    }

</script>


<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
   

<div class="bg-[#F6F8FF] min-h-screen">
    <!-- Header Section -->

    <Header 
        name={data.form?.title || 'Form View'} 
        search={false} 
        backButton={true} 
    />

<!-------------- ---------------------------->
    <!-- Main Content Container -->
     <div
        class="fixed top-4 z-70 right-4 px-4 py-2 rounded shadow-lg text-white transition-opacity  duration-300"
        class:bg-green-600={$notification.type === 'success'}
        class:bg-red-600={$notification.type === 'error'}>
        {$notification.message}
    </div>
    <div class="pt-4">
        {#if data.form}
            <!-- Form Title Header -->
            <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-end rounded-lg h-20 mt-16 relative z-10">
                {#if editMode}
                    <input 
                        type="text" 
                        bind:value={formTitle}
                        placeholder="Form Title"
                        class="bg-white text-[#1A5A9E] px-4 py-2 mb-2 rounded-md font-bold lg:text-3xl md:text-2xl sm:text-xl text-center w-full max-w-lg mx-4"
                        on:focus={clearMessages}
                    />
                {:else}
                    <div class="mb-2">{data.form.title}</div>
                {/if}
            </div>


            <!-- Main Form Container -->
            <div class="bg-white flex flex-col rounded-lg -mt-4 relative z-0 shadow-2xl">
                <!-- Form Meta Information and Actions -->
                <div class="p-6 pt-12 border-b border-gray-200">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <!-- Form Meta Info -->
                        <div class="text-sm text-gray-600 grid grid-cols-2 gap-4">
                            <div><strong>Form ID:</strong> {data.form.id}</div>
                            <div><strong>Created:</strong> {formatDate(data.form.createdAt)}</div>
                            <div><strong>Sections:</strong> {data.form.sections.length}</div>
                            <div><strong>Fields:</strong> {getTotalFieldsCount()}</div>
                        </div>

                        <!-- Action Buttons -->

                    </div>
                </div>
                {#if !$isOnline}
                 <div class="fixedleft-0 w-full bg-red-600 text-white z-50 py-2 shadow-md">
                    <div class="flex items-center justify-center">
                    <p class="font-semibold text-sm sm:text-base">
                        You are currently offline. Changes will be saved locally.
                    </p>
                    </div>
                </div>
                {/if}
                <!-- Alert Messages -->
                {#if error}
                    <div class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                {/if}

                {#if successMessage}
                    <div class="mx-6 mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
                        <span>✅</span>
                        <span>{successMessage}</span>
                    </div>
                {/if}

                <!-- Form Sections -->
                {#if data.form.sections && data.form.sections.length > 0}
                    <div class="p-6 space-y-8">
                        {#if $displayedData?.form}
                        <div class="w-full max-w-4xl mx-auto">
                        {#each $displayedData.form.sections as section, sectionIndex}
                            <div class="bg-[#F6F8FF] my-5 rounded-lg shadow-lg overflow-hidden">
                                <!-- Section Header -->
                                <div class="bg-[#474C58] text-white px-6 py-4 flex flex-row">
                                    <h2 class="text-xl font-bold">{section.title}</h2>
                                    

                                </div>
                                
                                <!-- Section Content -->
                                <div class="p-6">
                                    {#if section.fields && section.fields.length > 0}
                                        <div class="grid grid-cols-1 gap-6">
                                            {#each section.fields as field}
                                                <div class="space-y-2">
                                                    <DataInput
                                                        id={field.id}
                                                        type={field.type}
                                                        label={field.label}
                                                        name={field.name}
                                                        placeholder={field.placeholder}
                                                        required={field.required}
                                                        options={field.options}
                                                        value={$formAnswers[field.id] ?? ''}
                                                        on:change={(e) => {
                                                            formAnswers.update((answers) => {
                                                                const updated = { ...answers };

                                                                const value = e.detail;
                                                                const isEmpty =
                                                                    value === '' ||
                                                                    value === null ||
                                                                    (Array.isArray(value) && value.length === 0);

                                                                if (isEmpty) {
                                                                    delete updated[field.id];
                                                                } else {
                                                                    updated[field.id] = value;
                                                                    console.log(updated[field.id]);
                                                                }
                                                                return updated;
                                                            });
                                                        }}
                                                    />
                                                    <!-- 
                                                    The following block is commented out to avoid interfering with Svelte's block structure.
                                                    If you want to enable these field renderings, uncomment and ensure all {#each} and {#if} blocks are properly matched.
                                                    -->
                                                </div>
                                            {/each}
                                        </div>
                                    {:else}
                                        <div class="text-center py-8 text-gray-500 italic">
                                            No fields in this section.
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                        </div>
                        {/if}
                    </div>
                {:else}
                    <div class="p-6 text-center py-12 text-gray-500 italic">
                        No sections in this form.
                    </div>
                {/if}
                
            </div>
            <div class='flex justify-end'>
                <button type="button" 
                        class="bg-red-600 p-2 m-2 align-right text-white font-bold rounded-md shadow-lg hover:bg-red-700" 
                        on:click={() => {openDeletePopup=true}}>
                        Clear Form
                </button>
                <button type="button" 
                        class="bg-green-600 p-2 m-2 align-right text-white font-bold rounded-md shadow-lg hover:bg-green-700"                    
                        on:click={() => {openSubmitForm = true;}}>
                        Submit Form
                </button>
            </div>
        {:else}
            <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-center rounded-lg h-20 mt-16 relative z-10">
                Form Not Found
            </div>
            <div class="bg-white flex flex-col items-center justify-center rounded-lg h-64 -mt-4 relative z-0 shadow-2xl">
                <div class="text-center py-12 text-gray-500 italic">
                    No form data found.
                </div>
            </div>
        {/if}
    </div>
</div>



<!----------------------------------- POPUPS --------------------------------------------------------->

<!-- clear all fields confirmation popup -->
{#if openDeletePopup}
<div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
	<!-- Modal content -->
	<div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 text-center space-y-4">
		<!-- Icon -->
		<div class="mx-auto w-16 h-16">
			<svg fill="#e01f1f" viewBox="0 -8 72 72" xmlns="http://www.w3.org/2000/svg" stroke="#e01f1f">
				<path d="M15.8,49.7H56.22a3.78,3.78,0,0,0,3.36-5.5L39.38,8.39a3.8,3.8,0,0,0-6.78,0L12.4,44.2A3.81,3.81,0,0,0,15.8,49.7Zm23.38-8.33a3.29,3.29,0,1,1-6.58,0V41.3a3.29,3.29,0,0,1,6.58,0ZM34.11,17.18h3.8a1.63,1.63,0,0,1,1.54,2L37.79,33.75a1.78,1.78,0,0,1-3.56,0L32.56,19.19A1.64,1.64,0,0,1,34.11,17.18Z" />
			</svg>
		</div>

		<!-- Message -->
		<p class="text-lg font-medium text-gray-800">Are you sure you want to clear all entries?</p>

		<!-- Buttons -->
		<div class="flex flex-col sm:flex-row justify-center gap-2 mt-4">
			<button
				class="w-full sm:w-auto px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition"
				on:click={() => (openDeletePopup = false)}
			>
				Cancel
			</button>
			<button
				class="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
				on:click={() => {
					// Replace with your delete logic
					clearAnswers();
					openDeletePopup = false;
				}}
			>
				Delete
			</button>
		</div>
	</div>
</div>
{/if}

<!-- clear all fields confirmation popup -->
{#if openSubmitForm}
<div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
	<!-- Modal content -->
	<div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-4">
		<!-- Icon -->
		<div class="mx-auto w-16 h-16">
			<svg fill="#43A047" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 226.834 226.834" xml:space="preserve" stroke="#43A047"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M80.197,44.939v-9.746c0-1.761,1.433-3.193,3.193-3.193h60.053c1.761,0,3.193,1.433,3.193,3.193v9.746 c0,1.761-1.433,3.193-3.193,3.193H83.391C81.63,48.133,80.197,46.7,80.197,44.939z M131.841,17c-0.768-9.5-8.729-17-18.424-17 S95.761,7.5,94.993,17H131.841z M192.309,55.334v151.333c0,11.12-9.047,20.167-20.167,20.167H54.692 c-11.12,0-20.167-9.047-20.167-20.167V55.334c0-11.12,9.047-20.167,20.167-20.167h10.506c0,0.009-0.001,0.018-0.001,0.026v9.746 c0,10.032,8.162,18.193,18.193,18.193h60.053c10.032,0,18.193-8.161,18.193-18.193v-9.746c0-0.009-0.001-0.018-0.001-0.026h10.506 C183.262,35.167,192.309,44.214,192.309,55.334z M88.183,143.449c-3.526-2.173-8.147-1.077-10.32,2.449l-7.092,11.504l-3.661-2.884 c-3.252-2.563-7.97-2.002-10.532,1.252c-2.563,3.255-2.002,7.97,1.252,10.533l10.271,8.089c1.332,1.049,2.969,1.607,4.64,1.607 c0.436,0,0.875-0.038,1.311-0.115c2.105-0.374,3.952-1.629,5.074-3.449l11.506-18.666C92.806,150.243,91.709,145.623,88.183,143.449 z M88.183,89.449c-3.526-2.174-8.147-1.076-10.32,2.449l-7.092,11.504l-3.661-2.884c-3.252-2.562-7.97-2.002-10.532,1.252 c-2.563,3.255-2.002,7.97,1.252,10.533l10.271,8.089c1.332,1.049,2.969,1.607,4.64,1.607c0.436,0,0.875-0.038,1.311-0.115 c2.105-0.374,3.952-1.629,5.074-3.449L90.632,99.77C92.806,96.243,91.709,91.623,88.183,89.449z M165.858,168.5 c0-4.143-3.357-7.5-7.5-7.5h-49c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h49C162.501,176,165.858,172.643,165.858,168.5z M165.858,114.5c0-4.143-3.357-7.5-7.5-7.5h-49c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h49 C162.501,122,165.858,118.643,165.858,114.5z"></path> </g></svg>
		</div>

		<!-- Message -->
        <DataInput
            type='select'
            label='Filled out by'
            name='Filled out by'
            placeholder='Enter value...'
            required={true}
            options = {userList}
            bind:value={$filledOutBy}
        /><DataInput
            type='text'
            label="Sponsored Child's ID"
            name="Sponsored Child's ID"
            placeholder='Enter value...'
            required={true}
            
            bind:value={$SCId}
        />
		<!-- Buttons -->
		<div class="flex flex-col sm:flex-row justify-center gap-2 mt-4">
			<button
				class="w-full sm:w-auto px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition"
				on:click={() => (openSubmitForm = false)}
			>
				Cancel
			</button>

			<button
				class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
				on:click={() => {
                    if($isOnline){
                        // Replace with your delete logic
                        openSubmitForm = false;
                        printInputs();
                    } else{
                        notification.set({ message: 'Error: Cannot submit form while offline.', type: 'error' });
                    }
                }}
			>
				Submit
			</button>
		</div>
	</div>
</div>
{/if}
                                                    