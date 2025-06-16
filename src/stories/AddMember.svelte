<script lang="ts">
  import './button.css';
  import Button from './Button.svelte';
  import HouseHoldMemberData from './HouseHoldMemberData.svelte';

  let n = $state(1);

  interface FamilyMember {
    name: string;
    age: string;
    relationship: string;
    education: string;
    occupation: string;
    healthStatus: string;
  }

  interface Props {
    familyMembers: FamilyMember[];
  }

  function addMember() {
    n = n + 1;
  }

  let { familyMembers = [] }: Props = $props();
</script>
<!-- Need to implement
    - remove forms
    - make form values accesible

-->
{#each Array(n).fill(0) as _, i}
  <HouseHoldMemberData sectionTitle="Household Member #{i + 1}" />
{/each}
<div class="place-self-center">
<button type="button" onclick={() => {n = n + 1; }} class=" text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ">
    Add Member
</button></div>
