<script lang="ts">
    import { goto } from '$app/navigation';
    import { supabaseAdmin } from '$lib/db';
    import Header from '../../../components/Header.svelte';

    // Form fields
    let child_id = ''; // New SCN field
    let child_name = '';
    let birthday = '';
    let gender = '';
    let address_line = '';
    let city = '';
    let state_province = '';
    let postal_code = '';
    let country = 'Philippines'; // Default to Philippines
    
    // Validation and UI state
    let calculatedAge = '';
    let isSubmitting = false;
    let formErrors: Record<string, string> = {};
    let duplicateWarningShown = false;

    // List of countries with Philippines at the top
    const countries = [
        'Philippines',
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 
        'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 
        'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 
        'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 
        'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 
        'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 
        'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 
        'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 
        'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 
        'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 
        'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 
        'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 
        'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 
        'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 
        'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 
        'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 
        'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 
        'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 
        'Peru', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 
        'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
        'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 
        'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 
        'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 
        'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
        'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
        'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
        'Yemen', 'Zambia', 'Zimbabwe'
    ];

    // Calculate age based on birthday
    function calculateAge(birthdateStr: string): string {
        if (!birthdateStr) return '';
        
        try {
            const birthdate = new Date(birthdateStr);
            if (isNaN(birthdate.getTime())) return 'Invalid date';
            
            const today = new Date();
            let age = today.getFullYear() - birthdate.getFullYear();
            const monthDiff = today.getMonth() - birthdate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
                age--;
            }
            
            return age.toString();
        } catch (error) {
            console.error("Error calculating age:", error);
            return 'Error';
        }
    }

    // Update calculated age when birthday changes
    $: calculatedAge = calculateAge(birthday);

    // Clear form fields
    function clearForm() {
        child_id = ''; // Clear SCN field
        child_name = '';
        birthday = '';
        gender = '';
        address_line = '';
        city = '';
        state_province = '';
        postal_code = '';
        country = 'Philippines';
        formErrors = {};
        duplicateWarningShown = false;
    }

    // Validate SCN format
    async function validateSCN(scn: string): Promise<boolean> {
        // Check if SCN is empty
        if (!scn.trim()) {
            formErrors.child_id = 'SCN is required';
            return false;
        }

        // Check if SCN is a positive integer
        const scnNumber = parseInt(scn, 10);
        if (isNaN(scnNumber) || scnNumber.toString() !== scn || scnNumber <= 0) {
            formErrors.child_id = 'SCN must be a positive whole number';
            return false;
        }

        // Check for leading zeros
        if (scn.startsWith('0')) {
            formErrors.child_id = 'SCN cannot start with zero';
            return false;
        }

        // Check if SCN is already in use
        try {
            const { data, error } = await supabaseAdmin
                .from('children')
                .select('child_id')
                .eq('child_id', scnNumber);
                
            if (error) {
                console.error("Error checking SCN uniqueness:", error);
                formErrors.child_id = 'Error validating SCN';
                return false;
            }
            
            if (data && data.length > 0) {
                formErrors.child_id = 'This SCN is already in use';
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Error in SCN validation:", error);
            formErrors.child_id = 'Error validating SCN';
            return false;
        }
    }

    // Validate the form
    async function validateForm(): Promise<boolean> {
        formErrors = {};
        
        // Validate SCN first
        const isScnValid = await validateSCN(child_id);
        if (!isScnValid) return false;
        
        // Check other required fields
        if (!child_name.trim()) formErrors.child_name = 'Child name is required';
        if (!birthday) formErrors.birthday = 'Birthday is required';
        if (!gender) formErrors.gender = 'Gender is required';
        if (!address_line.trim()) formErrors.address_line = 'Address is required';
        if (!city.trim()) formErrors.city = 'City is required';
        if (!state_province.trim()) formErrors.state_province = 'State/Province is required';
        if (!postal_code.trim()) formErrors.postal_code = 'Postal code is required';
        if (!country) formErrors.country = 'Country is required';
        
        // Birthday validation (must be in the past)
        if (birthday) {
            const birthdayDate = new Date(birthday);
            const today = new Date();
            
            if (isNaN(birthdayDate.getTime())) {
                formErrors.birthday = 'Invalid date format';
            } else if (birthdayDate > today) {
                formErrors.birthday = 'Birthday cannot be in the future';
            }
        }
        
        // Check if there are any errors
        return Object.keys(formErrors).length === 0;
    }

    // Check for potential duplicate children
    async function checkForDuplicates(): Promise<boolean> {
        try {
            const { data, error } = await supabaseAdmin
                .from('children')
                .select('child_id, child_name, birthday')
                .eq('child_name', child_name)
                .eq('birthday', birthday);
                
            if (error) {
                console.error("Error checking for duplicates:", error);
                return false;
            }
            
            if (data && data.length > 0) {
                // Potential duplicate found
                return true;
            }
            
            return false;
        } catch (error) {
            console.error("Error in duplicate check:", error);
            return false;
        }
    }

    // Create a new child record
    async function createChild() {
        if (isSubmitting) return; // Prevent double submission
        
        // Validate form first
        const isValid = await validateForm();
        if (!isValid) {
            window.alert("Please fill in all required fields correctly.");
            return;
        }
        
        isSubmitting = true;
        
        // Check for potential duplicates
        const isDuplicate = await checkForDuplicates();
        
        if (isDuplicate && !duplicateWarningShown) {
            const confirmProceed = window.confirm(
                "A child with the same name and birthday already exists in the system. Do you still want to proceed with creating this record?"
            );
            
            duplicateWarningShown = true;
            
            if (!confirmProceed) {
                isSubmitting = false;
                return;
            }
        }
        
        try {
            // Create the child record with SCN
            const { data, error } = await supabaseAdmin
                .from('children')
                .insert([
                    {
                        child_id: parseInt(child_id, 10), // Convert to number
                        child_name,
                        birthday,
                        gender,
                        address_line,
                        city,
                        state_province,
                        postal_code,
                        country
                    }
                ])
                .select();
                
            if (error) {
                window.alert(`Error creating child record: ${error.message}`);
                console.error("Error creating child record:", error);
                isSubmitting = false;
                return;
            }
            
            // Success!
            window.alert('Child record created successfully!');
            
            // Redirect to children page
            goto('/children');
            
        } catch (error: any) {
            window.alert(`An error occurred: ${error.message}`);
            console.error("Error in createChild:", error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="app-container bg-[#EFF6FF]">
    <Header name="Add New Child" backButton={true} />
    
    <!-- Add more top padding to the content area -->
    <div class="content-area p-4 pt-40 md:p-8 md:pt-38">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">Add New Child</h1>
            
            <form on:submit|preventDefault={createChild} class="space-y-6">
                <!-- SCN Field - Added at the top -->
                <div>
                    <label for="child_id" class="block text-sm font-medium text-gray-700 mb-1">
                        SCN (Sponsor Child Number) <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="child_id"
                        bind:value={child_id}
                        class="focus-gradient-input w-full"
                        placeholder="Enter sponsor child number"
                        class:border-red-500={formErrors.child_id}
                        required
                    />
                    {#if formErrors.child_id}
                        <p class="text-red-500 text-sm mt-1">{formErrors.child_id}</p>
                    {/if}
                </div>
                
                <!-- Personal Information -->
                <div class="space-y-4">
                    <h2 class="text-xl font-semibold text-gray-700">Personal Information</h2>
                    
                    <!-- Child Name -->
                    <div>
                        <label for="child_name" class="block text-sm font-medium text-gray-700 mb-1">
                            Child Name <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="child_name"
                            bind:value={child_name}
                            class="focus-gradient-input w-full"
                            placeholder="Enter child's full name"
                            class:border-red-500={formErrors.child_name}
                            required
                        />
                        {#if formErrors.child_name}
                            <p class="text-red-500 text-sm mt-1">{formErrors.child_name}</p>
                        {/if}
                    </div>
                    
                    <!-- Birthday and Age -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="birthday" class="block text-sm font-medium text-gray-700 mb-1">
                                Birthday <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="birthday"
                                bind:value={birthday}
                                class="focus-gradient-input w-full"
                                max={new Date().toISOString().split('T')[0]} 
                                class:border-red-500={formErrors.birthday}
                                required
                            />
                            {#if formErrors.birthday}
                                <p class="text-red-500 text-sm mt-1">{formErrors.birthday}</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label for="age" class="block text-sm font-medium text-gray-700 mb-1">
                                Age
                            </label>
                            <input
                                type="text"
                                id="age"
                                value={calculatedAge}
                                class="focus-gradient-input w-full bg-gray-100"
                                readonly
                            />
                        </div>
                    </div>
                    
                    <!-- Gender -->
                    <div>
                        <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">
                            Gender <span class="text-red-500">*</span>
                        </label>
                        <select
                            id="gender"
                            bind:value={gender}
                            class="focus-gradient-input w-full"
                            class:border-red-500={formErrors.gender}
                            required
                        >
                            <option value="" disabled selected>Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {#if formErrors.gender}
                            <p class="text-red-500 text-sm mt-1">{formErrors.gender}</p>
                        {/if}
                    </div>
                </div>
                
                <!-- Address Information -->
                <div class="space-y-4">
                    <h2 class="text-xl font-semibold text-gray-700">Address Information</h2>
                    
                    <!-- Address Line -->
                    <div>
                        <label for="address_line" class="block text-sm font-medium text-gray-700 mb-1">
                            Address Line <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="address_line"
                            bind:value={address_line}
                            class="focus-gradient-input w-full"
                            placeholder="Enter street address"
                            class:border-red-500={formErrors.address_line}
                            required
                        />
                        {#if formErrors.address_line}
                            <p class="text-red-500 text-sm mt-1">{formErrors.address_line}</p>
                        {/if}
                    </div>
                    
                    <!-- City and State/Province -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                                City <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                bind:value={city}
                                class="focus-gradient-input w-full"
                                placeholder="Enter city"
                                class:border-red-500={formErrors.city}
                                required
                            />
                            {#if formErrors.city}
                                <p class="text-red-500 text-sm mt-1">{formErrors.city}</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label for="state_province" class="block text-sm font-medium text-gray-700 mb-1">
                                State/Province <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="state_province"
                                bind:value={state_province}
                                class="focus-gradient-input w-full"
                                placeholder="Enter state or province"
                                class:border-red-500={formErrors.state_province}
                                required
                            />
                            {#if formErrors.state_province}
                                <p class="text-red-500 text-sm mt-1">{formErrors.state_province}</p>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Postal Code and Country -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="postal_code"
                                bind:value={postal_code}
                                class="focus-gradient-input w-full"
                                placeholder="Enter postal code"
                                class:border-red-500={formErrors.postal_code}
                                required
                            />
                            {#if formErrors.postal_code}
                                <p class="text-red-500 text-sm mt-1">{formErrors.postal_code}</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
                                Country <span class="text-red-500">*</span>
                            </label>
                            <select
                                id="country"
                                bind:value={country}
                                class="focus-gradient-input w-full"
                                class:border-red-500={formErrors.country}
                                required
                            >
                                {#each countries as countryOption}
                                    <option value={countryOption}>{countryOption}</option>
                                {/each}
                            </select>
                            {#if formErrors.country}
                                <p class="text-red-500 text-sm mt-1">{formErrors.country}</p>
                            {/if}
                        </div>
                    </div>
                </div>
                
                <!-- Form Actions -->
                <div class="flex justify-end space-x-4 pt-4 border-t">
                    <button 
                        type="button" 
                        class="custom-gray-btn"
                        on:click={clearForm}
                        disabled={isSubmitting}
                    >
                        Clear
                    </button>
                    <button 
                        type="submit" 
                        class="custom-green-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Child Record'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    .focus-gradient-input {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        outline: none;
        transition: border-color 0.2s;
    }
    
    .focus-gradient-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
    }

    .custom-green-btn {
        background-image: linear-gradient(to right, #10b981, #059669);
        color: white;
        padding: 0.5rem 1.5rem;
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
    }
    
    .custom-green-btn:hover {
        background-image: linear-gradient(to right, #059669, #047857);
    }
    
    .custom-green-btn:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
    }

    .custom-gray-btn {
        background-color: #e5e7eb;
        color: #374151;
        padding: 0.5rem 1.5rem;
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
    }

    .custom-gray-btn:hover {
        background-color: #d1d5db;
    }
    
    .custom-gray-btn:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.5);
    }
</style>