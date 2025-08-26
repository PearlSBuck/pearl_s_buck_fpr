<script lang="ts">
  import { selectedRecords } from '../routes/admin/data/selectRecord'; 
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
  export let selectRecord: boolean;
  export let selected: string;
// Function to toggle selection of the record
  function toggleSelection() {
    selectedRecords.update((current) => {
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
  function goToFPRRecord(id: number) {
  goto(`/admin/data/fpr/${id}`);
  }
// Function to navigate to the FIS based on the selected record
  function goToFISRecord(id: number) {
    goto(`/admin/data/fis/${id}`);
  }
</script>
<!-- Record Component -->
<div class="flex justify-between rounded-md text-white bg-[#474C58] h-16 p-3 w-60 m-1 lg:w-275 md:w-150 sm:w-125 relative">
  {#if selected === 'progress_report'}
  <button on:click={() => goToFPRRecord(id_number)} aria-label="Go to Record" class="flex items-left">
    <div class="flex items-start flex-col justify-center">
        <div class="flex flex-col justify-center items-start gap-1">
            <span class="text-sm md:text-md lg:text-lg">SC Name: {name}</span>
            <span class="text-sm md:text-md lg:text-lg">SC Number: {id_number}</span>
        </div>
    </div>
  </button>
  {:else}
  <button on:click={() => goToFISRecord(id_number)} aria-label="Go to Record" class="flex items-left">
    <div class="flex items-start flex-col justify-center">
        <div class="flex flex-col justify-center items-start gap-1">
            <span class="text-sm md:text-md lg:text-lg">Child Name: {name}</span>
            <span class="text-sm md:text-md lg:text-lg">Child ID: {id_number}</span>
        </div>
    </div>
  </button>  
  {/if}
    <div class="top-1 right-2">
        {#if selectRecord}
          <input type="checkbox" class="form-checkbox text-gray-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-gray-500 mt-2" 
          checked={$selectedRecords.has(id_number)}
          on:change={toggleSelection}>
        {/if}
    </div>
</div >
