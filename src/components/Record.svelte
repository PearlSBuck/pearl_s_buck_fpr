<script lang="ts">
  import { selectedRecords } from '../routes/admin/data/selectRecord'; 
  import { goto } from '$app/navigation';

  export let id_number: number;
  export let name: string;
  export let selectRecord: boolean;

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

  function goToRecord(id: number) {
  goto(`/admin/data/${id}`);
  }
</script>

<div class="flex justify-between rounded-md text-white bg-[#474C58] h-16 p-3 w-60 m-1 lg:w-275 md:w-150 sm:w-125 relative">
  <button on:click={() => goToRecord(id_number)} aria-label="Go to Record" class="flex items-left">
    <div class="flex items-start flex-col justify-center">
        <div class="flex flex-col justify-center items-start gap-1">
            <span class="text-sm md:text-md lg:text-lg">SC Name: {name}</span>
            <span class="text-sm md:text-md lg:text-lg">SC Number: {id_number}</span>
        </div>
    </div>
  </button>  
    <div class="top-1 right-2">
        {#if selectRecord}
          <input type="checkbox" class="form-checkbox text-gray-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-gray-500 mt-2" 
          checked={$selectedRecords.has(id_number)}
          on:change={toggleSelection}>
        {/if}
    </div>
</div >
