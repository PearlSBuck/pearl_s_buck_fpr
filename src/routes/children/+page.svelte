<!--+page.svelte-->
<script lang="ts">
    import { goto } from '$app/navigation';

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
    
    let show = false;
    let displayText = '';
    /** @type {{ title?: string, createdAt?: string, description?: string, version?: string }[]} */
    let selectedForms:any = [];
    let showFormsList = false;
    let selectedYear = new Date().getFullYear(); // Default to current year
    /** @type {number[]} */
    let availableYears:any = [];
    let currentFormType = '';

    function gotoChildrenForm(){
        goto('/children/form');
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
            <div class="mb-2">Children Database</div>
        </div>

        <!-- Main Container -->
        <div class="bg-white flex flex-col rounded-lg -mt-4 relative z-0 shadow-2xl">
            <!-- Subtitle Section -->
            <div class="p-6 pt-12 border-b border-gray-200">
                <div class="text-center mb-6">
                    <p class="text-gray-600 text-lg">Create a new entry into the Pearl S. Buck database</p>
                </div>
            </div>

            <!-- Document Type Selection -->
            <div class="p-6">
                <div class="grid grid-cols-1  gap-8 max-w-4xl mx-auto">
                    <!-- Add Children Button -->
                    <div class="bg-[#F6F8FF] rounded-lg shadow-lg overflow-hidden border-l-4 border-red-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div class="bg-red-600 text-white px-6 py-4">
                            <h3 class="text-xl font-bold">Add Children</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600 mb-6">Add new children to the Pearl S. Buck database</p>
                            <button 
                                class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                                on:click={gotoChildrenForm}
                            >
                                Add Children Record
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

    /* Responsive design */
    @media (max-width: 768px) {

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
