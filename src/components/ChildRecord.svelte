<script lang="ts">
  import { selectedChildren } from '../routes/admin/children/selectChildren'; 
  import { goto } from '$app/navigation';

  /*
  VariableDefinitions:
  id_number = number representing the ID of the record
  name = string representing the name associated with the record
  selectRecord = boolean to indicate if the record is in selection mode
  selected = string to indicate the type of record (e.g., 'fpr' or 'fis')
  */
  export let id_number: number;
  export let name: string;
  export let selectChildren: boolean;
// Function to toggle selection of the record
  function toggleSelection() {
    selectedChildren.update((current) => {
      const updated = new Set(current);
      if (updated.has(id_number)) {
        updated.delete(id_number);
      } else {
        updated.add(id_number);
      }
      return updated;
    });
  }
// Function to navigate to the FPR based on the selected record
  function goToChildrenRecord(id: number) {
  goto(`/admin/children/${id}`);
  }

</script>
<!-- Record Component -->
<div class="flex justify-between rounded-md text-white bg-[#474C58] h-16 p-3 w-60 m-1 lg:w-275 md:w-150 sm:w-125 relative">
  <button on:click={() => goToChildrenRecord(id_number)} aria-label="Go to Record" class="flex items-left">
    <div class="flex items-start flex-col justify-center">
        <div class="flex flex-col justify-center items-start gap-1">
            <span class="text-sm md:text-md lg:text-lg">Child Name: {name}</span>
            <span class="text-sm md:text-md lg:text-lg">Child ID: {id_number}</span>
        </div>
    </div>
  </button>
    <div class="top-1 right-2">
        {#if selectChildren}
          <input type="checkbox" class="form-checkbox text-gray-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-gray-500 mt-2" 
          checked={$selectedChildren.has(id_number)}
          on:change={toggleSelection}>
        {/if}
    </div>
</div >
