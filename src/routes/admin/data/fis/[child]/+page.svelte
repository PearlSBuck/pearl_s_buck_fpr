<style>
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    .content-area {
        flex: 1;
        background-color: #EFF6FF;
        margin-top: 0px;
        padding-top: 140px;
    }
    
    .section-card {
        background-color: white;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    .section-title {
        color: #1A5A9E;
        font-size: 1.50rem;
        font-weight: 600;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    @media (max-width: 640px) {
        .info-grid {
            grid-template-columns: 1fr;
        }
    }
    
    .info-label {
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .info-value {
        font-weight: 500;
    }
    
    .checkbox-group {
        margin-top: 0.5rem;
    }
    
    .checkbox-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .checkbox-item input {
        margin-right: 0.5rem;
    }
</style>

<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Header from '../../../../../components/Header.svelte';
    
    // Get child ID from URL parameter
    const childId = $page.params.child;
    
    // Placeholder data - will be replaced with data from Supabase
    let childInfo = {
        assignedDate: "January 1, 2025",
        sponsorName: "Juan dela Cruz",
        sponsorId: "0000-1111-0000",
        childName: "Doe, John Smith",
        childId: "1111-0000-1111",
        birthday: "January 1, 2000",
        age: 25,
        height: "1.60m",
        weight: "50kg",
        healthStatus: {
            healthy: true,
            unhealthy: false,
            unhealthyDetails: "lorem ipsum"
        },
        covidVaccine: {
            completelyVaccinated: false,
            partiallyVaccinated: true,
            unvaccinated: false
        }
    };
    
    // Will be implemented later to fetch data from Supabase
    async function fetchChildInfo(id: string) {
        // TODO: Fetch actual data from fis_answers and fis_answers_list tables
        console.log(`Fetching info for child ID: ${id}`);
    }
    
    onMount(() => {
        if (childId) {
            fetchChildInfo(childId);
        }
    });
</script>

<div class="app-container">
    <!-- Header -->
    <Header name="Individual Records Management" search={false} backButton={false} />

    <div class="content-area flex flex-col items-center pt-8 px-6 pb-8">
        <!-- Child Identification Card -->
        <div class="w-full max-w-4xl bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center justify-between mb-8">
            <div class="flex flex-col items-center md:items-start">
                <h1 class="text-2xl font-bold mb-2">SC Name: {childInfo.childName}</h1>
                <p class="text-gray-600">SCN: {childInfo.childId}</p>
            </div>
        </div>
        
        <!-- Sponsored Child Information Section -->
        <div class="w-full max-w-4xl">
            <div class="section-card">
                <h2 class="section-title">Sponsored Child Information</h2>
                
                <!-- Assigned Date -->
                <div class="mb-4">
                    <div class="info-label">Assigned Date:</div>
                    <div class="info-value">{childInfo.assignedDate}</div>
                </div>
                
                <!-- Sponsor Info -->
                <div class="info-grid mb-4">
                    <div>
                        <div class="info-label">Sponsor Name:</div>
                        <div class="info-value">{childInfo.sponsorName}</div>
                    </div>
                    <div>
                        <div class="info-label">SN:</div>
                        <div class="info-value">{childInfo.sponsorId}</div>
                    </div>
                </div>
                
                <!-- Child Info -->
                <div class="info-grid mb-4">
                    <div>
                        <div class="info-label">SC Name:</div>
                        <div class="info-value">{childInfo.childName}</div>
                    </div>
                    <div>
                        <div class="info-label">SCN:</div>
                        <div class="info-value">{childInfo.childId}</div>
                    </div>
                </div>
                
                <!-- Birthday & Age -->
                <div class="info-grid mb-4">
                    <div>
                        <div class="info-label">Birthday:</div>
                        <div class="info-value">{childInfo.birthday}</div>
                    </div>
                    <div>
                        <div class="info-label">Age:</div>
                        <div class="info-value">{childInfo.age}</div>
                    </div>
                </div>
                
                <!-- Height & Weight -->
                <div class="info-grid mb-4">
                    <div>
                        <div class="info-label">Height:</div>
                        <div class="info-value">{childInfo.height}</div>
                    </div>
                    <div>
                        <div class="info-label">Weight:</div>
                        <div class="info-value">{childInfo.weight}</div>
                    </div>
                </div>
                
                <!-- Health Status -->
                <div class="mb-4">
                    <div class="info-label">Health Status:</div>
                    <div class="checkbox-group">
                        <label class="checkbox-item">
                            <input type="checkbox" checked={childInfo.healthStatus.healthy} disabled>
                            Healthy
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" checked={childInfo.healthStatus.unhealthy} disabled>
                            Unhealthy: {childInfo.healthStatus.unhealthy ? childInfo.healthStatus.unhealthyDetails : ''}
                        </label>
                    </div>
                </div>
                
                <!-- COVID Vaccine Status -->
                <div class="mb-2">
                    <div class="info-label">COVID Vaccine Shot:</div>
                    <div class="checkbox-group">
                        <label class="checkbox-item">
                            <input type="checkbox" checked={childInfo.covidVaccine.completelyVaccinated} disabled>
                            Complete Dose
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" checked={childInfo.covidVaccine.partiallyVaccinated} disabled>
                            One Dose
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" checked={childInfo.covidVaccine.unvaccinated} disabled>
                            None
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>