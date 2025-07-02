<script lang="ts">
  export let name: string = '';
  export let search: boolean = false;
  export let backButton: boolean = false;
</script>

<div class="fixed top-0 left-0 right-0 z-50 bg-[#F6F8FF]">
  <div class="bg-white h-16 flex items-center px-4 justify-between">
    <img src="/logo.jpg" alt="Logo" class="h-12 w-12 lg:h-16 lg:w-16 md:h-14 md:w-14 sm:h-12 sm:w-12 p-1"/>

    <h1 class="absolute left-1/2 transform -translate-x-1/2 text-black font-bold whitespace-nowrap hidden sm:block text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl">
    Pearl S. Buck Foundation Philippines, Inc.
    </h1>

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 63" fill="none" class="h-12 w-12 lg:h-16 lg:w-16 md:h-14 md:w-14 sm:h-12 sm:w-12 p-2">
      <rect width="63" height="63" rx="31.5" fill="#0C376C" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M40.9506 25.2C40.9506 30.4191 36.7197 34.65 31.5006 34.65C26.2815 34.65 22.0506 30.4191 22.0506 25.2C22.0506 19.9809 26.2815 15.75 31.5006 15.75C36.7197 15.75 40.9506 19.9809 40.9506 25.2ZM37.8006 25.2C37.8006 28.6794 34.98 31.5 31.5006 31.5C28.0212 31.5 25.2006 28.6794 25.2006 25.2C25.2006 21.7206 28.0212 18.9 31.5006 18.9C34.98 18.9 37.8006 21.7206 37.8006 25.2Z"
        fill="white"
      />
      <path
        d="M31.5006 39.375C21.3035 39.375 12.6152 45.4047 9.30566 53.8525C10.1119 54.6531 10.9612 55.4103 11.8498 56.1205C14.3143 48.3646 22.0455 42.525 31.5006 42.525C40.9558 42.525 48.687 48.3646 51.1515 56.1205C52.0401 55.4104 52.8894 54.6531 53.6956 53.8525C50.386 45.4048 41.6978 39.375 31.5006 39.375Z"
        fill="white"
      />
    </svg>
  </div>

  <div class="bg-[#474C58] h-10 flex justify-between items-center">
    <span class="flex items-center gap-2 lg:gap-4 ml-4">
      <p class="lg:ml-10 text-white text-xs font-semibold lg:text-lg md:text-md sm:text-sm">{name}</p>
      {#if backButton}
      <button on:click={() => history.back()} class="bg-[#1A5A9E] text-white font-semibold py-0.5 px-3 rounded-lg cursor-pointer">Back</button>
      {/if}
    </span>
    {#if search}
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-4 lg:mr-10">
    <path d="M21 21L15 15M17 10C17 10.9193 16.8189 11.8295 16.4672 12.6788C16.1154 13.5281 15.5998 14.2997 14.9497 14.9497C14.2997 15.5998 13.5281 16.1154 12.6788 16.4672C11.8295 16.8189 10.9193 17 10 17C9.08075 17 8.1705 16.8189 7.32122 16.4672C6.47194 16.1154 5.70026 15.5998 5.05025 14.9497C4.40024 14.2997 3.88463 13.5281 3.53284 12.6788C3.18106 11.8295 3 10.9193 3 10C3 8.14348 3.7375 6.36301 5.05025 5.05025C6.36301 3.7375 8.14348 3 10 3C11.8565 3 13.637 3.7375 14.9497 5.05025C16.2625 6.36301 17 8.14348 17 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    {/if}
  </div>
</div>