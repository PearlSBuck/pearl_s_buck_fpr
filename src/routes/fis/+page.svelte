<!--+page.svelte-->
<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    export let data;

    // Add this logging to check if children data is present
    console.log('Client: Received data:', data);
    console.log('Client: Children data:', data.children);
    
    /*
    Variable Definitions:
    show: boolean to control visibility of the display text
    displayText: string to show in the display text animation
    selectedForms: array of forms to display in the modal
    showFormsList: boolean to control visibility of the forms list modal
    selectedYear: number to filter forms by year
    availableYears: array of years available in the forms
    currentFormType: string to indicate the type of form being displayed
    */
    
    // Define Form interface to use throughout the component
    interface Form {
        title?: string;
        createdat?: string | number | Date;  // Changed from createdAt to createdat
        description?: string;
        version?: string;
    }
    
    let show = false;
    let displayText = '';
    /** @type {Form[]} */
    let selectedForms: Form[] = [];
    let showFormsList = false;
    let selectedYear = new Date().getFullYear(); // Default to current year
    /** @type {number[]} */
    let availableYears: number[] = [];
    let currentFormType = '';

    // Child selection variables
    let children = data.children || [];

    // New variables for child selection feature
    let childSearchQuery = '';
    let selectedChild: any = null;
    let filteredChildren = [...children];
    let loading = false;

    $: {
    const action = $page.url.searchParams.get('action');
    console.log('Current URL:', $page.url.href);
    console.log('Action parameter:', action);
    
    if (action === 'handleIntroSheet') {
        console.log('Calling handleIntroSheet()...');
        handleIntroSheet();
        
        // Clean up the URL parameter after calling the function
        const url = new URL($page.url);
        url.searchParams.delete('action');
        history.replaceState({}, '', url.toString());
        console.log('URL cleaned up');
    }
}


$: {
    const action = $page.url.searchParams.get('action');
    console.log('Current URL:', $page.url.href);
    console.log('Action parameter:', action);
    
    if (action === 'handleProgressReport') {
        console.log('Calling handleIntroSheet()...');
        handleProgressReport();
        
        // Clean up the URL parameter after calling the function
        const url = new URL($page.url);
        url.searchParams.delete('action');
        history.replaceState({}, '', url.toString());
        console.log('URL cleaned up');
    }
}

    const setPageContext:any = getContext('setPageContext');
    // Initialize component on mount
    onMount(() => {
        setPageContext("Family Documents",false,false);
        console.log('Component mounted with data:', data);
        
        // Initialize available years from all forms
        if (data.forms && data.forms.length > 0) {
            // Using a more direct approach with explicit typing
            const yearsSet = new Set<number>();
            
            // Extract years with explicit typing
            data.forms.forEach((form: Form) => {
                if (form.createdat) {
                    const year = new Date(form.createdat).getFullYear();
                    yearsSet.add(year);
                }
            });
            
            // Convert to array and sort
            availableYears = Array.from(yearsSet).sort((a: number, b: number) => b - a);
            
            // Set default year to most recent if available
            if (availableYears.length > 0) {
                selectedYear = availableYears[0];
            }
        }
    });
// Function to handle the display of Family Progress Reports (FPR)
    function handleProgressReport() {
        displayText = 'FPR';
        currentFormType = 'fpr';
        console.log('All forms:', data.forms);
        console.log('First form createdAt:', data.forms[0]?.createdAt);
        
        selectedForms = data.forms.filter((form: Form) => {
            return form.title && form.title.trim().toLowerCase() === 'fpr';
        });
        
        // Populate availableYears with explicit typing
        const yearsSet = new Set<number>();
        
        selectedForms.forEach((form: Form) => {
            if (form.createdat) {
                const year = new Date(form.createdat).getFullYear();
                yearsSet.add(year);
            }
        });
        
        availableYears = Array.from(yearsSet).sort((a: number, b: number) => b - a);
        
        if (availableYears.length > 0) {
            selectedYear = availableYears[0];
        }
        
        selectedForms = selectedForms.filter((form: Form) => {
            if (form.createdat) {
                return new Date(form.createdat).getFullYear() === selectedYear;
            }
            return false;
        });
        
        console.log('Filtered forms:', selectedForms);
        show = true;
        setTimeout(() => {
            show = false;
            showFormsList = true;
        }, 2000);
    }
