<style>
    .page-header {
        background-color: white;
        padding: 1rem 2rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        width: 100%;
        display: flex;            
        justify-content: center;  
        align-items: center;      
    }
    .sub-header {
        background-color: #474c58;
        color: white;
        padding: 0.05rem 2rem;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .back-button {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background-color: #1f5bb6;
        padding: 0.10rem .75rem;
        margin: 0.30rem 0 0.30rem 1rem;
        border-radius: 2rem;
        margin-left: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s, box-shadow 0.2s;
    }
    .back-button:hover {
        background-color: #1d4ed8;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    .content-area {
        flex: 1;
        background-color: #EFF6FF;
    }
</style>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/db';

    export let data: { user: any };
    let user = data.user;

    async function deleteUser() {
        if (confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id);

            if (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user: ' + error.message);
            } else {
                alert('User deleted successfully!');
                goto('/users/edit');
            }
        }
    }
</script>

<div class="app-container">
    <!-- Header -->
    <header>
        <div class="page-header">
            <h1 class="text-3xl font-bold">Pearl S. Buck Foundation Philippines, Inc.</h1>
        </div>
        <div class="sub-header">
            <h2 class="text-base font-semibold">Manage User</h2>
            <button onclick={() => goto('/users/edit')} class="back-button">
                Back
            </button>
        </div>
    </header>

    <div class="content-area flex flex-col items-center bg-blue-50 pt-8 px-6 pb-8">
        <!-- User Card -->
        <div class="w-full max-w-full bg-white rounded-xl shadow p-8 flex flex-col md:flex-row items-center justify-between mb-8">
            <div class="flex flex-col items-center md:items-start flex-1">
                    <div class="text-2xl font-bold">{user?.username || 'Loading...'}</div>
                    <div class="text-gray-500 text-lg">{user?.role || 'Loading...'}</div>
            </div>
            <div class="flex-1 text-center md:text-right text-base font-normal text-gray-700">
                This is a sample description
            </div>
        </div>


        <!-- Profile + Permissions Grid -->
        <div class="w-full max-w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Profile Details -->
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex justify-between items-center border-b pb-2 mb-4">
                <h2 class="font-bold text-lg">Profile Details</h2>
                <button class="text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Edit profile" title="Edit profile">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
                </div>
                <div class="mb-2"><strong>Fullname:</strong> {user?.fullname || 'N/A'}</div>
                <div class="mb-2"><strong>Email:</strong> {user?.email || 'N/A'}</div>
                <div class="mb-2"><strong>Age:</strong> {user?.age ?? 'N/A'}</div>
                <div class="mb-2"><strong>Residence:</strong> {user?.residence || 'N/A'}</div>
            </div>

            <!-- Access Permissions -->
            <div class="bg-white rounded-xl shadow p-6">
                <h2 class="font-bold text-lg border-b pb-2 mb-4">Access Permissions</h2>
                <div class="flex justify-between items-center mb-4">
                    <span>1. Allow to send reports.</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <div class="flex justify-between items-center  mb-4">
                    <span>2. Allow to view other's profile</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <div class="flex justify-between items-center">
                    <span>3. Allow to have admin features</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" checked>
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
                    onclick={deleteUser}
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete User
                </button>
            </div>
        </div>
    </div>

</div>