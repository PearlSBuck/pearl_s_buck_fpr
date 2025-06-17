<script lang="ts">
    import TextInput from './dataInput/TextInput.svelte';
    import RadioGroup from './dataInput/RadioGroup.svelte';
    import Dropdown from './dataInput/Dropdown.svelte';
    import CheckBoxGroup from './dataInput/CheckBoxGroup.svelte';
    interface Props {
        sectionTitle: string;
    }
  const { sectionTitle = 'Educational Background'}: Props = $props();
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
    <div class="text-3xl font-bold pb-4">{sectionTitle}</div>
    
    <TextInput
        label="Name of School"
        name="nameOfSchool"
        placeholder="Enter name of School"
        required={true}
        value=""
    />
    <TextInput
        label="School Year"
        name="schoolYear"
        placeholder="Enter current school year"
        required={true}
        value=""
    />
    <Dropdown
        label="Grade/Year Level"
        name="yearLevel"
        value=""
        options={[
            { label: 'Grade 1', value: 'grade1' },
            { label: 'Grade 2', value: 'grade2' },
            { label: 'Grade 3', value: 'grade3' },
            { label: 'Grade 4', value: 'grade4' },
            { label: 'Grade 5', value: 'grade5' },
            { label: 'Grade 6', value: 'grade6' },
            { label: 'Grade 7 (1st Year High School)', value: 'grade7' },
            { label: 'Grade 8 (2nd Year High School)', value: 'grade8' },
            { label: 'Grade 9 (3rd Year High School)', value: 'grade9' },
            { label: 'Grade 10 (4th Year High School)', value: 'grade10' },
            { label: 'Grade 11 (Senior High - 1st Year)', value: 'grade11' },
            { label: 'Grade 12 (Senior High - 2nd Year)', value: 'grade12' },
            { label: 'College - 1st Year', value: 'college1' },
            { label: 'College - 2nd Year', value: 'college2' },
            { label: 'College - 3rd Year', value: 'college3' },
            { label: 'College - 4th Year', value: 'college4' },
        ]}
        required={true}
    />
    <TextInput
        label="Degree Program "
        name="degreeProgram"
        placeholder="Enter sponsor child's degree program"
        required={false}
        value=""
    />
    <TextInput
        label="Distance of Home/Dorm from School (km)"
        name="distanceHomeToScool"
        placeholder="Enter estimated distance (km)"
        required={true}
        value=""
    />
    <RadioGroup
        label="School Classification"
        name="schoolClassification"
        value=""
        options= {[
            { "label": "Government","value": "government" },
            { "label": "Private", "value": "private" }
        ]}
        required={true}
    />
    
    <TextInput
        label="Ambition"
        name="SCAmbition"
        placeholder="Enter sponsored child's current ambition in life"
        required={true}
        value=""
    />

    <!-- note: can probably be modeled better -->
    <RadioGroup
        label="Same as Last FPR"
        name="similarityFPR"
        value=""
        options= {[
            { "label": "Yes","value": "yes" },
            { "label": "No", "value": "no" }
        ]}
        required={true}
    />

    <RadioGroup
        label="Primary Mode of Transportation"
        name="modeOfTransportation"
        value=""
        options= {[
            { "label": "Walk","value": "walk" },
            { "label": "Jeepney", "value": "jeepney" },
            { "label": "Tricycle","value": "tricycle" },
            { "label": "Bus", "value": "bus" },
            { "label": "Train","value": "train" },
            { "label": "Others", "value": "others" }
        ]}
        required={true}
    />

    <CheckBoxGroup
        label="Awards Received Last School Year"
        name="awardsPrevious"
        value=""
        options= {[
            { "label": "With Highest Honors",       "value": "wHh" },
            { "label": "With High Honors",          "value": "whh" },
            { "label": "With Honors",               "value": "wh" },
            { "label": "Best in English",           "value": "bie" },
            { "label": "Best in Science",           "value": "bis" },
            { "label": "Best in Math",              "value": "bim" },
            { "label": "President's Lister",        "value": "pl" },
            { "label": "Leadership Awardee",        "value": "la" },
            { "label": "Deans' Lister",             "value": "dl" },
            { "label": "Academic Achiever Awardee", "value": "aaa" },
            { "label": "Conduct Award",             "value": "ca" },
            { "label": "None",                      "value": "none" },
            { "label": "Others",                    "value": "others" },
        ]}
        required={true} 
        /> 
</div>
