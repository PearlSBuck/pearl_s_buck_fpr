<script lang="ts">
    import ScInformation from "./SCInformation.svelte";
    import EducationBackground from "./EducationBackground.svelte";
    import AddMember from "./AddMember.svelte";
     import FamilyIncome from "./FamilyIncome.svelte";

    interface Props {
        formTitle: string;
    }
  const { sectionTitle = 'Family Progress Report'}: Props = $props();
</script>
<div class="bg-[#F6F8FF] top-0 left-0 absolute w-full">
    <div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 my-4 center place-self-center">
        <div class="text-3xl font-bold pb-4">{sectionTitle}</div> 
    </div>
    <ScInformation />
    <EducationBackground />
    <AddMember />
    <FamilyIncome />
</div>
