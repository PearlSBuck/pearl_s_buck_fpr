<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  export let name: string = '';
  export let search: boolean = false;
  export let backButton: boolean = false;
  
  let isNavOpen = false;
  let formsExpanded = true;
  let recordsExpanded = true;
  let managementExpanded = true;
  let addRecordsExpanded = true;
  let manageRecordsExpanded = true;
  let userManagementExpanded = true;
  
  // Check if current route is admin
  $: isAdminRoute = $page.route.id?.startsWith('/admin') || false;
  
  // Check if current route is login - hide navbar completely for login page
  $: isLoginRoute = $page.route.id === '/login' || $page.url.pathname === '/login';
  
  function toggleNav() {
    isNavOpen = !isNavOpen;
  }
  
  function closeNav() {
    isNavOpen = false;
  }
  

function navigateToLogout() {
  goto('/login');
  // add logout logic here
  closeNav();
}

  
  function toggleForms() {
    formsExpanded = !formsExpanded;
  }
  
  function toggleRecords() {
    recordsExpanded = !recordsExpanded;
  }
  
  function toggleManagement() {
    managementExpanded = !managementExpanded;
  }
  
  function toggleAddRecords() {
    addRecordsExpanded = !addRecordsExpanded;
  }
  
  function toggleManageRecords() {
    manageRecordsExpanded = !manageRecordsExpanded;
  }
  
  function toggleUserManagement() {
    userManagementExpanded = !userManagementExpanded;
  }

  // Close navigation when clicking outside
  function handleOutsideClick(event: MouseEvent) {
    if (isNavOpen && !(event.target as Element).closest('.nav-container') && !(event.target as Element).closest('.nav-toggle')) {
      closeNav();
    }
  }
</script>

<svelte:window on:click={handleOutsideClick} />

