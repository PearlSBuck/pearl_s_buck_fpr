<style>
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    .content-area {
        flex: 1;
        background-color: #EFF6FF;
        margin-top: 0px;
        padding-top: 140px;
    }
</style>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { getContext, onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/db';

    export let data: { child: any };
    let child = data.child;
    let editMode = false;
    let tempChild = { ...child };


// Fetches the backend for saving the child details
    async function saveChanges(childID: number) {
        try {

            const response = await fetch('/admin/children/edit', {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tempChild,
                    childID
                })
            });

            const result = await response.json();
            if (result.error) {
                console.error('Failed to save changes:', result.error);
            } else {
                editMode = false;
            }

            location.reload();
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Error saving changes: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
// cancel the edit mode and revert changes
    function cancelEdit() {
        tempChild = { ...child }; 
        editMode = false;
    }

    
// checks if the child exists, if not redirects to manage page
    onMount(() => {
        if (!child) {
            alert('Child record not found');
            goto('/admin/children');
        }
    });

// Function to toggle edit mode
    function toggleEditMode(){
        editMode = !editMode;
    }

// Get the page context to set the title and visibility
    const setPageContext:any = getContext('setPageContext');
    onMount(() => {
        setPageContext("Manage child",false,true);
    })
</script>

<div class="app-container">
    <!-- Header -->

    <div class="content-area flex flex-col items-center bg-blue-50 pt-8 px-6 pb-8">
        <!-- child Card -->
        <div class="w-full max-w-full bg-white rounded-xl shadow p-8 flex flex-col md:flex-row items-center justify-between mb-8">
            <div class="flex flex-col items-center md:items-start flex-1">
                    <div class="text-2xl font-bold">{child?.child_name || 'Loading...'}</div>
                    <div class="text-gray-500 text-lg">Child ID: {child?.child_id || 'Loading...'}</div>
            </div>
        </div>


        <!-- Profile + Permissions Grid -->
        <div class="w-full max-w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Child Details -->
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex justify-between items-center border-b pb-2 mb-4">
                <h2 class="font-bold text-lg">Child Details</h2>
                <button class="text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Edit Profile" title="Edit Profile" on:click={toggleEditMode}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
                </div>
                {#if editMode}
                <div class="flex flex-col">
                    <label class="mb-2">
                    <strong>Child Name:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.child_name}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Birthday:</strong>
                    <input
                        type="date"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.birthday}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Gender:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.gender}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Address Line:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.address_line}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>City:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.city}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>State/Province:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.state_province}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Postal Code:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.postal_code}
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Country:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempChild.country}
                    />
                    </label>
                </div>
                <!-- Cancel and Save Buttons -->
                 <div class="flex justify-end mt-4 gap-2">
                    <button
                        on:click={cancelEdit}
                        class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg "
                        aria-label= "Cancel Changes"
                    >
                        Cancel
                    </button>
                    <button
                        on:click={() => saveChanges(($page.params.id) as unknown as number)}
                        class="px-4 py-2 bg-[#9ABDDC] hover:bg-[#1A5A9E] rounded-lg"
                        aria-label= "Save Changes"
                        >
                        Save Changes
                    </button>
                 </div>

                {:else}
                <div class="mb-2"><strong>Child Name:</strong> {child?.child_name || 'N/A'}</div>
                <div class="mb-2"><strong>Birthday:</strong> {child?.birthday || 'N/A'}</div>
                <div class="mb-2"><strong>Gender:</strong> {child?.gender || 'N/A'}</div>
                <div class="mb-2"><strong>Address Line:</strong> {child?.address_line ?? 'N/A'}</div>
                <div class="mb-2"><strong>City:</strong> {child?.city || 'N/A'}</div>
                <div class="mb-2"><strong>State/Province:</strong> {child?.state_province || 'N/A'}</div>
                <div class="mb-2"><strong>Postal Code:</strong> {child?.postal_code || 'N/A'}</div>
                <div class="mb-2"><strong>Country:</strong> {child?.country || 'N/A'}</div>
                {/if}
            </div>

            <!-- Access Permissions -->
            <!-- <div class="bg-white rounded-xl shadow p-6">
                <h2 class="font-bold text-lg border-b pb-2 mb-4">Access Permissions</h2>
                <div class="flex justify-between items-center">
                    <span> Allow child to gain access admin features</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" bind:checked={isAdmin} on:change={toggleAdminPerms}>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div> -->
        </div>
    </div>
</div>