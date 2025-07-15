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
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Header from '../../../../../components/Header.svelte';
    import Confirm from '../../../../../components/Confirm.svelte';

    export let data: { user: any };
    let user = data.user;
    let userID: string;
    let show = false;
    let editMode = false;
    let isAdmin = user?.role === 'Admin';
    let tempUser = { ...user };

    $: userID = $page.params.id;

    async function saveChanges(userId: string) {
        const response = await fetch('/admin/manage/edit', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tempUser,
                userID: userId
            })
        });

        const result = await response.json();
        if (result.error) {
            console.error('Failed to save changes:', result.error);
        } else {
            editMode = false;
        }

        location.reload();
    }

    function cancelEdit() {
        tempUser = { ...user }; 
        editMode = false;
    }

    async function toggleAdminPerms(){
        try {
            const response = await fetch('/admin/manage/toggle-admin', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userID})
            });

            const result = await response.json();

            if (result.success) {
                location.reload();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error updating user permissions:', error);
            alert('Error updating user permissions: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    onMount(() => {
        if (!user) {
            alert('User not found');
            goto('/users/edit');
        }
    });

    function toggleConfirm(){
        show = !show;
    }

    function toggleEditMode(){
        editMode = !editMode;
    }

    async function deleteUser(userId: string) {
            try {
                const response = await fetch ('/admin/manage/delete', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userID: userId}),
                })

                const result = await response.json();

                if (result.success) {
                    alert('User deleted sucessfully!');
                    goto('/admin/manage');
                } else {
                    throw new Error(result.error || 'Unknown error');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            alert('Error deleting user: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
    }
</script>

<div class="app-container">
    <!-- Header -->
    <Header name="Manage User" search={false} backButton={true} />

    <div class="content-area flex flex-col items-center bg-blue-50 pt-8 px-6 pb-8">
        <!-- User Card -->
        <div class="w-full max-w-full bg-white rounded-xl shadow p-8 flex flex-col md:flex-row items-center justify-between mb-8">
            <div class="flex flex-col items-center md:items-start flex-1">
                    <div class="text-2xl font-bold">{user?.username || 'Loading...'}</div>
                    <div class="text-gray-500 text-lg">{user?.role || 'Loading...'}</div>
            </div>
        </div>


        <!-- Profile + Permissions Grid -->
        <div class="w-full max-w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Profile Details -->
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex justify-between items-center border-b pb-2 mb-4">
                <h2 class="font-bold text-lg">Profile Details</h2>
                <button class="text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Edit Profile" title="Edit Profile" on:click={toggleEditMode}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
                </div>
                {#if editMode}
                <div class="flex flex-col">
                    <label class="mb-2">
                    <strong>Full Name:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempUser.fullname}
                        placeholder="Full Name"
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Email:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempUser.email}
                        placeholder="Full Name"
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Age:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempUser.age}
                        placeholder="Full Name"
                    />
                    </label>
                    <label class="mb-2">
                    <strong>Residence:</strong>
                    <input
                        type="text"
                        class="border rounded-xl px-2 py-1 ml-4 w-64"
                        bind:value={tempUser.residence}
                        placeholder="Full Name"
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
                        on:click={() => saveChanges(userID)}
                        class="px-4 py-2 bg-[#9ABDDC] hover:bg-[#1A5A9E] rounded-lg"
                        aria-label= "Save Changes"
                        >
                        Save Changes
                    </button>
                 </div>

                {:else}
                <div class="mb-2"><strong>Full Name:</strong> {user?.fullname || 'N/A'}</div>
                <div class="mb-2"><strong>Email:</strong> {user?.email || 'N/A'}</div>
                <div class="mb-2"><strong>Age:</strong> {user?.age ?? 'N/A'}</div>
                <div class="mb-2"><strong>Residence:</strong> {user?.residence || 'N/A'}</div>
                {/if}
            </div>

            <!-- Access Permissions -->
            <div class="bg-white rounded-xl shadow p-6">
                <h2 class="font-bold text-lg border-b pb-2 mb-4">Access Permissions</h2>
                <div class="flex justify-between items-center">
                    <span> Allow user to gain access admin features</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" bind:checked={isAdmin} on:change={toggleAdminPerms}>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Delete Section -->
        <div class="w-full max-w-full bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h3 class="text-lg font-semibold text-red-600 mb-1">Delete Account</h3>
                    <p class="text-gray-600 text-sm">
                        Permanently remove this user account and all associated data.
                    </p>
                </div>
                <button 
                    on:click={toggleConfirm}
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete User
                </button>
                <Confirm 
                    bind:show={show} 
                    ids={[user.id]} 
                    onConfirmAction={async (ids) => await deleteUser(ids[0] as string)} 
                    onCancel={() => {}} 
                    deleteMessage="Are you sure you want to delete this user?" />
            </div>
        </div>
    </div>

</div>