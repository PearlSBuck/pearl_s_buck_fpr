<script lang="ts">
  import Header from '../../../../../components/Header.svelte'; // adjust the paths as needed
  import Record from '../../../../../components/RecordComponent.svelte'; 
  import Year from '../../../../../components/Year.svelte';   
  import { goto } from '$app/navigation';
  import { selectedRecords } from '../../selectRecord';
  import { get } from 'svelte/store';
  import { onDestroy } from 'svelte';

  let pageName = "Individual Records Management";
  let selected: 'progress_report' | 'intro_sheet' = 'progress_report';
  export let data;
  
  const { fprData, currentPage, totalPages } = data;

  let searchQuery = data.query;
  let filterMode = !!searchQuery;

  function goToPage(page: number) {
    if (page >= 1 && page <= data.totalPages) {
      goto(`?page=${page}`);
    }
  }

  onDestroy(() => {
      selectedRecords.set(new Set());
  });


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
    <div class="relative bg-white border-grey mt-3 lg:w-300 md:w-175 sm:w-150 w-75 rounded-xl flex justify-left items-center shadow-2xl h-150">
      <div class="flex justify-left">
            <!-- Desktop-->
            <div class="absolute lg:top-8 lg:right-5 sm:top-6 sm:right-5 top-4 right-5 flex items-center gap-2 p-2">
            <div class="flex items-center justify-start gap-8">
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
      <div class="flex flex-col justify-left gap-4 mx-4">
        <!-- put the thing here -->
         <Year fprData={fprData}/>
      </div>
    </div>
  </div>
</div>