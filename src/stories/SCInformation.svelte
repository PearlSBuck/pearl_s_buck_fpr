<script lang="ts">
    import DataInput from './DataInput.svelte';
    interface Props {
        sectionTitle: string;
    }
  const { sectionTitle = 'Sponsored Child Information'}: Props = $props();
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
    <div class="text-3xl font-bold pb-4">{sectionTitle}</div>
    
    <DataInput
        type = "text"
        label="Assigned Date"
        name="assignedDate"
        placeholder="Enter date of tracking"
        required={true}
        value=""
    />
    <DataInput 
        type = "text"
        label="Name"
        name="SCName"
        placeholder="Enter sponsor child's name"
        required={true}
        value=""
    />
    <DataInput
        type = "text"
        label="Height (cm)"
        name="height"
        placeholder="Enter sponsor child's height"
        required={true}
        value=""
    />
    <DataInput
        type = "text"
        label="Weight (kg) "
        name="weight"
        placeholder="Enter sponsor child's weight"
        required={true}
        value=""
    />
    <DataInput
        type = "radio"
        label="Health Status"
        name="healthStatus"
        value=""
        options= {[
            {
                "label": "Healthy",
                "value": "healthy"
            },
            {
                "label": "Unhealthy",
                "value": "unhealthy"
            }
        ]}
        required={true}
    />
</div>
