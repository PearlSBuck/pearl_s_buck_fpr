<script lang="ts">
    import { supabase } from '$lib/db'
  // Wait for logic, just placeholder variables if needed
    let showPassword = false;
    function togglePassword() {
        showPassword = !showPassword;
    }

    let username = ''
    let email = ''
    let password = ''
    let role = ''

    function clearForm() {
        username = ''
        email = ''
        password = ''
        role = ''
    }

    async function createUser() {
        const { data, error } = await supabase.from('users').insert([
            { username, email, password, role }
        ])

        if (error) {
            console.error('Full error object:', error);
            console.error('Error message: ', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            alert(`Error: ${error.message}\nDetails: ${error.details || 'No details'}\nHint: ${error.hint || 'No hint'}`);
        } else {
            console.log('User created successfully:', data);
            alert('User created successfully!');
            clearForm();
        }
    }
</script>

<div class="absolute top-4 left-4">
    <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back
    </button>
</div>

<div class="flex flex-col items-center justify-center min-h-screen p-8">
    <div class="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6">
        <h1 class="text-2xl font-bold mb-4">Create User</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Section: Form Inputs -->
            <div class="space-y-4">
                <div>
                    <label for="username" class="font-semibold">Username</label> 
                    <input id="username" type="text" bind:value={username} class="w-full border rounded p-2 focus:ring-green-500" placeholder="Enter username" />
                </div>
                <div>
                    <label for="email" class="font-semibold">Email Address</label>
                    <input id="email" type="email" bind:value={email} class="w-full border rounded p-2  focus:ring-green-500" placeholder="Enter email" />
                </div>
                <div>
                    <label for="password" class="font-semibold">Password</label>
                    <div class="relative">
                        <input 
                            id="password"
                            type={showPassword ? "text" : "password"} 
                            bind:value={password} 
                            class="w-full border rounded p-2 pr-10 focus:ring-green-500" 
                            placeholder="Enter password" 
                        />
                        <button 
                            type="button"
                            on:click={togglePassword}
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {#if showPassword}
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>
                <div>
                    <label for="role" class="font-semibold">Role</label>
                    <input id="role" type="text" bind:value={role} class="w-full border rounded p-2 focus:ring-green-500" placeholder="Enter role" />
                </div>
            </div>

            <!-- Right Section: Profile Picture Preview and Upload -->
            <div class="flex flex-col items-center space-y-4">
                <div class="text-center font-semibold">Picture Preview</div>
                <div class="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="text-center font-semibold">Photo Upload</div>
                <label class="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors block">
                    <input type="file" class="hidden" accept="image/*" />
                    <div class="text-gray-600">Click to select file or drag and drop</div>
                    <div class="text-sm text-gray-400 mt-1">PNG, JPG</div>
                </label>
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-4">
            <button on:click={createUser} class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">Create</button>
            <button on:click={clearForm} class="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded">Clear</button>
        </div>
    </div>
</div>