// Function to handle the display of Family Introduction Sheets (FIS)
    function handleIntroSheet() {
        displayText = 'FIS';
        currentFormType = 'fis';
        console.log('All forms:', data.forms);
        console.log('Looking for title:', 'FIS');
        
        // Get all FIS forms
        const allFisForms = data.forms.filter((form: Form) => {
            console.log('Checking form title:', form.title);
            return form.title && form.title.trim().toLowerCase() === 'fis';
        });
        
        console.log('All FIS forms:', allFisForms);
        
        // Populate availableYears with explicit typing
        const yearsSet = new Set<number>();
        
        allFisForms.forEach((form: Form) => {
            if (form.createdat) {  // Changed from createdAt
                const year = new Date(form.createdat).getFullYear();
                yearsSet.add(year);
            }
        });
        
        availableYears = Array.from(yearsSet).sort((a: number, b: number) => b - a);
        
        if (availableYears.length > 0) {
            selectedYear = availableYears[0];
        }
        
        // Filter by year
        selectedForms = allFisForms.filter((form: Form) => {
            if (form.createdat) {
                return new Date(form.createdat).getFullYear() === selectedYear;
            }
            return false;
        });
        
        // If no forms matched the year filter, show all FIS forms
        if (selectedForms.length === 0) {
            console.log('No forms for selected year, showing all FIS forms');
            selectedForms = [...allFisForms];
        }
        
        console.log('Filtered forms:', selectedForms);
        show = true;
        setTimeout(() => {
            show = false;
            showFormsList = true;
        }, 2000);
    }
