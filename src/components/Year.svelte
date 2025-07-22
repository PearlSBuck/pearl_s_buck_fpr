<script lang="ts">
  import { selectedRecords } from '../routes/admin/data/selectFPRRecord';
  export let fprData: any[];
  export let selectRecord: boolean;

  let groupedFPR: { year: number; activated: boolean; items: any[] }[] = [];

  function toggleSelection(answerId: string) {
    selectedRecords.update((current) => {
      const updated = new Set(current);
      if (updated.has(answerId)) {
        updated.delete(answerId);
      } else {
        updated.add(answerId);
      }
      return updated;
    });
  }

  function groupByYear(data: any[]) {
    const map = new Map<number, any[]>();
    data.forEach(item => {
      const year = new Date(item.created_at).getFullYear();
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)?.push(item);
    });

    // Convert to array and sort years descending
    groupedFPR = Array.from(map.entries())
      .map(([year, items]) => ({
        year,
        activated: false,
        items
      }))
      .sort((a, b) => b.year - a.year);
  }

  groupByYear(fprData);

  function toggleActivation(index: number) {
    groupedFPR[index].activated = !groupedFPR[index].activated;
  }

</script>

{#each groupedFPR as group, index}
  <!-- Year Toggle Button -->
  <button on:click={() => toggleActivation(index)} class="cursor-pointer">
    <div class="bg-[#0C376C] w-fit text-white rounded-xl p-2 px-3 text-lg">
      <div class="whitespace-nowrap flex items-center gap-1">
        <span>{group.year}</span>
        {#if group.activated}
          <!-- Collapse Icon -->
          <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 20.5418V8.4585L17.5003 14.5002L11.667 20.5418Z" fill="white"/>
          </svg>
        {:else}
          <!-- Expand Icon -->
          <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.0003 18.1252L8.16699 12.0835H19.8337L14.0003 18.1252Z" fill="white"/>
          </svg>
        {/if}
      </div>
    </div>
  </button>

  <!-- List of Records under this Year -->
  {#if group.activated}
    {#each group.items as item}
        <div class="flex justify-between rounded-md text-white bg-[#474C58] h-16 p-3 w-60 m-1 lg:w-250 md:w-150 sm:w-125 relative">
            <div class="flex items-start flex-col justify-center">
            <span class="text-sm md:text-md lg:text-lg">{item.forms?.title || "No title."}</span>
            </div>
            <div class="top-1 right-2">
            {#if selectRecord}  
                <input
                  type="checkbox"
                  class="form-checkbox text-gray-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-gray-500 mt-2"
                  checked={(() => $selectedRecords.has(item.answer_id))()}
                  on:change={() => toggleSelection(item.answer_id)} />  
            {/if}
            </div>
        </div>
    {/each}
  {/if}
{/each}
