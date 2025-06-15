<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 18l-7-5 7-5"/>
            </svg>
            Back
        </button>
        <div class="text-sm">
            <span class="text-gray-600 mr-1.5">Manage User</span>
        </div>
    </div>

    <!-- User Card -->
    <div class="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-center gap-4">
    <div class="flex items-center gap-4">
        <div class="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center">
            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
        </div>
        <div>
        <div class="text-2xl font-bold">Username</div>
        <div class="text-gray-500 text-lg">Role</div>
        </div>
    </div>
    <div class="text-gray-600 text-center md:text-left text-base font-medium">
        This is a sample description
    </div>
    </div>

    <!-- Profile + Permissions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Profile Details -->
    <div class="bg-white rounded-xl shadow p-4 space-y-2 relative">
        <div class="flex justify-between items-center border-b pb-2 mb-2">
        <h2 class="font-bold text-lg">Profile Details</h2>
        <button class="text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Edit profile" title="Edit profile">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
        </button>
        </div>
        <div><strong>Fullname:</strong> Juan Dela Cruz</div>
        <div><strong>Birthdate:</strong> December 25, 2004</div>
        <div><strong>Age:</strong> 20</div>
        <div><strong>Residence:</strong> Muntinlupa City</div>
    </div>

    <!-- Access Permissions -->
    <div class="bg-white rounded-xl shadow p-4 space-y-4">
        <h2 class="font-bold text-lg border-b pb-2">Access Permissions</h2>
        <div class="flex justify-between items-center">
        <span>1. Allow to send reports.</span>
        <input type="checkbox" class="toggle toggle-md" />
        </div>
        <div class="flex justify-between items-center">
        <span>2. Allow to view other's profile</span>
        <input type="checkbox" class="toggle toggle-md" checked />
        </div>
        <div class="flex justify-between items-center">
        <span>3. Allow to have admin features</span>
        <input type="checkbox" class="toggle toggle-md" checked />
        </div>
    </div>
    </div>
</div>