<!-- Header always shows, but navigation buttons are hidden on login page -->
<div class="fixed top-0 left-0 right-0 z-50 bg-[#F6F8FF]">
  <div class="bg-white h-14 sm:h-16 flex items-center px-3 sm:px-4 justify-between">
    <!-- Hamburger Menu Button for Mobile (hidden on login page) -->
    <div class="flex items-center">
      {#if !isLoginRoute}
      <button 
        onclick={toggleNav} 
        class="nav-toggle cursor-pointer p-1 sm:p-0 mr-2 sm:mr-0 md:hidden" 
        aria-label="Toggle navigation menu"
      >
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Logo (hidden on small screens when hamburger is shown) -->
      <button onclick={toggleNav} class="nav-toggle cursor-pointer hidden md:block">
        <img src="/logo.jpg" alt="Logo" class="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 md:h-14 md:w-14 p-1"/>
      </button>
      {:else}
      <!-- Logo for login page (always visible, no click handler) -->
      <div class="cursor-default">
        <img src="/logo.jpg" alt="Logo" class="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 md:h-14 md:w-14 p-1"/>
      </div>
      {/if}
    </div>
     
    <!-- Title - Responsive -->
    <h1 class="absolute left-1/2 transform -translate-x-1/2 text-black font-bold whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl px-2">
      <span class="hidden sm:inline">Pearl S. Buck Foundation Philippines, Inc.</span>
      <span class="sm:hidden">PSB Foundation</span>
    </h1>
     
    <!-- User Icon (hidden on login page) -->
    <div class="flex items-center gap-2">
      {#if search && !isLoginRoute}
      <button 
        class="p-2 hover:bg-gray-100 rounded-full transition-colors" 
        aria-label="Search"
      >
      </button>
      {/if}
      {#if !isLoginRoute}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 63" fill="none" class="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 p-1 sm:p-2">
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
      {/if}
    </div>
  </div>
   
  <!-- Second Header Bar (hidden on login page) -->
  {#if !isLoginRoute}
  <div class="bg-[#474C58] h-12 sm:h-14 flex justify-between items-center px-3 sm:px-4">
  <span class="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
    <p class="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold truncate min-w-0 flex-1 lg:ml-6">
      {name}
    </p>
    {#if backButton}
    <button 
      onclick={() => history.back()} 
      class="bg-[#1A5A9E] text-white font-medium py-2 px-3 sm:py-2 sm:px-4 rounded-lg cursor-pointer text-xs sm:text-sm hover:bg-[#0f4577] active:bg-[#0a3a63] transition-colors flex-shrink-0 touch-manipulation"
      aria-label="Go back"
    >
      Back
    </button>
    {/if}
  </span>
</div>
  {/if}
</div>

<!-- Navigation elements (hidden on login page) -->
{#if !isLoginRoute}
<!-- Mobile Overlay -->
{#if isNavOpen}
  <button 
    type="button"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    onclick={closeNav}
    aria-label="Close navigation menu"
  ></button>
{/if}

<!-- Vertical Navigation -->
<div class="nav-container fixed top-0 left-0 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out {isNavOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl w-4/5 sm:w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5 max-w-xs">
  <!-- Navigation Header -->
  <div class="bg-[#1A5A9E] h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
    <h2 class="text-white font-bold text-lg sm:text-xl">
      {isAdminRoute ? 'Admin' : 'Worker'}
    </h2>
    <button onclick={closeNav} class="text-white hover:text-gray-300 transition-all duration-300 font-bold text-xl sm:text-2xl p-2 -m-2">
      ×
    </button>
  </div>
  
  <!-- Navigation Items -->
  <div class="flex flex-col bg-white overflow-y-auto" style="height: calc(100vh - 56px); /* Adjust for mobile header */">
    {#if isAdminRoute}
      <!-- Admin Navigation -->
      <!-- Home -->
      <!-- <a href="/home" class="w-full bg-white px-4 sm:px-6 py-4 sm:py-4 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 hover:border-[#28a745] font-medium border-b border-[#f0f0f0] text-sm sm:text-base active:bg-[#e9ecef]">
        <span class="flex items-center gap-3">
          <span class="text-lg">🏠</span>
          <span>Home</span>
        </span>
      </a> -->
      
      <!-- Edit Forms Section -->
      <div class="border-b-2 border-[#f0f0f0]">
        <button onclick={toggleForms} class="w-full bg-[#f8f9fa] px-4 sm:px-6 py-4 sm:py-4 text-left text-[#474C58] font-bold flex items-center justify-between hover:bg-[#e9ecef] transition-all duration-300 border-l-4 border-transparent hover:border-[#1A5A9E] text-sm sm:text-base active:bg-[#dee2e6]">
          <span class="flex items-center gap-3">
            <span class="text-lg">📝</span>
            <span>Manage Forms</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {formsExpanded ? 'rotate-180' : ''} sm:w-5 sm:h-5">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="bg-white overflow-hidden transition-all duration-300 ease-in-out {formsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
          <div class="w-full h-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] text-xs sm:text-sm font-medium active:bg-[#e9ecef]">
            <a href="/admin/forms">
              <span class="flex items-center gap-3">
                <span>📋</span>
                <span>Family Introduction Sheet</span>
              </span>
            </a>
          </div>
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 hover:border-[#28a745] text-xs sm:text-sm font-medium border-b border-[#f0f0f0] active:bg-[#e9ecef]">
            <a href="/admin/forms" >
              <span class="flex items-center gap-3">
                <span>📝</span>
                <span>Family Progress Report</span>
              </span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Add Records Section -->
      <div class="border-b-2 border-[#f0f0f0]">
        <button onclick={toggleAddRecords} class="w-full bg-[#f8f9fa] px-4 sm:px-6 py-4 sm:py-4 text-left text-[#474C58] font-bold flex items-center justify-between hover:bg-[#e9ecef] transition-all duration-300 border-l-4 border-transparent hover:border-[#1A5A9E] text-sm sm:text-base active:bg-[#dee2e6]">
          <span class="flex items-center gap-3">
            <span class="text-lg">➕</span>
            <span>Create Forms</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {addRecordsExpanded ? 'rotate-180' : ''} sm:w-5 sm:h-5">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="bg-white overflow-hidden transition-all duration-300 ease-in-out {addRecordsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] text-xs sm:text-sm font-medium active:bg-[#e9ecef]">

            <a href="/admin/forms/create">
              <span class="flex items-center gap-3">
                <span>📋</span>
                <span>Create</span>
              </span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Manage Records Section -->
      <div class="border-b-2 border-[#f0f0f0]">
        <button onclick={toggleManageRecords} class="w-full bg-[#f8f9fa] px-4 sm:px-6 py-4 sm:py-4 text-left text-[#474C58] font-bold flex items-center justify-between hover:bg-[#e9ecef] transition-all duration-300 border-l-4 border-transparent hover:border-[#1A5A9E] text-sm sm:text-base active:bg-[#dee2e6]">
          <span class="flex items-center gap-3">
            <span class="text-lg">⚙️</span>
            <span>Manage Records</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {manageRecordsExpanded ? 'rotate-180' : ''} sm:w-5 sm:h-5">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="bg-white overflow-hidden transition-all duration-300 ease-in-out {manageRecordsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] text-xs sm:text-sm font-medium active:bg-[#e9ecef]">
            <a href="/admin/data?tab=intro_sheet">
              <span class="flex items-center gap-3">
                <span>📋</span>
                <span>Family Introduction Sheet</span>
              </span>
            </a>
          </div>
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 hover:border-[#28a745] text-xs sm:text-sm font-medium border-b border-[#f0f0f0] active:bg-[#e9ecef]">
            <a href="/admin/data?tab=progress_report">
              <span class="flex items-center gap-3">
                <span>📝</span>
                <span>Family Progress Report</span>
              </span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- User Management Section -->
      <div class="border-b-2 border-[#f0f0f0]">
        <button onclick={toggleUserManagement} class="w-full bg-[#f8f9fa] px-4 sm:px-6 py-4 sm:py-4 text-left text-[#474C58] font-bold flex items-center justify-between hover:bg-[#e9ecef] transition-all duration-300 border-l-4 border-transparent hover:border-[#1A5A9E] text-sm sm:text-base active:bg-[#dee2e6]">
          <span class="flex items-center gap-3">
            <span class="text-lg">👥</span>
            <span>User Management</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {userManagementExpanded ? 'rotate-180' : ''} sm:w-5 sm:h-5">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="bg-white overflow-hidden transition-all duration-300 ease-in-out {userManagementExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 hover:border-[#28a745] text-xs sm:text-sm font-medium border-b border-[#f0f0f0] active:bg-[#e9ecef]">
            <a href="/admin/manage" >
              <span class="flex items-center gap-3">
                <span>🤝</span>
                <span>Manage Users</span>
              </span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Logout -->
      <button onclick={navigateToLogout} class="w-full bg-white px-4 sm:px-6 py-4 sm:py-4 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#dc3545] transition-all duration-300 border-l-4 border-transparent hover:border-[#dc3545] font-medium text-sm sm:text-base active:bg-[#e9ecef]">
        <span class="flex items-center gap-3">
          <span class="text-lg">🚪</span>
          <span>Logout</span>
        </span>
      </button>
      
    {:else}
      <!-- Regular User Navigation -->
      <!-- <a href="/home" class="w-full bg-white px-4 sm:px-6 py-4 sm:py-4 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] font-medium text-sm sm:text-base active:bg-[#e9ecef]">
        <span class="flex items-center gap-3">
          <span class="text-lg">🏠</span>
          <span>Home</span>
        </span>
      </a> -->
      
      <!-- Records Section -->
      <div class="border-b-2 border-[#f0f0f0]">
        <button onclick={toggleRecords} class="w-full bg-[#f8f9fa] px-4 sm:px-6 py-4 sm:py-4 text-left text-[#474C58] font-bold flex items-center justify-between hover:bg-[#e9ecef] transition-all duration-300 border-l-4 border-transparent hover:border-[#1A5A9E] text-sm sm:text-base active:bg-[#dee2e6]">
          <span class="flex items-center gap-3">
            <span class="text-lg">📋</span>
            <span>Manage Forms</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {recordsExpanded ? 'rotate-180' : ''} sm:w-5 sm:h-5">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="bg-white overflow-hidden transition-all duration-300 ease-in-out {recordsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] text-xs sm:text-sm font-medium active:bg-[#e9ecef]">
            <a href="/admin/forms" >
              <span class="flex items-center gap-3">
                <span>📊</span>
                <span>Family Introduction Sheet</span>
              </span>
            </a>
          </div>
          <div class="w-full px-6 sm:px-8 py-3 sm:py-3 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] text-xs sm:text-sm font-medium active:bg-[#e9ecef]">
            <a href="/admin/forms" >
              <span class="flex items-center gap-3">
                <span>📈</span>
                <span>Family Progress Report</span>
              </span>
            </a>
          </div>
        </div>
      </div>

       <!-- Logout -->
      <button onclick={navigateToLogout} class="w-full bg-white px-4 sm:px-6 py-4 sm:py-4 text-left text-[#666] hover:bg-[#f8f9fa] hover:text-[#1A5A9E] transition-all duration-300 border-l-4 border-transparent hover:border-[#28a745] font-medium text-sm sm:text-base active:bg-[#e9ecef]">
        <span class="flex items-center gap-3">
          <span class="text-lg">🚪</span>
          <span>Logout</span>
        </span>
      </button>
      
    {/if}
  </div>
</div>
{/if}

<style>
  /* Ensure smooth transitions */
  .transform {
    transition: transform 0.3s ease-in-out;
  }
  
  /* Custom scrollbar for webkit browsers */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Ensure buttons are accessible on touch devices */
  @media (max-width: 768px) {
    button {
      min-height: 44px; /* iOS recommended minimum touch target */
    }
  }
</style>