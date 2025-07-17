<!--User Management Page -->
<!--+page.svelte-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '../../../components/Header.svelte'; // adjust the paths as needed
  import { onDestroy } from 'svelte';

  let debounceTimeout: ReturnType<typeof setTimeout>;

  // Page name for header
  let pageName = "User Management Page";
  
  // Component state
  let selectedMonth = new Date().getMonth();
  let selectedYear = new Date().getFullYear();
  let currentPage = 1;
  let sortBy = 'date';
  let sortOrder = 'desc';
  let searchTerm = '';
  let showFilters = false;
  let hoveredHeader: string | null = null;
  let isLoading = false;
  let tooltipPosition = { x: 0, y: 0 };
  let tooltipVisible = false;
  
  // Data from server
  export let data;
  
  // Reactive statements to get data from server
  $: auditLogs = data?.auditLogs || { logs: [], totalCount: 0, totalPages: 0, currentPage: 1, hasMore: false };
  $: filters = data?.filters || {};
  
  // Update local state when server data changes
  $: if (filters.month !== undefined) selectedMonth = filters.month;
  $: if (filters.year !== undefined) selectedYear = filters.year;
  $: if (filters.page !== undefined) currentPage = filters.page;
  $: if (filters.sortBy !== undefined) sortBy = filters.sortBy;
  $: if (filters.sortOrder !== undefined) sortOrder = filters.sortOrder;
  $: if (filters.searchTerm !== undefined) searchTerm = filters.searchTerm;
  
  const logsPerPage = 10;
  
  // Transform server data to match frontend expectations
  $: transformedLogs = auditLogs.logs.map(log => ({
    id: log.log_id,
    action: log.action_performed,
    type: getActionType(log.action_performed),
    color: getActionColor(log.action_performed),
    bgColor: getActionBgColor(log.action_performed),
    icon: getActionIcon(log.action_performed),
    user: log.user_fullname || log.admin_fullname || 'Unknown User',
    date: new Date(log.created_at),
    details: `${log.action_performed} - User ID: ${log.user_id || log.admin_id || 'N/A'}`
  }));
  
  // Helper functions to determine action styling
  const getActionType = (action: string) => {
    if (action.toLowerCase().includes('creat')) return 'create';
    if (action.toLowerCase().includes('delet')) return 'delete';
    if (action.toLowerCase().includes('view') || action.toLowerCase().includes('access')) return 'view';
    return 'edit';
  };
  
  const getActionColor = (action: string) => {
    const type = getActionType(action);
    switch (type) {
      case 'create': return 'text-green-600';
      case 'delete': return 'text-red-600';
      case 'view': return 'text-gray-600';
      case 'edit': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };
  
  const getActionBgColor = (action: string) => {
    const type = getActionType(action);
    switch (type) {
      case 'create': return 'bg-green-100';
      case 'delete': return 'bg-red-100';
      case 'view': return 'bg-gray-100';
      case 'edit': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };
  
  const getActionIcon = (action: string) => {
    const type = getActionType(action);
    switch (type) {
      case 'create': return '➕';
      case 'delete': return '🗑️';
      case 'view': return '👁️';
      case 'edit': return '✏️';
      default: return '📝';
    }
  };

  // Header tooltip content
  const getHeaderTooltipContent = (headerType: string) => {
    switch (headerType) {
      case 'date':
        return 'Click to sort by date and time.';
      case 'action':
        return 'Click to sort by action type alphabetically.';
      case 'user':
        return 'Click to sort by user name in alphabetical order.';
      default:
        return '';
    }
  };

  // Tooltip functions for headers
  const showHeaderTooltip = (event: MouseEvent, headerType: string) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate initial position
    let x = rect.left + scrollX;
    let y = rect.bottom + scrollY + 10; // Position below the header
    
    // Tooltip dimensions
    const tooltipWidth = 320; // Slightly wider for header tooltips
    const tooltipHeight = 80;
    
    // Check if tooltip goes off the right edge
    if (x + tooltipWidth > window.innerWidth + scrollX) {
      x = window.innerWidth + scrollX - tooltipWidth - 10;
    }
    
    // Check if tooltip goes off the left edge
    if (x < scrollX) {
      x = scrollX + 10;
    }
    
    // Check if tooltip goes off the bottom edge
    if (y + tooltipHeight > window.innerHeight + scrollY) {
      y = rect.top + scrollY - tooltipHeight - 10; // Position above the header instead
    }
    
    tooltipPosition = { x, y };
    hoveredHeader = headerType;
    tooltipVisible = true;
  };

  const hideHeaderTooltip = () => {
    tooltipVisible = false;
    hoveredHeader = null;
  };

  // Utility functions
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Navigation functions
  const updateFilters = async () => {
    isLoading = true;
    const url = new URL($page.url);
    url.searchParams.set('month', selectedMonth.toString());
    url.searchParams.set('year', selectedYear.toString());
    url.searchParams.set('page', currentPage.toString());
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', sortOrder);
    url.searchParams.set('search', searchTerm);
    
    await goto(url.toString(), { replaceState: true });
    isLoading = false;
  };

  const handleSort = async (field: string) => {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
    currentPage = 1;
    await updateFilters();
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const clearFilters = async () => {
    selectedMonth = new Date().getMonth();
    selectedYear = new Date().getFullYear();
    searchTerm = '';
    currentPage = 1;
    sortBy = 'date';
    sortOrder = 'desc';
    await updateFilters();
  };

  const handlePageChange = async (newPage: number) => {
    currentPage = newPage;
    await updateFilters();
  };

  const handleSearch = async () => {
    currentPage = 1;
    await updateFilters();
  };

  // Cleaner debounced search input handler
  const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    searchTerm = target.value;
    
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const exportLogs = async () => {
    try {
      isLoading = true;
      const formData = new FormData();
      formData.append('month', selectedMonth.toString());
      formData.append('year', selectedYear.toString());
      formData.append('searchTerm', searchTerm);

      const response = await fetch($page.url.pathname + '?/exportLogs', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Create and download CSV file
          const blob = new Blob([result.csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    } finally {
      isLoading = false;
    }
  };

  // Watch for month/year changes
  $: if (selectedMonth !== filters.month || selectedYear !== filters.year) {
    updateFilters();
  }

  $: totalPages = auditLogs.totalPages || 0;
  $: startIndex = auditLogs.logs.length > 0 ? (currentPage - 1) * logsPerPage + 1 : 0;
  $: endIndex = Math.min(currentPage * logsPerPage, auditLogs.totalCount || 0);

  // Clean up timeout on component destroy
  onDestroy(() => {
    clearTimeout(debounceTimeout);
  });
</script>

<svelte:head>
  <title>User Management - Pearl S. Buck Foundation</title>
</svelte:head>

<div class="pt-2 bg-[#F6F8FF] min-h-screen">
  <!-- Header -->
  <Header name={pageName} search backButton/>

  <!-- Page Title -->
  <div class="bg-[#474C58] text-white py-3">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-lg font-medium">User Management</h2>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Edit User Section -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-2xl p-6 h-full mb-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Edit User (DUMMY)</h3>
          
          <div class="space-y-4">
            <div class="flex space-x-2">
              <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by Name"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A5A9E] focus:border-transparent"
                />
              </div>
              <button class="flex items-center space-x-2 bg-[#1A5A9E] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Create Account</span>
              </button>
            </div>

            <div class="space-y-3">
              {#each ['Username1', 'Username2', 'Username3', 'Username4'] as username, index}
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div class="flex items-center space-x-3">
                    <span class="text-gray-600 font-medium">{index + 1}.</span>
                    <span class="text-gray-900">{username}</span>
                  </div>
                  <button class="bg-[#1A5A9E] text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                    View
                  </button>
                </div>
              {/each}
              <div class="text-center py-4 text-gray-500">...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Audit Log Section -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-2xl p-6 h-full mb-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Audit Log</h3>
            <div class="flex items-center space-x-2">
              <button
                on:click={() => showFilters = !showFilters}
                class="flex items-center space-x-2 bg-[#1A5A9E] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.53204 9.978C4.18184 8.22086 2.50699 6.28809 1.59249 5.20153C1.3094 4.86517 1.21664 4.61902 1.16087 4.18543C0.969883 2.70076 0.874399 1.95842 1.30973 1.47921C1.74507 1 2.51493 1 4.05464 1H14.9454C16.4851 1 17.2549 1 17.6902 1.47921C18.1256 1.95842 18.0301 2.70076 17.8392 4.18544C17.7833 4.61903 17.6906 4.86518 17.4074 5.20153C16.4917 6.28948 14.8135 8.22567 12.4586 9.98499C12.2455 10.1442 12.1051 10.4036 12.079 10.6913C11.8457 13.2702 11.6306 14.6828 11.4966 15.3973C11.2806 16.551 9.64469 17.245 8.769 17.8643C8.24776 18.2329 7.61517 17.7941 7.54762 17.2235C7.41885 16.1358 7.1763 13.9261 6.91153 10.6913C6.88775 10.4009 6.74681 10.1386 6.53204 9.978Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Filter</span>
              </button>
            </div>
          </div>

          <!-- Filters -->
          {#if showFilters}
            <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="month-select" class="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    id="month-select"
                    bind:value={selectedMonth}
                    class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A5A9E] focus:border-transparent"
                  >
                    {#each months as month, index}
                      <option value={index}>{month}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="year-select" class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    id="year-select"
                    bind:value={selectedYear}
                    class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A5A9E] focus:border-transparent"
                  >
                    {#each years as year}
                      <option value={year}>{year}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="search-logs-input" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    id="search-logs-input"
                    type="text"
                    placeholder="Search action or user..."
                    value={searchTerm}
                    on:input={handleSearchInput}
                    class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A5A9E] focus:border-transparent"
                  />
                </div>
              </div>
              <div class="flex justify-end space-x-2">
                <button
                  on:click={clearFilters}
                  class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          {/if}

          <!-- Current Filter Display -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{months[selectedMonth]} {selectedYear}</span>
              {#if searchTerm}
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              {/if}
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">
                {auditLogs.totalCount > 0 ? `${startIndex}-${endIndex} of ${auditLogs.totalCount}` : '0 of 0'}
              </span>
              <button
                on:click={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.825 11L20 11V13L7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11Z" fill="currentColor"/>
                </svg>
              </button>
              <button
                on:click={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          {#if isLoading}
            <div class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A5A9E]"></div>
            </div>
          {/if}

          <!-- Audit Log Table -->
          {#if !isLoading}
            <div class="overflow-hidden bg-white rounded-lg border border-gray-200">
              <!-- Table Header -->
              <div class="bg-gray-50 px-6 py-3 grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="col-span-4">
                  <button
                    class="flex items-center space-x-1 hover:text-gray-700 transition-colors group"
                    on:click={() => handleSort('date')}
                    on:mouseenter={(e) => showHeaderTooltip(e, 'date')}
                    on:mouseleave={hideHeaderTooltip}
                  >
                    <span>Date & Time</span>
                    <span class="text-gray-400 group-hover:text-gray-600">{getSortIcon('date')}</span>
                  </button>
                </div>
                <div class="col-span-4">
                  <button
                    class="flex items-center space-x-1 hover:text-gray-700 transition-colors group"
                    on:click={() => handleSort('action')}
                    on:mouseenter={(e) => showHeaderTooltip(e, 'action')}
                    on:mouseleave={hideHeaderTooltip}
                  >
                    <span>Action</span>
                    <span class="text-gray-400 group-hover:text-gray-600">{getSortIcon('action')}</span>
                  </button>
                </div>
                <div class="col-span-4">
                  <button
                    class="flex items-center space-x-1 hover:text-gray-700 transition-colors group"
                    on:click={() => handleSort('user')}
                    on:mouseenter={(e) => showHeaderTooltip(e, 'user')}
                    on:mouseleave={hideHeaderTooltip}
                  >
                    <span>User</span>
                    <span class="text-gray-400 group-hover:text-gray-600">{getSortIcon('user')}</span>
                  </button>
                </div>
              </div>

              <!-- Table Body -->
              <div class="divide-y divide-gray-200">
                {#each transformedLogs as log}
                  <div class="px-6 py-4 grid grid-cols-12 gap-4 hover:bg-gray-50 transition-colors">
                    <div class="col-span-4">
                      <div class="text-sm text-gray-900 font-medium">
                        {formatDate(log.date)}
                      </div>
                    </div>
                    <div class="col-span-4">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">{log.icon}</span>
                        <span class="text-sm font-medium {log.color}">{log.action}</span>
                      </div>
                    </div>
                    <div class="col-span-4">
                      <div class="text-sm text-gray-900 font-medium">
                        {log.user}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Empty State -->
              {#if transformedLogs.length === 0}
                <div class="px-6 py-8 text-center">
                  <div class="text-gray-500 text-sm">
                    No audit logs found for the selected criteria.
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Header Tooltip -->
{#if tooltipVisible && hoveredHeader}
  <div
    class="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs pointer-events-none"
    style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
  >
    <div class="font-medium mb-1">
      {hoveredHeader === 'date' ? 'Date & Time' : hoveredHeader === 'action' ? 'Action Type' : 'User'}
    </div>
    <div class="text-gray-300 text-xs leading-relaxed">
      {getHeaderTooltipContent(hoveredHeader)}
    </div>
    <!-- Tooltip arrow -->
    <div class="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
  </div>
{/if}

<style>
  /* Additional custom styles */
  .bg-green-100 { background-color: #dcfce7; }
  .bg-blue-100 { background-color: #dbeafe; }
  .bg-red-100 { background-color: #fee2e2; }
  .bg-gray-100 { background-color: #f3f4f6; }
  .bg-yellow-100 { background-color: #fef3c7; }
  .bg-purple-100 { background-color: #f3e8ff; }
  
  .text-green-600 { color: #16a34a; }
  .text-blue-600 { color: #2563eb; }
  .text-red-600 { color: #dc2626; }
  .text-gray-600 { color: #4b5563; }
  .text-yellow-600 { color: #d97706; }
  .text-purple-600 { color: #9333ea; }
</style>