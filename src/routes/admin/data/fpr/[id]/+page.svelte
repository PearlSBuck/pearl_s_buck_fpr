<script lang="ts">
  import Header from '../../../../../components/Header.svelte'; // adjust the paths as needed
    import Year from '../../../../../components/Year.svelte';   
  import Confirm from '../../../../../components/Confirm.svelte';   
  import { goto } from '$app/navigation';
  import { selectedRecords } from '../../selectFPRRecord';
  import { get } from 'svelte/store';
  import { onDestroy } from 'svelte';

  let pageName = "Individual Records Management";
  let showModal = false;
  export let data;
  export let selectRecord: boolean = false;

  
  const { fprData, currentPage, totalPages } = data;

  function goToPage(page: number) {
    if (page >= 1 && page <= (totalPages ?? 1)) {
      goto(`?page=${page}`);
    }
  }

  const confirmDeleteAction = async (ids: unknown[]) => {
    return deleteAction(ids as number[]);
  };

  const deleteAction = async (ids: number[]) => {
    
    // Refresh or re-fetch your data here
    console.log('Deleted:', ids);
  };

  onDestroy(() => {
      selectedRecords.set(new Set());
  });

  function flattenObject(obj: any, prefix = ''): { [key: string]: any } {
    return Object.keys(obj).reduce((acc: any, key) => {
      const value = obj[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, prefixedKey));
      } else if (Array.isArray(value)) {
        acc[prefixedKey] = value
          .map((item, index) => {
            if (typeof item === 'object') {
              return JSON.stringify(item);
            } else {
              return String(item);
            }
          })
          .join('; ');
      } else {
        acc[prefixedKey] = value;
      }

      return acc;
    }, {});
  }

  function sanitizeData(data: any[]) {
    return data.map(entry => {
      const newEntry: Record<string, any> = {};

      for (const key in entry) {
        if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;

        const value = entry[key];

        // If value is object and has Name property (e.g., Question1)
        if (
          typeof value === 'object' &&
          value !== null &&
          'Name' in value
        ) {
          newEntry[key] = value.Name;
        } else {
          newEntry[key] = value;
        }
      }

      return newEntry;
    });
  }


  function exportFullCSV(data: any[]) {
    const headersSet = new Set<string>();

    data.forEach(row => {
      Object.keys(row).forEach(key => headersSet.add(key));
    });

    const headers = Array.from(headersSet);
    const headerLine = headers.join(',') + '\n';

    const rows = data
      .map(row =>
        headers
          .map(key => {
            const value = row[key];
            return `"${String(value ?? '').replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([headerLine + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'records.csv';
    link.click();
  }


  async function handleExport() {
    const selectedIds = Array.from($selectedRecords);

        const res = await fetch('/admin/data/export-fpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
        });

        const data = await res.json();

        console.log("Received data", data);

        if (!res.ok) {
          alert('Failed to fetch export data');
          return;
        }
        else{
          console.log("Exported successfully");
        }
        const cleaned = sanitizeData(data);
        exportFullCSV(cleaned);
  }


</script>

<div class="pt-2 bg-[#F6F8FF]">

  <Header name={pageName} backButton/>

  <div class="flex justify-center items-center mt-10 bg-[#F6F8FF]">
    <div class="mt-30 relative bg-white border-grey mt-3 lg:w-300 md:w-175 sm:w-150 w-75 rounded-xl flex justify-left items-center shadow-2xl h-150">
      <div class="flex justify-left">
          <!-- Mobile-->
        <div class="absolute lg:top-8 lg:right-5 top-16 right-10 flex items-center gap-6 p-2 md:hidden">
          <!-- Delete Records-->
          <button aria-label="Delete" on:click={() => showModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#1A5A9E" class="size-5">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
            </svg>
          </button>
          <Confirm
            bind:show={showModal}
            ids={Array.from($selectedRecords)}
            onConfirmAction={confirmDeleteAction}
            deleteMessage="Are you sure you want to delete the selected records?"
          />
          <!-- Select Records -->
            <button class="text-[#1A5A9E] font-bold text-lg cursor-pointer" on:click={() => selectRecord = !selectRecord}>Select</button>
              <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-0.75">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3469 4.5C19.7731 4.5 20.6771 6.029 19.9898 7.2786L13.6425 18.8192C12.9302 20.1144 11.0691 20.1144 10.3567 18.8192L4.00939 7.2786C3.32211 6.029 4.22617 4.5 5.6523 4.5L18.3469 4.5Z" fill="white"/>
                </svg>
                <span>Export</span>
              </button>
        </div>
        <!-- Desktop-->
        <div class="absolute lg:top-8 lg:right-5 sm:top-6 sm:right-5 top-4 right-5 flex items-center gap-2 p-2">
          <div class="flex items-center justify-start gap-8">
            <div class="hidden md:flex gap-10">
              <!-- Delete Records-->
              <button aria-label="Delete" on:click={() => showModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#1A5A9E" class="size-5">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                </svg>
              </button>
              <Confirm
                bind:show={showModal}
                ids={Array.from($selectedRecords)}
                onConfirmAction={confirmDeleteAction}
                deleteMessage="Are you sure you want to delete the selected records?"
              />
              <button class={`text-[#1A5A9E] font-bold text-lg cursor-pointer ${selectRecord ? 'text-[#808080] ' : 'text-[#1A5A9E]'}`} on:click={() => selectRecord = !selectRecord}>Select</button>
              <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer" on:click={handleExport} aria-label="Export Selected Records">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-0.75">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3469 4.5C19.7731 4.5 20.6771 6.029 19.9898 7.2786L13.6425 18.8192C12.9302 20.1144 11.0691 20.1144 10.3567 18.8192L4.00939 7.2786C3.32211 6.029 4.22617 4.5 5.6523 4.5L18.3469 4.5Z" fill="white"/>
                </svg>
                <span>Export</span>
              </button>
            </div>
            <div class="flex justify-between items-center gap-2 lg:top-8 lg:right-4 top-4 right-2">
              <span class="text-xs lg:text-lg md:text-md sm:text-sm whitespace-nowrap">{data.currentPage} of {data.totalPages}</span>
              <button on:click={() => goToPage((currentPage ?? 1) - 1)} aria-label="Previous Page">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                <path d="M7.825 11L20 11V13L7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11Z" fill="black"/>
                </svg>
              </button>
              <button on:click={() => goToPage((currentPage ?? 1) + 1)} aria-label="Next Page">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                  <path d="M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z" fill="black"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-left gap-4 mx-4">
        <!-- put the thing here -->
         <Year fprData={fprData} selectRecord={selectRecord} />
      </div>
    </div>
  </div>
</div>