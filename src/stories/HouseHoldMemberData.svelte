<script lang="ts">
    import TextInput from './dataInput/TextInput.svelte';
    import RadioGroup from './dataInput/RadioGroup.svelte';
    import Button from './Button.svelte';
    interface Props {
        sectionTitle: string;
    }

  const {sectionTitle = 'Household Member #x'}: Props = $props();
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 center place-self-center mb-4">
    <div class="text-3xl font-bold pb-4">{sectionTitle}</div>
    
    <TextInput
        label="Name"
        name="name"
        placeholder="Enter member name"
        required={true}
        value=""
    />

    <TextInput
        label="Age"
        name="age"
        placeholder="Enter member's age"
        required={true}
        value=""
    />

    <TextInput
        label="Relationship"
        name="relationship"
        placeholder="Enter relationship"
        required={true}
        value=""
    />
    
    <TextInput
        label="Education"
        name="education"
        placeholder="Enter highest education attainment"
        required={true}
        value=""
    />
    
    <TextInput
        label="Current Occupation"
        name="occupation"
        placeholder="Enter current occupation"
        required={true}
        value=""
    />
    
    <TextInput
        label="Health Status"
        name="healthStatus"
        placeholder="Enter health status"
        required={true}
        value=""
    />

</div>