// Function to close the forms list modal
    function closeFormsList() {
        showFormsList = false;
        selectedForms = [];
        currentFormType = '';
        selectedChild = null; // Reset selected child
    }

    /**
     * @param {Event} event
     */
    function onYearChange(event: { target: any; }) {
        selectedYear = +/** @type {HTMLSelectElement} */(event.target).value;
        
        // Re-filter selectedForms based on the selected year and current displayText
        let allFormsOfType = data.forms.filter((form: Form) => {
            if (displayText === 'FPR') {
                return form.title && form.title.trim().toLowerCase() === 'fpr';
            } else if (displayText === 'FIS') {
                return form.title && form.title.trim().toLowerCase() === 'fis';
            }
            return false;
        });
        
        // Filter by selected year
        selectedForms = allFormsOfType.filter((form: Form) => {
            if (form.createdat) {
                return new Date(form.createdat).getFullYear() === selectedYear;
            }
            return false;
        });
        
        // If no forms found for the selected year, show all forms of that type
        if (selectedForms.length === 0) {
            console.log('No forms for selected year, showing all forms');
            selectedForms = [...allFormsOfType];
        }
    }

    /**
     * Modify the form click handler to include the selected child
     */
    function handleFormClick(form: Form) {
        if (!selectedChild) {
            // Don't proceed if no child is selected
            return;
        }
        
        if (form.title && form.version) {
            // Pass the child ID in the URL
            window.location.href = `/fis/${form.title}-${form.version}?childId=${selectedChild.child_id}`;
            console.log('Navigating to form for child:', selectedChild.child_id);
        } else {
            console.warn('Form missing title or version:', form);
        }
    }

    /**
     * Format date for display
     * @param {string | number | Date} dateString
     * @returns {string}
     */
    function formatDate(dateString: string | number | Date) {
        try {
            // Debug the input value
            console.log('Formatting date:', dateString);
            
            if (!dateString) return 'No Date';
            
            // Handle ISO date strings
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error('Invalid date parsed:', dateString);
                return 'Invalid Date';
            }
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Date Error';
        }
    }

    // New functions for child selection feature
    /**
     * Filter children based on the search query
     */
    $: {
        console.log('Filtering children. Query:', childSearchQuery);
        console.log('Available children:', children?.length);
        
        if (children && children.length > 0) {
            const query = childSearchQuery.toLowerCase();
            filteredChildren = children.filter((child: any) => {
                return child.child_name.toLowerCase().includes(query) || 
                       child.child_id.toString().includes(query);
            });
            console.log('Filtered children result:', filteredChildren.length);
        }
    }

    /**
     * Select a child from the list
     */
    function selectChild(child: any) {
        selectedChild = child;
        childSearchQuery = ''; // Clear search query on select
    }

    /**
     * Calculate age from birthday
     */
    function calculateAge(birthday: string) {
        if (!birthday) return 'Unknown';
        
        const birthDate = new Date(birthday);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
</script>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<div class="bg-[#F6F8FF] min-h-screen">

    <!-- Main Content Container -->
    <div class="pt-4">
        <!-- Page Title Header -->
        <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-end rounded-lg h-20 mt-16 relative z-10">
            <div class="mb-2">Family Documents</div>
        </div>

        <!-- Main Container -->
        <div class="bg-white flex flex-col rounded-lg -mt-4 relative z-0 shadow-2xl">
            <!-- Subtitle Section -->
            <div class="p-6 pt-12 border-b border-gray-200">
                <div class="text-center mb-6">
                    <p class="text-gray-600 text-lg">Select a document type to view and manage your family forms</p>
                </div>

                {#if data.error}
                    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2 mb-6">
                        <span>⚠️</span>
                        <span>Error loading forms: {data.error}</span>
                    </div>
                {/if}
            </div>

            <!-- Document Type Selection -->
            <div class="p-6">
                <div class="grid grid-cols-1  gap-8 max-w-4xl mx-auto">
                    <!-- Family Introduction Sheet Button -->
                    <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div class="bg-blue-600 text-white px-6 py-4">
                            <h3 class="text-xl font-bold">Family Introduction Sheet</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600 mb-6">View and manage your family introduction documents</p>
                            <button 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                                on:click={handleIntroSheet}
                            >
                                View Introduction Sheets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Display Text Animation -->
<div class="content-display {show ? 'show' : ''}">
    {#if show}
        {displayText}
    {/if}
</div>

<!-- Forms Modal with Child Selector-->
{#if showFormsList}
    <div 
        class="forms-modal" 
        on:click={closeFormsList}
        role="button"
        tabindex="0"
        aria-label="Close modal"
        on:keydown={(e) => {
            // Only close if Enter/Space AND not in an input field
            if ((e.key === 'Enter' || e.key === ' ') && 
                !(e.target instanceof HTMLInputElement || 
                  e.target instanceof HTMLTextAreaElement || 
                  e.target instanceof HTMLSelectElement)) {
                closeFormsList();
            }
        }}
    >
        <div class="forms-container" role="none" on:click|stopPropagation>
            <div class="forms-header">
                <div class="header-left">
                    <h2 class="forms-title">
                        {displayText === 'FPR' ? 'Family Progress Reports' : 
                         displayText === 'FIS' ? 'Family Introduction Sheets' : 
                         'Forms'}
                    </h2>
                </div>
                <button class="close-btn" on:click={closeFormsList} aria-label="Close">
                    ×
                </button>
            </div>
            
            <!-- Child Selector Section -->
            <div class="child-selector-section">
                <h3 class="child-selector-title">Select a Child</h3>
                <p class="child-selector-description">You must select a child before proceeding with the form.</p>
                
                <div class="child-selector-search">
                    <input 
                        type="text" 
                        placeholder="Search by name or ID..." 
                        bind:value={childSearchQuery}
                        class="child-search-input"
                    />
                </div>
                
                <div class="child-selector-list">
                    {#if !children || children.length === 0}
                        <div class="no-children">
                            <p>No children found. Please add children from the Children Database section first.</p>
                        </div>
                    {:else}
                        {#each filteredChildren as child}
                            <div 
                                class="child-item {selectedChild?.child_id === child.child_id ? 'selected' : ''}"
                                on:click={() => selectChild(child)}
                                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectChild(child)}
                                role="button"
                                tabindex="0"
                            >
                                <div class="child-info">
                                    <div class="child-id">ID: {child.child_id}</div>
                                    <div class="child-name">{child.child_name}</div>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
            
            <!-- Form Selection Section -->
            <div class="forms-content">
                {#if !selectedChild}
                    <div class="select-child-message">
                        <div class="message-icon">👆</div>
                        <h3>Please select a child first</h3>
                        <p>You need to select a child from the list above before you can access forms.</p>
                    </div>
                {:else if selectedForms.length > 0}
                    <div class="selected-child-banner">
                        <div class="selected-child-info">
                            <p>Selected Child: <strong>{selectedChild.child_name}</strong></p>
                            <p class="child-id-small">ID: {selectedChild.child_id}</p>
                        </div>
                    </div>
                    
                    {#if availableYears.length > 0}
                        <div class="year-filter">
                            <span class="year-label">Filter by Year:</span>
                            <select 
                                class="year-select" 
                                bind:value={selectedYear} 
                                on:change={onYearChange}
                            >
                                {#each availableYears as year}
                                    <option value={year}>{year}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}
                    
                    <div class="forms-grid">
                        {#each selectedForms as form}
                            <div 
                                class="form-card" 
                                on:click={() => handleFormClick(form)}
                                role="button" 
                                tabindex="0" 
                                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFormClick(form)}
                            >
                                <div class="form-card-header">
                                    <h3 class="form-card-title">
                                        {form.title === 'FIS' ? 'Family Introduction Sheet' : 
                                         form.title === 'FPR' ? 'Family Progress Report' : 
                                         form.title}
                                    </h3>
                                </div>
                                <div class="form-card-content">
                                    <div class="form-info">
                                        <div class="form-date">
                                            <span class="date-icon">📅</span>
                                            <span class="date-label">Created:</span>
                                            <span class="date-value">
                                                {#if form.createdat}
                                                    {formatDate(form.createdat)}
                                                {:else}
                                                    No Date
                                                {/if}
                                            </span>
                                        </div>
                                        
                                        {#if form.version}
                                            <div class="form-version">
                                                Version {form.version}
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <div class="form-click-hint">
                                        <span>Click to fill out form for {selectedChild.child_name}</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="no-forms">
                        <div class="no-forms-icon">📋</div>
                        <h3 class="no-forms-title">No forms found</h3>
                        <p class="no-forms-text">Try selecting a different year or form type</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    /* Content display animation */
    .content-display {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 72px;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity 0.5s ease;
        pointer-events: none;
        z-index: 1000;
    }

    .content-display.show {
        opacity: 1;
    }

    /* Forms modal */
    .forms-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        backdrop-filter: blur(5px);
    }

    .forms-container {
        background: white;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        max-width: 90vw;
        max-height: 85vh;
        overflow-y: auto;
        width: 100%;
        margin: 20px;
    }

    .forms-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30px;
        border-bottom: 2px solid #f0f0f0;
        flex-wrap: wrap;
        gap: 15px;
        background: #f8f9fa;
        border-radius: 15px 15px 0 0;
    }

    .header-left {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .forms-title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }

    .year-filter {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 20px; /* Increase this from the current value or add it if it doesn't exist */
    }
    
    /* Alternative: If you want to style all the filter areas consistently */
    .selected-child-banner {
        /* existing styles */
        margin-bottom: 20px; /* Make this consistent with the year filter margin */
    }

    .year-label {
        font-weight: 600;
        color: #666;
        font-size: 14px;
    }

    .year-select {
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        transition: border-color 0.3s ease;
        min-width: 120px;
    }

    .year-select:focus {
        outline: none;
        border-color: #1A5A9E;
    }

    .close-btn {
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn:hover {
        background: #ff3742;
        transform: scale(1.1);
    }

    .forms-content {
        padding: 30px;
    }

    .forms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
    }

    .form-card {
        background: #f8f9fa;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 4px solid #1A5A9E;
    }

    .form-card:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    .form-card:focus {
        outline: 2px solid #1A5A9E;
        outline-offset: 2px;
    }

    .form-card-header {
        background: #474C58;
        padding: 16px 20px;
    }

    .form-card-title {
        color: white;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
    }

    .form-card-content {
        padding: 20px;
    }

    .form-info {
        margin-bottom: 15px;
    }

    .form-date {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: #474C58;
    }

    .date-icon {
        font-size: 16px;
    }

    .date-label {
        font-weight: 600;
    }

    .date-value {
        color: #666;
    }

    .form-version {
        background: #28a745;
        color: white;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        display: inline-block;
        margin-bottom: 12px;
    }

    .form-click-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding-top: 15px;
        border-top: 1px solid #e0e0e0;
        color: #1A5A9E;
        font-weight: 600;
        font-size: 14px;
        transition: opacity 0.3s ease;
    }

    .form-card:hover .form-click-hint {
        opacity: 0.8;
    }

    .no-forms {
        text-align: center;
        padding: 60px 20px;
        color: #666;    
    }

    .no-forms-icon {
        font-size: 64px;
        opacity: 0.3;
        margin-bottom: 20px;
    }

    .no-forms-title {
        font-size: 24px;
        font-weight: 600;
        color: #474C58;
        margin-bottom: 16px;
    }

    .no-forms-text {
        font-size: 16px;
        line-height: 1.5;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .forms-container {
            margin: 10px;
        }

        .forms-header {
            padding: 20px;
        }

        .forms-title {
            font-size: 20px;
        }

        .forms-content {
            padding: 20px;
        }

        .forms-grid {
            grid-template-columns: 1fr;
        }

        .content-display {
            font-size: 48px;
        }
    }

    /* Hover effects */
    .hover\:-translate-y-1:hover {
        transform: translateY(-0.25rem);
    }

    /* Smooth transitions */
    .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
    }

    /* Child selector styles */
    .child-selector-section {
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
        background-color: #f5f9ff;
    }
    
    .child-selector-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 5px 0;
        color: #1A5A9E;
    }
    
    .child-selector-description {
        color: #666;
        font-size: 14px;
        margin-bottom: 10px;
    }
    
    .child-selector-search {
        margin-bottom: 10px;
    }
    
    .child-search-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .child-selector-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background: white;
    }
    
    .child-item {
        padding: 10px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
    }
    
    .child-item:last-child {
        border-bottom: none;
    }
    
    .child-item:hover {
        background-color: #f0f7ff;
    }
    
    .child-item.selected {
        background-color: #e0f0ff;
        border-left: 3px solid #1A5A9E;
    }
    
    .child-info {
        display: flex;
        flex-direction: column;
    }
    
    .child-id {
        font-size: 12px;
        color: #666;
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 4px;
    }
    
    .child-name {
        font-weight: 500;
    }
    
    .select-child-message {
        text-align: center;
        padding: 30px;
        color: #666;
    }
    
    .message-icon {
        font-size: 24px;
        margin-bottom: 10px;
    }
    
    .selected-child-banner {
        display: flex;
        align-items: center;
        background: #e0f0ff;
        padding: 10px 15px;
        border-radius: 4px;
        margin-bottom: 20px; /* Make this consistent with the year filter margin */
    }
    
    .selected-child-info {
        flex: 1;
    }
    
    .selected-child-info p {
        margin: 0;
    }
    
    .child-id-small {
        font-size: 12px;
        color: #666;
    }
    
    .no-children {
        padding: 15px;
        text-align: center;
        color: #666;
    }
</style>
