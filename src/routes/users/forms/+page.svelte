<!--+page.svelte-->
<script>
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
    export let data;
    
    let show = false;
    let displayText = '';
    /** @type {{ title?: string, createdAt?: string, description?: string, version?: string }[]} */
    let selectedForms = [];
    let showFormsList = false;
    let selectedYear = new Date().getFullYear(); // Default to current year
    /** @type {number[]} */
    let availableYears = [];
    let currentFormType = '';

    function handleProgressReport() {
        displayText = 'FPR';
        console.log('All forms:', data.forms);
        console.log('First form createdAt:', data.forms[0]?.createdAt);
        selectedForms = data.forms.filter(form => {
            return form.title && form.title.trim().toLowerCase() === 'family progress report'.toLowerCase();
        });
        // Populate availableYears based on filtered forms
        availableYears = Array.from(
            new Set(
                selectedForms
                    .map(form => {
                        if (form.createdAt) {
                            return new Date(form.createdAt).getFullYear();
                        }
                        return null;
                    })
                    .filter(year => typeof year === 'number')
            )
        )
        .sort((a, b) => b - a);
        if (availableYears.length > 0) {
            selectedYear = availableYears[0];
        }
        selectedForms = selectedForms.filter(form => {
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

    function handleIntroSheet() {
        displayText = 'FIS';
        console.log('All forms:', data.forms);
        console.log('Looking for title:', 'Family Introduction Sheet');
        selectedForms = data.forms.filter(form => {
            console.log('Checking form title:', form.title);
            return form.title && form.title.trim().toLowerCase() === 'family introduction sheet'.toLowerCase();
        });
        // Populate availableYears based on filtered forms
        availableYears = Array.from(
            new Set(selectedForms.map(form => {
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
        selectedForms = selectedForms.filter(form => {
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

    function closeFormsList() {
        showFormsList = false;
        selectedForms = [];
    }

    /**
     * @param {Event} event
     */
    function onYearChange(event) {
        selectedYear = +/** @type {HTMLSelectElement} */(event.target).value;
        // Re-filter selectedForms based on the selected year and current displayText
        let formsToFilter = data.forms.filter(form => {
            if (displayText === 'FPR') {
                return form.title && form.title.trim().toLowerCase() === 'family progress report'.toLowerCase();
            } else if (displayText === 'FIS') {
                return form.title && form.title.trim().toLowerCase() === 'family introduction sheet'.toLowerCase();
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
    function handleFormClick(form) {
        if (form.title && form.version) {
            // Create the URL path: /admin/forms/[form name]-[version]
            const formName = encodeURIComponent(form.title);
            const version = encodeURIComponent(form.version);
            const url = `/admin/forms/${formName}-${version}`;
            
            console.log('Navigating to:', url);
            goto(url);
        } else {
            console.warn('Form missing title or version:', form);
        }
    }
</script>

<style>
    .container {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .button-group {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
    }

    .btn {
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 180px;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }

    .btn:hover::before {
        left: 100%;
    }

    .btn-progress {
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }

    .btn-progress:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }

    .btn-intro {
        background: linear-gradient(45deg, #2196F3, #1976D2);
        color: white;
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
    }

    .btn-intro:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    }

    .btn:active {
        transform: translateY(0);
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 20px;
        font-size: 20px;
        font-weight: 300;
    }

    .content-display {
        position: absolute;
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
    }

    .content-display.show {
        opacity: 1;
    }

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
        z-index: 1000;
        backdrop-filter: blur(5px);
    }

    .forms-container {
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        width: 90%;
    }

    .forms-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 15px;
        flex-wrap: wrap;
        gap: 15px;
    }

    .header-left {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .year-filter {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .year-select {
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        transition: border-color 0.3s ease;
    }

    .year-select:focus {
        outline: none;
        border-color: #2196F3;
    }

    .year-label {
        font-weight: 600;
        color: #666;
        font-size: 14px;
    }

    .forms-title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }

    .close-btn {
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .close-btn:hover {
        background: #ff3742;
    }

    .form-item {
        background: #f8f9fa;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 10px;
        border-left: 4px solid #2196F3;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .form-item:hover {
        background: #e9ecef;
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-item:active {
        transform: translateX(3px);
    }

    .form-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
    }

    .form-date {
        color: #666;
        font-size: 12px;
        margin-bottom: 5px;
    }

    .form-version {
        color: #28a745;
        font-size: 12px;
        font-weight: 600;
        background: #d4edda;
        padding: 3px 8px;
        border-radius: 12px;
        display: inline-block;
        margin-bottom: 5px;
    }

    .form-description {
        color: #666;
        font-size: 14px;
        margin-top: 5px;
    }

    .no-forms {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 40px;
    }

    .clickable-hint {
        color: #2196F3;
        font-size: 11px;
        margin-top: 5px;
        font-style: italic;
    }
</style>

<div class="container">
    <h1>Family Documents</h1>
    <div class="button-group">
        <button class="btn btn-progress" on:click={handleProgressReport}>
            Family Progress Report
        </button>
        <button class="btn btn-intro" on:click={handleIntroSheet}>
            Family Introduction Sheet
        </button>
    </div>
</div>

<div class="content-display {show ? 'show' : ''}">
    {#if show}
        {displayText}
    {/if}
</div>

{#if showFormsList}
    <!-- Add role, tabindex, and keyboard handler for backdrop -->
    <div 
        class="forms-modal" 
        on:click={closeFormsList}
        role="button"
        tabindex="0"
        aria-label="Close modal"
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeFormsList()}
    >
        <!-- Add role="none" to indicate this is a non-interactive container -->
        <div class="forms-container" role="none" on:click|stopPropagation>
            <div class="forms-header">
                <div class="header-left">
                    <h2 class="forms-title">
                        {displayText === 'FPR' ? 'Family Progress Reports' : 'Family Introduction Sheets'}
                    </h2>
                    {#if availableYears.length > 0}
                        <div class="year-filter">
                            <span class="year-label">Year:</span>
                            <select class="year-select" bind:value={selectedYear} on:change={onYearChange}>
                                {#each availableYears as year}
                                    <option value={year}>{year}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}
                </div>
                <!-- Keep actual interactive elements as buttons -->
                <button class="close-btn" on:click={closeFormsList} aria-label="Close">
                    ×
                </button>
            </div>
            
            {#if selectedForms.length > 0}
                {#each selectedForms as form}
                    <div class="form-item" on:click={() => handleFormClick(form)} role="button" tabindex="0" on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFormClick(form)}>
                        <div class="form-title">{form.title}</div>
                        <div class="form-date">
                            Created: {form.createdAt ? (() => {
                                try {
                                    const date = new Date(form.createdAt);
                                    return date.toLocaleDateString();
                                } catch (e) {
                                    return form.createdAt;
                                }
                            })() : 'No date'}
                        </div>
                        {#if form.version}
                            <div class="form-version">Version {form.version}</div>
                        {/if}
                        {#if form.description}
                            <div class="form-description">{form.description}</div>
                        {/if}
                        <div class="clickable-hint">Click to view form</div>
                    </div>
                {/each}
            {:else}
                <div class="no-forms">
                    No forms found for this category
                </div>
            {/if}
        </div>
    </div>
{/if}