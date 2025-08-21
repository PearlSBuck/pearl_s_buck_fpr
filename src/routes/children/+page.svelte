<!--+page.svelte-->
<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    export let data;

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
