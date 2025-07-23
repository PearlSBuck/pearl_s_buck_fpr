<!--+page.svelte-->
<script lang="ts">
  import Header from '../../../components/Header.svelte';
  import RecordComponent from '../../../components/RecordComponent.svelte'; 
  import Confirm from '../../../components/Confirm.svelte';
  import { deleteSCRecords } from './recordQuery';
  import * as XLSX from 'xlsx';
  import { get } from 'svelte/store';  
  import { goto } from '$app/navigation';
  import { selectedRecords } from './selectRecord';
  import { onDestroy } from 'svelte';  

  let pageName = "Individual Records Management";
  let selected: 'progress_report' | 'intro_sheet' = 'progress_report';
  let showModal = false;
  let exportOptions = false;
  let exportType = ""
  
  export let data: {
    records: { sc_id: number; sc_name: string }[];
    totalPages: number;
    currentPage: number;
    query: string;
  };
  export let selectRecord: boolean = false;
  
  let searchQuery = data.query;
  let filterMode = !!searchQuery;

  function onDeleteConfirmed() {
    console.log("Deleted:", Array.from(get(selectedRecords)));
    selectedRecords.set(new Set()); // clear selection
    goToPage(1);
    setTimeout(() => {
      goto('/admin/data');
    }, 1000);
    selectRecord = false;
  }

  function toggleFilter() {
    if (filterMode) {
      // Turn OFF filter mode and reset the query
      filterMode = false;
      searchQuery = "";
      goto(`?page=1`);
    } else {
      // Turn ON filter mode
      filterMode = true;
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= data.totalPages) {
      goto(`?page=${page}`);
    }
  }

  function onSearch() {
    goto(`?page=1&q=${encodeURIComponent(searchQuery)}`);
  }

  function activateSelectAllMode() {
    selectRecord = true;
    selectedRecords.set(new Set(data.records.map(record => record.sc_id)));
  }

  const confirmDeleteAction = async (ids: unknown[]) => {
    return deleteAction(ids as number[]);
  };

  const deleteAction = async (ids: number[]) => {
    await deleteSCRecords(ids);
    // Refresh or re-fetch your data here
    console.log('Deleted:', ids);
  };

  onDestroy(() => {
      selectedRecords.set(new Set());
  });

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

  function exportFullXLSX(data: any[]) {

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, "records.xlsx");
  }

  async function handleExport(exportType: string) {
    const selectedIds = Array.from($selectedRecords);

    if(selected === 'intro_sheet'){
      const res = await fetch('/admin/data/export-fis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
      });

      const data = await res.json();
      const cleaned = sanitizeData(data);

      if (!res.ok) {
        alert('Failed to fetch export data');
        return;
      }
      if(exportType == "csv"){
          exportFullCSV(cleaned);
        }
        else if(exportType == "xlsx"){
          exportFullXLSX(cleaned);
        }
        else if(exportType == "pdf"){
          // insert function call
        }
    }
    else if(selected === 'progress_report'){
        alert("Please select an FPR record first!");
    }
  }
</script>

