<!--+page.svelte-->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';
    import Header from '../../../components/Header.svelte';
    
    export let data;
    
    /** @type {{ id: string, title: string, createdAt: string, version: string, description?: string }[]} */
    let filteredForms = data.forms;
    let selectedYear = new Date().getFullYear(); // Default to current year
    /** @type {number[]} */
    let availableYears = [];
    let isInitialized = false; // Add flag to track initialization

    // Initialize available years from forms data
    $: {
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

        // Only set selectedYear from URL parameter on initial load
        if (!isInitialized) {
            const yearParam = $page.url.searchParams.get('year');
            if (yearParam) {
                const paramYear = parseInt(yearParam);
                if (availableYears.includes(paramYear)) {
                    selectedYear = paramYear;
                }
            } else if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
                selectedYear = availableYears[0];
            }
            isInitialized = true;
        }

        // Filter forms by selected year
        filteredForms = data.forms.filter(form => {
            if (form.createdAt) {
                return new Date(form.createdAt).getFullYear() === selectedYear;
            }
            return false;
        });
    }

    /**
     * Handle year filter change
     * @param {Event} event
     */
    function onYearChange(event) {
        selectedYear = +/** @type {HTMLSelectElement} */(event.target).value;
        
        // Update URL with selected year
        const url = new URL($page.url);
        url.searchParams.set('year', selectedYear.toString());
        goto(url.toString(), { replaceState: true });
    }

    /**
     * Handle form click navigation
     * @param {{ title: string, version: string }} form - The form object
     */
    function handleFormClick(form) {
        if (form.title) {
            // Create the URL path: /admin/forms/[form name]-[version]
            const formName = encodeURIComponent(form.title);
            const version = form.version ? encodeURIComponent(form.version) : 'null';
            const url = `/admin/forms/${formName}-${version}`;
            
            console.log('Navigating to:', url);
            goto(url);
        } else {
            console.warn('Form missing title:', form);
        }
    }

    /**
     * Format date for display
     * @param {string} dateString
     * @returns {string}
     */
    function formatDate(dateString) {
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

    const setPageContext:any = getContext('setPageContext');
    onMount(() => {

    setPageContext("Family Introduction Sheets" ,false,false);
    })
</script>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<div class="bg-[#F6F8FF] min-h-screen"> 

    <!-- Main Content Container -->
    <div class="pt-4">
        <!-- Page Title Header -->
        <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-end rounded-lg h-20 mt-16 relative z-10">
            <div class="mb-2">Family Introduction Sheets</div>
        </div>

        <!-- Main Container -->
        <div class="bg-white flex flex-col rounded-lg -mt-4 relative z-0 shadow-2xl">
            <!-- Subtitle and Filters Section -->
            <div class="p-6 pt-12 border-b border-gray-200">
                <div class="text-center mb-6">
                    <p class="text-gray-600 text-lg">View and manage all your family introduction forms</p>
                </div>

                {#if data.error}
                    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2 mb-6">
                        <span>⚠️</span>
                        <span>Error loading forms: {data.error}</span>
                    </div>
                {/if}

                {#if data.forms.length > 0}
                    <!-- Filters -->
                    <div class="bg-[#F6F8FF] rounded-lg p-6 shadow-lg mb-6">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <label class="font-bold text-[#474C58] text-lg" for="year-filter">Filter by Year:</label>
                                <select 
                                    id="year-filter"
                                    class="p-3 rounded-md bg-[#DDE1E6] border-0 shadow-lg focus:ring-2 focus:ring-[#1A5A9E] focus:outline-none font-medium text-[#474C58] min-w-[150px]"
                                    bind:value={selectedYear} 
                                    on:change={onYearChange}
                                >
                                    {#each availableYears as year}
                                        <option value={year}>{year}</option>
                                    {/each}
                                </select>
                            </div>
                            
                            <div class="bg-[#1A5A9E] text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                                {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Forms Content -->
            <div class="p-6">
                {#if data.forms.length > 0}
                    {#if filteredForms.length > 0}
                        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {#each filteredForms as form}
                                <div 
                                    class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-l-4 border-[#1A5A9E]"
                                    role="button" 
                                    tabindex="0"
                                    on:click={() => handleFormClick(form)}
                                    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFormClick(form)}
                                >
                                    <!-- Form Card Header -->
                                    <div class="bg-[#474C58] text-white px-6 py-4">
                                        <h3 class="text-xl font-bold truncate">{form.title}</h3>
                                    </div>
                                    
                                    <!-- Form Card Content -->
                                    <div class="p-6">
                                        <div class="space-y-4">
                                            <div class="flex items-center gap-2 text-[#474C58]">
                                                <span class="text-lg">📅</span>
                                                <span class="font-medium">Created:</span>
                                                <span class="text-gray-600">{formatDate(form.createdAt)}</span>
                                            </div>
                                            
                                            {#if form.version}
                                                <div class="flex items-center gap-2">
                                                    <div class="bg-green-600 text-white font-bold px-3 py-1 rounded-md text-sm shadow-lg">
                                                        Version {form.version}
                                                    </div>
                                                </div>
                                            {/if}

                                            {#if form.description}
                                                <div class="text-gray-600 text-sm line-clamp-3">
                                                    {form.description}
                                                </div>
                                            {/if}

                                            <!-- Click Hint -->
                                            <div class="flex items-center justify-center pt-4 border-t border-gray-200">
                                                <div class="text-[#1A5A9E] font-bold text-sm flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
                                                    <span>Click to view form</span>
                                                    <span>→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <!-- No Forms for Selected Year -->
                        <div class="bg-[#F6F8FF] rounded-lg shadow-lg p-12 text-center">
                            <div class="text-6xl opacity-30 mb-6">📋</div>
                            <h3 class="text-2xl font-bold text-[#474C58] mb-4">No forms found for {selectedYear}</h3>
                            <p class="text-gray-600 text-lg">Try selecting a different year from the filter above</p>
                        </div>
                    {/if}
                {:else}
                    <!-- No Forms At All -->
                    <div class="bg-[#F6F8FF] rounded-lg shadow-lg p-12 text-center">
                        <div class="text-6xl opacity-30 mb-6">📋</div>
                        <h3 class="text-2xl font-bold text-[#474C58] mb-4">No Family Introduction Sheets found</h3>
                        <p class="text-gray-600 text-lg">No forms have been created yet</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Line clamp utility for text truncation */
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    /* Ensure proper hover states */
    .hover\:-translate-y-1:hover {
        transform: translateY(-0.25rem);
    }
    
    /* Focus states for accessibility */
    [role="button"]:focus {
        outline: 2px solid #1A5A9E;
        outline-offset: 2px;
    }
    
    /* Smooth transitions */
    .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
    }
</style>