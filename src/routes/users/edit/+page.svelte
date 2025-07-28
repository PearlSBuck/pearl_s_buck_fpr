<script lang="ts">    
    import { goto } from '$app/navigation';
    import { getContext, onMount } from 'svelte';
    import { supabase } from '$lib/db';
    import Header from '../../../components/Header.svelte';

    let users: any[] = [];
    let searchTerm = '';
    let pageName = "User Management Page";

    const setPageContext:any = getContext('setPageContext');
    onMount(async () => {

        setPageContext(pageName,false,false);
        const { data, error } = await supabase.from('users').select('id, username, role');

        if (error) {
        console.error('Error fetching users:', error.message);
        } else {
        users = data || [];
        }
    });

    function viewUser(id: string) {
        goto(`/users/${id}/manage`);
    }

    function createAccount() {
        goto('/users/create');
    }

    // Filter users based on search term
    $: filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );


</script>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-center mt-30">

        <!-- Main Content Card -->
        <div class="bg-white rounded-xl shadow p-6">
            <h1 class="flex items-center justify-center text-2xl font-bold mb-6">Edit User</h1>
            
            <!-- Search and Create Button -->
            <div class="flex items-center gap-4 mb-6">
                <div class="relative flex-1 max-w-sm">
                    <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input 
                        type="text" 
                        bind:value={searchTerm}
                        placeholder="Search by Name" 
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button 
                    on:click={createAccount}
                    class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Create Account
                </button>
            </div>

            <!-- Users List -->
            <div class="space-y-3">
                {#each filteredUsers as user, index}
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <div class="flex items-center gap-3">
                            <span class="font-semibold text-gray-900">{index + 1}.</span>
                            <div>
                                <div class="font-semibold text-gray-900">{user.username}</div>
                                <div class="text-sm text-gray-500">{user.role}</div>
                            </div>
                        </div>
                        <button
                            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            on:click={() => viewUser(user.id)}
                        >
                            View
                        </button>
                    </div>
                {/each}
                
                {#if filteredUsers.length === 0}
                    <div class="text-center py-8 text-gray-500">
                        {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                    </div>
                {/if}
            </div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 m-2">
            <h1 class="flex items-center justify-center text-2xl font-bold mb-6">Audit Log</h1>
            <div class="space-y-3">
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <div class="flex items-center gap-3">
                        baller
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>