<div class="pt-2 bg-[#F6F8FF]">

  <Header name={pageName} backButton/>

  <div class="flex justify-end gap-0 mt-32 pr-10 pl-10 relative bg-[#F6F8FF]">
    <!-- Button 1: Progress Report -->
    <button
      on:click={() => selected = 'progress_report'}
      class={`border rounded-3xl p-4 w-50 cursor-pointer transition-all duration-300
        ${selected === 'progress_report' ? 'bg-white font-bold shadow-md z-20 text-[#1A5A9E] whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm' : 'bg-[#474C58] text-white z-10 whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm'}`}
    >
      <p class="text-center hidden sm:block">Family Progress Report</p>
      <p class="text-center sm:hidden">FPR</p>
    </button>

    <!-- Button 2: Introduction Sheet (always overlaps leftward) -->
    <button
      on:click={() => selected = 'intro_sheet'}
      class={`border rounded-3xl p-4 pl-6 w-50 cursor-pointer transition-all duration-300 -ml-10
        ${selected === 'intro_sheet' ? 'bg-white font-bold shadow-md z-20 text-[#1A5A9E] whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm' : 'bg-[#474C58] text-white z-10 whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm'}`}
    >
      <p class="text-center hidden sm:block">Family Introduction Sheet</p>
      <p class="text-center sm:hidden">FIS</p>
    </button>
  </div>

  <div class="flex justify-center items-center mt-10 bg-[#F6F8FF]">
    <div class="relative bg-white border-grey mt-3 lg:w-300 md:w-175 sm:w-150 w-75 rounded-xl flex justify-center items-center shadow-2xl h-150">
      <div class="flex justify-between">
        <div class="absolute lg:top-8 lg:left-4 sm:top-6 sm:right-5 top-4 left-2 flex items-center gap-3 p-2">
            <div class="flex-col relative inline-block">
              <button class="flex items-center justify-start gap-2 bg-[#1A5A9E] rounded-sm text-[Inter] font-semibold text-white p-2 px-2 w-fit cursor-pointer"
                on:click={toggleFilter}>
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-0.2">
                  <path d="M6.53204 9.978C4.18184 8.22086 2.50699 6.28809 1.59249 5.20153C1.3094 4.86517 1.21664 4.61902 1.16087 4.18543C0.969883 2.70076 0.874399 1.95842 1.30973 1.47921C1.74507 1 2.51493 1 4.05464 1H14.9454C16.4851 1 17.2549 1 17.6902 1.47921C18.1256 1.95842 18.0301 2.70076 17.8392 4.18544C17.7833 4.61903 17.6906 4.86518 17.4074 5.20153C16.4917 6.28948 14.8135 8.22567 12.4586 9.98499C12.2455 10.1442 12.1051 10.4036 12.079 10.6913C11.8457 13.2702 11.6306 14.6828 11.4966 15.3973C11.2806 16.551 9.64469 17.245 8.769 17.8643C8.24776 18.2329 7.61517 17.7941 7.54762 17.2235C7.41885 16.1358 7.1763 13.9261 6.91153 10.6913C6.88775 10.4009 6.74681 10.1386 6.53204 9.978Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Filter</span>
              </button>
              <!-- Filter Search -->
              {#if filterMode}
              <div class="mt-4 bg-[#1A5A9E] top-full left-0 rounded-md p-1 h-10 w-[12.5rem] flex items-center justify-between absolute lg:top-8 lg:right-20 sm:top-6 sm:right-5 gap-2 z-[9999]">
                  <input
                    type="text"
                    class="bg-white text-black outline-none h-9 px-2 rounded-l-md flex-grow min-w-0"
                    placeholder="Search by name..."
                    aria-label="Search Records"
                    bind:value={searchQuery}
                    on:keydown={(e) => e.key === 'Enter' && onSearch()}
                  />
                  <button
                    class="h-9 w-9 flex items-center justify-center bg-[#1A5A9E] rounded-r-md"
                    aria-label="Filter Search Button"
                    on:click={onSearch}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="cursor-pointer"
                    >
                      <path
                        d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M21 21L16.65 16.65"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              {/if}  
            </div>
          <button
            on:click={activateSelectAllMode}
            class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer"
            aria-label ="Select All Records"
          >
          <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
            <rect width="31" height="31" rx="3" fill="#1A5A9E"/>
            <path d="M7.7499 4.6499C6.92773 4.6499 6.13923 4.97651 5.55787 5.55787C4.97651 6.13923 4.6499 6.92773 4.6499 7.7499V10.8499C4.6499 11.6721 4.97651 12.4606 5.55787 13.0419C6.13923 13.6233 6.92773 13.9499 7.7499 13.9499H10.8499C11.6721 13.9499 12.4606 13.6233 13.0419 13.0419C13.6233 12.4606 13.9499 11.6721 13.9499 10.8499V7.7499C13.9499 6.92773 13.6233 6.13923 13.0419 5.55787C12.4606 4.97651 11.6721 4.6499 10.8499 4.6499H7.7499ZM7.7499 17.0499C6.92773 17.0499 6.13923 17.3765 5.55787 17.9579C4.97651 18.5392 4.6499 19.3277 4.6499 20.1499V23.2499C4.6499 24.0721 4.97651 24.8606 5.55787 25.4419C6.13923 26.0233 6.92773 26.3499 7.7499 26.3499H10.8499C11.6721 26.3499 12.4606 26.0233 13.0419 25.4419C13.6233 24.8606 13.9499 24.0721 13.9499 23.2499V20.1499C13.9499 19.3277 13.6233 18.5392 13.0419 17.9579C12.4606 17.3765 11.6721 17.0499 10.8499 17.0499H7.7499ZM17.0499 7.7499C17.0499 6.92773 17.3765 6.13923 17.9579 5.55787C18.5392 4.97651 19.3277 4.6499 20.1499 4.6499H23.2499C24.0721 4.6499 24.8606 4.97651 25.4419 5.55787C26.0233 6.13923 26.3499 6.92773 26.3499 7.7499V10.8499C26.3499 11.6721 26.0233 12.4606 25.4419 13.0419C24.8606 13.6233 24.0721 13.9499 23.2499 13.9499H20.1499C19.3277 13.9499 18.5392 13.6233 17.9579 13.0419C17.3765 12.4606 17.0499 11.6721 17.0499 10.8499V7.7499ZM21.6999 17.0499C22.111 17.0499 22.5052 17.2132 22.7959 17.5039C23.0866 17.7946 23.2499 18.1888 23.2499 18.5999V20.1499H24.7999C25.211 20.1499 25.6052 20.3132 25.8959 20.6039C26.1866 20.8946 26.3499 21.2888 26.3499 21.6999C26.3499 22.111 26.1866 22.5052 25.8959 22.7959C25.6052 23.0866 25.211 23.2499 24.7999 23.2499H23.2499V24.7999C23.2499 25.211 23.0866 25.6052 22.7959 25.8959C22.5052 26.1866 22.111 26.3499 21.6999 26.3499C21.2888 26.3499 20.8946 26.1866 20.6039 25.8959C20.3132 25.6052 20.1499 25.211 20.1499 24.7999V23.2499H18.5999C18.1888 23.2499 17.7946 23.0866 17.5039 22.7959C17.2132 22.5052 17.0499 22.111 17.0499 21.6999C17.0499 21.2888 17.2132 20.8946 17.5039 20.6039C17.7946 20.3132 18.1888 20.1499 18.5999 20.1499H20.1499V18.5999C20.1499 18.1888 20.3132 17.7946 20.6039 17.5039C20.8946 17.2132 21.2888 17.0499 21.6999 17.0499Z" fill="white"/>
          </svg>
          </button>
        </div>
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
              <div class="flex flex-col relative">
                <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer" on:click={() => exportOptions = !exportOptions} aria-label="Export Selected Records">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-0.75">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3469 4.5C19.7731 4.5 20.6771 6.029 19.9898 7.2786L13.6425 18.8192C12.9302 20.1144 11.0691 20.1144 10.3567 18.8192L4.00939 7.2786C3.32211 6.029 4.22617 4.5 5.6523 4.5L18.3469 4.5Z" fill="white"/>
                  </svg>
                  <span>Export</span>
                </button>
                {#if exportOptions}
                  <div class="absolute mt-8 z-999">
                    <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap" on:click={() => handleExport("csv")} aria-label="Export CSV Records">
                      <span>Export CSV</span>
                    </button>
                    <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap" on:click={() => handleExport("xlsx")} aria-label="Export XLSX Records">
                      <span>Export XLSX</span>
                    </button>
                    <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap" on:click={() => handleExport("pdf")} aria-label="Export PDF Records">
                      <span>Export PDF</span>
                    </button>
                  </div>
                {/if}
              </div>
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
              <div class="flex flex-col relative">
                <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer" on:click={() => exportOptions = !exportOptions} aria-label="Export Selected Records">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-0.75">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3469 4.5C19.7731 4.5 20.6771 6.029 19.9898 7.2786L13.6425 18.8192C12.9302 20.1144 11.0691 20.1144 10.3567 18.8192L4.00939 7.2786C3.32211 6.029 4.22617 4.5 5.6523 4.5L18.3469 4.5Z" fill="white"/>
                  </svg>
                  <span>Export</span>
                </button>
                {#if exportOptions}
                  <div class="absolute mt-8 z-999">
                    <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap" on:click={() => handleExport("csv")} aria-label="Export CSV Records">
                      <span>Export CSV</span>
                    </button>
                    <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap" on:click={() => handleExport("xlsx")} aria-label="Export XLSX Records">
                      <span>Export XLSX</span>
                    </button>
                    <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap" on:click={() => handleExport("pdf")} aria-label="Export PDF Records">
                      <span>Export PDF</span>
                    </button>
                  </div>
                {/if}
              </div>
            </div>
            <div class="flex justify-between items-center gap-2 lg:top-8 lg:right-4 top-4 right-2">
              <span class="text-xs lg:text-lg md:text-md sm:text-sm whitespace-nowrap">{data.currentPage} of {data.totalPages}</span>
              <button on:click={() => goToPage(data.currentPage - 1)} aria-label="Previous Page">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                <path d="M7.825 11L20 11V13L7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11Z" fill="black"/>
                </svg>
              </button>
              <button on:click={() => goToPage(data.currentPage + 1)} aria-label="Next Page">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                  <path d="M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z" fill="black"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center gap-4 mt-16">
        {#if selected === 'progress_report'}
            {#each data.records as record}
              <RecordComponent name={record.sc_name} id_number={record.sc_id} {selectRecord} selected={selected}/>
            {/each}
            
        {:else if selected === 'intro_sheet'}
            {#each data.records as record}
              <RecordComponent name={record.sc_name} id_number={record.sc_id} {selectRecord} selected={selected}/>
            {/each}
        {/if}
      </div>
    </div>
  </div>
</div>