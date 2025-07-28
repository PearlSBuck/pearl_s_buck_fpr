<style>
    .focus-gradient-input {
        background: transparent;
        transition: all 0.3s ease;
        position: relative;
        background-size: 200% 200%;
    }
    
    .focus-gradient-input:focus {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.03), transparent);
        background-size: 100% 100%;
        background-position: 0 0;
    }

    .custom-green-btn {
        background-color: #38C90A;
        color: #fff;
        border-radius: 0.375rem;
        padding: 0.75rem 2.5rem;
        font-size: 1rem;
        min-width: 160px;  
        transition: background 0.2s;
    }
    .custom-green-btn:hover {
        background-color: #2ea008; /* for hover */
    }

    .custom-gray-btn {
        background-color: #e5e7eb;
        color: #111827;
        border-radius: 0.375rem;
        padding: 0.75rem 2.5rem;
        font-size: 1rem;
        min-width: 160px;
        transition: background 0.2s;
    }

    .custom-gray-btn:hover {
        background-color: #d1d5db;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        min-height: 100vh;
    }
    
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    .content-area {
        flex: 1;
        background-color: #EFF6FF; /* bg-blue-50 equivalent */
        margin-top: 0px;
        padding-top: 140px;
    }
</style>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/db'
	import { getContext, onMount } from 'svelte';
    import Header from '../../../../components/Header.svelte'; // Adjust path if needed

    let showPassword = false;

    function togglePassword() {
        showPassword = !showPassword;
    }

    function calculateAge(birthdate: string): number {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    let username = ''
    let email = ''
    let password = ''
    let role = ''
    let fullname = ''
    let age = ''
    let birthdate = ''
    let residence = ''

    function clearForm() {
        username = ''
        email = ''
        password = ''
        role = ''
        fullname = ''
        age = ''
        birthdate = ''
        residence = ''
    }

    const setPageContext:any = getContext('setPageContext');
    onMount(() => {
        setPageContext("Create User",false,true);

    })
    // Function to log audit entry
    async function logAuditEntry(actionPerformed: string, userId: string, userFullName: string, adminId?: string) {
        try {
            const { error } = await supabase.from('audit_log').insert([{
                action_performed: actionPerformed,
                user_id: userId,
                user_name: userFullName,
                admin_id: adminId || userId // Use provided admin_id or default to the user's id
            }]);
            
            if (error) {
                console.error('Failed to log audit entry:', error);
                // Don't throw error here to prevent user creation from failing
            }
        } catch (error) {
            console.error('Error logging audit entry:', error);
        }
    }

    async function createUser() {

        if (!username.trim()) {
            alert('Username is required.');
            return;
        }
        if (!email.trim()) {
            alert('Email is required.');
            return;
        }

        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!password.trim()) {
            alert('Password is required.');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        if (!role.trim()) {
            alert('Role is required.');
            return;
        }
        if (!fullname.trim()) {
            alert('Full name is required.');
            return;
        }
        if (!birthdate) {
            alert('Birthdate is required.');
            return;
        }
        const calculatedAge = calculateAge(birthdate);
        if (calculatedAge < 1) {
            alert('Invalid birthdate. Age must be atleast 1 year')
            return;
        }
        if (!residence.trim()) {
            alert('Residence is required.');
            return;
        }

        // Check for existing username or email
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or('username.eq.' + username + ',email.eq.' + email)
            .limit(1)
            .single();

        if (existingUser) {
            // Check which field is duplicated
            const { data: usernameCheck } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .single();

            const { data: emailCheck } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (usernameCheck) {
                alert('Username already exists.');
                return;
            }
            if (emailCheck) {
                alert('Email already exists.');
                return;
            }
        }

        try {
            // Get current user (admin) who is creating this user
            const { data: currentUser } = await supabase.auth.getUser();
            const currentAdminId = currentUser?.user?.id;

            // Step 1: Register the user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,  // Store username in user metadata
                        role,      // Store role in user metadata
                    }
                }
            });
            
            if (authError) throw authError;
            if (!authData.user) throw new Error('User registration failed');
            
            // Step 2: Insert additional user data into public.users table
            const { error: userError } = await supabase.from('users').insert([{
                id: authData.user.id,  // Use the UUID from auth.users
                username,
                email,
                role,
                fullname,
                age: calculatedAge,
                birthdate,
                residence
            }]);
            
            if (userError) {
                // log and report the error
                console.error('Failed to insert user data:', userError);
                throw userError;
            }
            
            // Step 3: Log the audit entry
            await logAuditEntry('created', authData.user.id, fullname, currentAdminId);
            
            alert('User created successfully!');
            clearForm();
            goto('/users/edit');
            
        } catch (error: any) {
            console.error('Error creating user:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
        }
    }
</script>

<div class="app-container">

    <div class="content-area flex flex-col items-center bg-blue-50 pt-8 px-8 pb-8">
        <div class="w-full max-w-4xl bg-white shadow-md rounded-lg p-10 mt-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <!-- Left Column -->
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="username" class="font-semibold">Username</label> 
                        <input id="username" type="text" bind:value={username} class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black" placeholder="Enter username" />
                    </div>
                    <div>
                        <label for="email" class="font-semibold">Email Address</label>
                        <input id="email" type="email" bind:value={email} class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black" placeholder="Enter email" />
                    </div>
                    <div>
                        <label for="password" class="font-semibold">Password</label>
                        <div class="relative">
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"} 
                                bind:value={password} 
                                class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black" 
                                placeholder="Enter password" 
                            />
                            <button 
                                type="button"
                                onclick={togglePassword}
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
                        <label for="role" class="block font-semibold">Role</label>
                        <select id="role" bind:value={role} class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black">
                            <option value="" class="text-gray-400">Select role</option>
                            <option value="Admin">Admin</option>
                            <option value="Worker">Worker</option>
                        </select>
                    </div>
                </div>
                <!-- Right Column -->
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="fullname" class="block font-semibold">Full Name</label> 
                        <input id="fullname" type="text" bind:value={fullname} class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black" placeholder="Enter full name" />
                    </div>
                    <div>
                        <label for="birthdate" class="block font-semibold">Birth Date</label>
                        <input 
                            id="birthdate" 
                            type="date" 
                            bind:value={birthdate} 
                            onchange={() => {
                                        if (birthdate) {
                                            age = calculateAge(birthdate).toString();
                                        }
                                    }}
                            class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black" />
                    </div>
                    <div>
                        <label for="residence" class="block font-semibold">Residence</label>
                        <input id="residence" type="text" bind:value={residence} class="focus-gradient-input w-full border-0 border-b-2 border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-black" placeholder="Enter residence/address" />
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6 flex justify-end gap-4">
            <button onclick={createUser} class="custom-green-btn">Create</button>
            <button onclick={clearForm} class="custom-gray-btn">Clear</button>
        </div>
    </div>
</div>