<!--+page.svelte-->
<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    export let data;
    /*
    Variable Definitions:
    data = object containing the form data and other necessary information
    show = boolean to control the display of the form list
    displayText = string to show the type of form being displayed
    selectedForms = array of forms to be displayed
    showFormsList = boolean to control the visibility of the forms list modal
    selectedYear = number representing the year selected for filtering forms
    availableYears = array of years available for filtering forms
    currentFormType = string representing the type of form currently being displayed
    */
    
    let show = false;
    let displayText = '';
    /** @type {{ title?: string, createdAt?: string, description?: string, version?: string }[]} */
    let selectedForms:any = [];
    let showFormsList = false;
    let selectedYear = new Date().getFullYear(); // Default to current year
    /** @type {number[]} */
    let availableYears:any = [];
    let currentFormType = '';


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
            availableYears = Array.from(
                new Set(
                    data.forms
                        .map(form => {
                            if (form.createdAt) {
                                return new Date(form.createdAt).getFullYear();
                            }
                            return null;
                        })
                        .filter(year => typeof year === 'number')
                )
            ).sort((a, b) => b - a); // Sort descending (newest first)
            
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
        
        selectedForms = data.forms.filter(form => {
            return form.title && form.title.trim().toLowerCase() === 'fpr';
        });
        
        // Populate availableYears based on filtered forms
        availableYears = Array.from(
            new Set(
                selectedForms
                    .map((form: { createdAt: string | number | Date; }) => {
                        if (form.createdAt) {
                            return new Date(form.createdAt).getFullYear();
                        }
                        return null;
                    })
                    .filter((year: any) => typeof year === 'number')
            )
        ).sort((a:any, b:any) => b - a);
        
        if (availableYears.length > 0) {
            selectedYear = availableYears[0];
        }
        
        selectedForms = selectedForms.filter((form: { createdAt: string | number | Date; }) => {
            if (form.createdAt) {
                return new Date(form.createdAt).getFullYear() === selectedYear;
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
        
        selectedForms = data.forms.filter(form => {
            console.log('Checking form title:', form.title);
            return form.title && form.title.trim().toLowerCase() === 'fis';
        });
        
        // Populate availableYears based on filtered forms
        availableYears = Array.from(
            new Set(selectedForms.map((form: { createdAt: string | number | Date; }) => {
                if (form.createdAt) {
                    return new Date(form.createdAt).getFullYear();
                }
                return null;
            }))
        )
        .filter(year => typeof year === 'number')
        .sort((a, b) => b - a);
        
        if (availableYears.length > 0) {
            selectedYear = availableYears[0];
        }
        
        selectedForms = selectedForms.filter((form: { createdAt: string | number | Date; }) => {
            if (form.createdAt) {
                return new Date(form.createdAt).getFullYear() === selectedYear;
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
// Function to close the forms list modal
    function closeFormsList() {
        showFormsList = false;
        selectedForms = [];
        currentFormType = '';
    }

    /**
     * @param {Event} event
     */
    function onYearChange(event: { target: any; }) {
        selectedYear = +/** @type {HTMLSelectElement} */(event.target).value;
        
        // Re-filter selectedForms based on the selected year and current displayText
        let formsToFilter = data.forms.filter(form => {
            if (displayText === 'FPR') {
                return form.title && form.title.trim().toLowerCase() === 'fpr';
            } else if (displayText === 'FIS') {
                return form.title && form.title.trim().toLowerCase() === 'fis';
            }
            return false;
        });
        
        selectedForms = formsToFilter.filter(form => {
            if (form.createdAt) {
                return new Date(form.createdAt).getFullYear() === selectedYear;
            }
            return false;
        });
    }

    /**
     * Handle form click navigation
     * @param {{ title?: string, version?: string }} form - The form object
     */
    async function handleFormClick(form: { title: string | number | boolean; version: string | number | boolean; }) {
        if (form.title && form.version) {
        window.location.href = `/fpr/${form.title}-${form.version}`;
        } else {
            console.warn('Form missing title or version:', form);
        }
    }

    /**
     * Format date for display
     * @param {string} dateString
     * @returns {string}
     */
    function formatDate(dateString: string | number | Date) {
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
                <div class=" gap-8 max-w-4xl mx-auto">
                    <!-- Family Progress Report Button -->
                    <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden border-l-4 border-green-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div class="bg-green-600 text-white px-6 py-4">
                            <h3 class="text-xl font-bold">Family Progress Report</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600 mb-6">Track and review your family's progress over time</p>
                            <button 
                                class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                                on:click={handleProgressReport}
                            >
                                View Progress Reports
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

<!-- Forms Modal -->
{#if showFormsList}
    <div 
        class="forms-modal" 
        on:click={closeFormsList}
        role="button"
        tabindex="0"
        aria-label="Close modal"
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeFormsList()}
    >
        <div class="forms-container" role="none" on:click|stopPropagation>
            <div class="forms-header">
                <div class="header-left">
                    <h2 class="forms-title">
                        {displayText === 'FPR' ? 'Family Progress Reports' : 
                         displayText === 'FIS' ? 'Family Introduction Sheets' : 
                         'Forms'}
                    </h2>
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
                </div>
                <button class="close-btn" on:click={closeFormsList} aria-label="Close">
                    ×
                </button>
            </div>
            
            <div class="forms-content">
                {#if selectedForms.length > 0}
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
                                            <span class="date-value">{formatDate(form.createdAt ?? '')}</span>
                                        </div>
                                        
                                        {#if form.version}
                                            <div class="form-version">
                                                Version {form.version}
                                            </div>
                                        {/if}

                                        {#if form.description}
                                            <div class="form-description">
                                                {form.description}
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <div class="form-click-hint">
                                        <span>Click to view form</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="no-forms">
                        <div class="no-forms-icon">📋</div>
                        <h3 class="no-forms-title">No forms found for {selectedYear}</h3>
                        <p class="no-forms-text">Try selecting a different year from the filter above</p>
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

    .form-description {
        color: #666;
        font-size: 14px;
        line-height: 1.4;
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
</style>
