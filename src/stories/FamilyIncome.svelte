<script lang="ts">
    import TextInput from './dataInput/TextInput.svelte';
    import RadioGroup from './dataInput/RadioGroup.svelte';
    import DataInput from './DataInput.svelte';
    interface Props {
        sectionTitle: string;
    }
  const { sectionTitle = 'Family Information'}: Props = $props();
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 center place-self-center">
    <div class="text-3xl font-bold pb-4">{sectionTitle}</div>
    
    <DataInput
        type = "radio"
        label="Monthly Family Income"
        name="monthlyIncome"
        required={true}
        value=""
        options= {[
            { "label": "Less than $100", "value": "Less than $100" },
            { "label": "$100 - $200", "value": "$100 - $200" },
            { "label": "$201 - $350", "value": "$201 - $350" },
            { "label": "$351 - $450", "value": "$351 - $450" },
            { "label": "$451 - $599", "value": "$451 - $599" },
            { "label": "$600 - Above", "value": "$600 - Above" }
        ]}
    />
    <DataInput
        type = "radio"
        label="Income Same as Last FPR"
        name="FPRChange"
        required={true}
        value=""
        options= {[
            { "label": "Yes", "value": "Same" },
            { "label": "No, it increased", "value": "Increased" },
            { "label": "No, it decreased", "value": "Decreased" }
        ]}
    />
    <DataInput
        type = "text"
        label="Total Number of Siblings"
        name="noOfSiblings"
        placeholder="Enter number of siblings"
        required={true}
        value=""
    />
    <DataInput
        type = "text"
        label="Total Number of Siblings Living at Home"
        name="noOfSiblingsHome"
        placeholder="Enter number of siblings living at home"
        required={true}
        value=""
    />
    <DataInput
        type = "text"
        label="Total Number of Married Siblings"
        name="noOfMarriedSiblings"
        placeholder="Enter number of married siblings"
        required={true}
        value=""
    />
    <DataInput
        type = "checkbox"
        label="With pets"
        name="pets"
        required={true}
        value=""
        options= {[
            { "label": "Dog", "value": "Same" },
            { "label": "Cat", "value": "Cat" },
            { "label": "Duck", "value": "Duck" },
            { "label": "Chicken", "value": "Chicken" },
            { "label": "None", "value": "None" },
        ]}
    />
</div>
