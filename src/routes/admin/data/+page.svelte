<script lang="ts">
  import Header from '../../../components/Header.svelte'; // adjust the path as needed

  let pageName = "Individual Records Management";
  let selected: 'progress_report' | 'intro_sheet' = 'progress_report';
</script>

<div class="bg-[#F6F8FF]">

  <Header name={pageName} search backButton/>

  <div class="flex justify-end gap-0 mt-28 pr-10 relative bg-[#F6F8FF]">
    <!-- Button 1: Progress Report -->
    <button
      on:click={() => selected = 'progress_report'}
      class={`border rounded-3xl p-4 w-20 cursor-pointer transition-all duration-300
        ${selected === 'progress_report' ? 'bg-white font-bold shadow-md z-20 text-[#1A5A9E] whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm' : 'bg-[#474C58] text-white z-10 whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm'}`}
    >
      <p class="text-center hidden sm:block">Family Progress Report</p>
      <p class="text-center sm:hidden">FPR</p>
    </button>

    <!-- Button 2: Introduction Sheet (always overlaps leftward) -->
    <button
      on:click={() => selected = 'intro_sheet'}
      class={`border rounded-3xl p-4 pl-6 w-20 cursor-pointer transition-all duration-300 -ml-10
        ${selected === 'intro_sheet' ? 'bg-white font-bold shadow-md z-20 text-[#1A5A9E] whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm' : 'bg-[#474C58] text-white z-10 whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm'}`}
    >
      <p class="text-center hidden sm:block">Family Introduction Sheet</p>
      <p class="text-center sm:hidden">FIS</p>
    </button>
  </div>

  <div class="flex justify-center items-center mt-10 bg-[#F6F8FF]">
    <div class="bg-white border-grey mt-3 lg:w-350 md:w-175 sm:w-150 w-150 rounded-xl flex justify-center items-center shadow-2xl h-100">
      
      <div class="flex items-start justify-start gap-2 bg-[#1A5A9E] rounded-sm text-[Inter] font-semibold text-white p-1 w-fit">
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.53204 9.978C4.18184 8.22086 2.50699 6.28809 1.59249 5.20153C1.3094 4.86517 1.21664 4.61902 1.16087 4.18543C0.969883 2.70076 0.874399 1.95842 1.30973 1.47921C1.74507 1 2.51493 1 4.05464 1H14.9454C16.4851 1 17.2549 1 17.6902 1.47921C18.1256 1.95842 18.0301 2.70076 17.8392 4.18544C17.7833 4.61903 17.6906 4.86518 17.4074 5.20153C16.4917 6.28948 14.8135 8.22567 12.4586 9.98499C12.2455 10.1442 12.1051 10.4036 12.079 10.6913C11.8457 13.2702 11.6306 14.6828 11.4966 15.3973C11.2806 16.551 9.64469 17.245 8.769 17.8643C8.24776 18.2329 7.61517 17.7941 7.54762 17.2235C7.41885 16.1358 7.1763 13.9261 6.91153 10.6913C6.88775 10.4009 6.74681 10.1386 6.53204 9.978Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Filter</span>
      </div>
      {#if selected === 'progress_report'}
        <!--TODO-->
      {:else if selected === 'intro_sheet'}
        <!--TODO-->
      {/if}
    </div>
  </div>
</div>