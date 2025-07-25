<script lang="ts">
  import Header from '../../../../../components/Header.svelte';
  import Year from '../../../../../components/Year.svelte';   
  import Confirm from '../../../../../components/Confirm.svelte';
  import { goto } from '$app/navigation';
  import { selectedRecords } from '../../selectFPRRecord';
  import { onDestroy } from 'svelte';
  import * as XLSX from 'xlsx';

  // Define types for the data structure
  interface RecordType {
    answer_id: string;
    created_at: string;
    // add other properties as needed
  }

  interface RecordsByYearType {
    [year: number]: RecordType[];
  }

  interface Question {
    question: string;
    answer: string;
  }

  interface Section {
    title: string;
    questions: Question[];
  }

  let pageName = "Individual Records Management";
  export let data: {
    years: number[];
    recordsByYear: RecordsByYearType;
    childId: number;
    childName: string;
    currentPage: number;
    totalPages: number;
  };
  
  export let selectRecord: boolean = false; // Toggle for selection mode
  let showModal = false; // For delete confirmation modal
  let exportOptions = false;
  
  // Add these variables near the top of your script
  let showDeleteInProgress = false;
  let deleteSuccessMessage = '';
  
  // Convert numeric childId to string for the Year component
  const childIdStr = String(data.childId);
  
  // Convert numeric years to strings for the Year component
  const yearsAsStrings = data.years.map(String);
  
  // Extract other properties
  const { recordsByYear, childName, currentPage, totalPages } = data;

  // Convert recordsByYear to use string keys to match the Year component's expectations
  const recordsByYearStrings: {[year: string]: RecordType[]} = {};
  for (const year of data.years) {
    recordsByYearStrings[String(year)] = recordsByYear[year];
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= data.totalPages) {
      goto(`/admin/data/fpr/${data.childId}?page=${page}`);
    }
  }

  // Clear selection when component is destroyed
  onDestroy(() => {
    selectedRecords.set(new Set());
  });

  // Function to handle deletion of records
  const confirmDeleteAction = async (ids: unknown[]) => {
    return deleteAction(ids as string[]);
  };

  const deleteAction = async (ids: string[]) => {
    try {
      // Show feedback to user
      showDeleteInProgress = true;
      
      // Call your API to delete records
      const res = await fetch('/admin/data/fpr/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete records');
      }
      
      // Clear selection
      selectedRecords.set(new Set());
      
      // Success message
      deleteSuccessMessage = `Successfully deleted ${ids.length} record(s)`;
      
      // Force a full page reload to refresh data
      window.location.href = `/admin/data/fpr/${data.childId}?t=${Date.now()}`;
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred during deletion');
      showDeleteInProgress = false;
    }
  };

  // Add data sanitization function
  function sanitizeData(data: any[]) {
    return data.map(entry => {
      const newEntry: {[key: string]: any} = {};

      for (const key in entry) {
        if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;

        const value = entry[key];

        // If value is object and has Name property
        if (typeof value === 'object' && value !== null && 'Name' in value) {
          newEntry[key] = value.Name;
        } else {
          newEntry[key] = value;
        }
      }

      return newEntry;
    });
  }

  // Function to export data as CSV (improved version)
  function exportFullCSV(data: any[]) {
    // For records with properly structured data
    if (data.length > 0 && data[0].metadata && data[0].sections) {
      const rows: string[][] = [];
      
      // Add header row
      rows.push(['Child ID', 'Child Name', 'Created Date', 'Form Version', 'Filled Out By', 'Section', 'Question', 'Answer']);
      
      // Process each record
      data.forEach(record => {
        const metadata = record.metadata;
        
        // Process each section and its questions
        record.sections.forEach((section: { title: string, questions: Array<{ question: string, answer: string }> }) => {
          section.questions.forEach((qa: { question: string, answer: string }) => {
            rows.push([
              metadata['Child ID'] || 'Unknown',
              metadata['Child Name'] || 'Unknown',
              metadata['Created Date'] || 'Unknown',
              metadata['Form Version'] || 'Unknown',
              metadata['Filled Out By'] || 'Unknown',
              section.title || 'Unknown Section',
              qa.question || 'Unknown Question',
              qa.answer || ''
            ]);
          });
        });
      });
      
      // Convert to CSV
      const csvContent = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      // Use child name from the data if available, otherwise use a generic name
      const exportFileName = data.length > 0 && data[0].metadata &&
                            data[0].metadata['Child Name'] &&
                            data[0].metadata['Child Name'] !== 'Unknown' ?
                            `${data[0].metadata['Child Name'].replace(/[^\w]/g, '_')}_fpr_records.csv` :
                            `fpr_records.csv`;
      
      link.href = url;
      link.download = exportFileName;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Fall back to the original implementation for flat data
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
      link.download = `${childName}_fpr_records.csv`;
      link.click();
    }
  }

  // Function to export data as XLSX (matching CSV format)
  function exportFullXLSX(data: any[]) {
    // Check if the data has the structured format we expect
    if (data.length > 0 && data[0].metadata && data[0].sections) {
      const wb = XLSX.utils.book_new();
      
      // Create a single flat table format similar to CSV
      const rows = [];
      
      // Add header row
      rows.push(['Child ID', 'Child Name', 'Created Date', 'Form Version', 'Filled Out By', 'Section', 'Question', 'Answer']);
      
      // Process each record and flatten them into rows
      data.forEach(record => {
        const metadata = record.metadata;
        
        // Process each section and its questions
        record.sections.forEach((section: { title: string, questions: Array<{ question: string, answer: string }> }) => {
          section.questions.forEach((qa: { question: string, answer: string }) => {
            rows.push([
              metadata['Child ID'] || 'Unknown',
              metadata['Child Name'] || 'Unknown',
              metadata['Created Date'] || 'Unknown',
              metadata['Form Version'] || 'Unknown',
              metadata['Filled Out By'] || 'Unknown',
              section.title || 'Unknown Section',
              qa.question || 'Unknown Question',
              qa.answer || ''
            ]);
          });
        });
      });
      
      // Create a worksheet from the rows
      const ws = XLSX.utils.aoa_to_sheet(rows);
      
      // Set column widths for better readability
      const colWidths = [
        { wch: 10 },  // Child ID
        { wch: 20 },  // Child Name
        { wch: 15 },  // Created Date
        { wch: 12 },  // Form Version
        { wch: 15 },  // Filled Out By
        { wch: 20 },  // Section
        { wch: 40 },  // Question
        { wch: 40 }   // Answer
      ];
      ws['!cols'] = colWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'FPR Records');
      
      // Use child name from the data if available, otherwise use a generic name
      const exportFileName = data.length > 0 && data[0].metadata &&
                            data[0].metadata['Child Name'] &&
                            data[0].metadata['Child Name'] !== 'Unknown' ?
                            `${data[0].metadata['Child Name'].replace(/[^\w]/g, '_')}_fpr_records.xlsx` :
                            `fpr_records.xlsx`;
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, exportFileName);
    } else {
      // Fall back to the original implementation for flat data
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `fpr_records.xlsx`);
    }
  }

  // Add export handler function
  async function handleExport(exportType: string) {
    const selectedIds = Array.from($selectedRecords);
    
    if (selectedIds.length === 0) {
      alert('Please select at least one record to export');
      return;
    }

    try {
      // For CSV and XLSX, get structured data with questions and answers
      if (exportType === "csv" || exportType === "xlsx") {
        const res = await fetch('/admin/data/export-fpr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ids: selectedIds,
            format: exportType 
          })
        });

        if (!res.ok) {
          alert('Failed to fetch export data');
          return;
        }

        const data = await res.json();
        
        if (exportType === "csv") {
          exportFullCSV(data);
        } else {
          exportFullXLSX(data);
        }
      } 
      // Handle PDF export - fetch binary data and download
      else if (exportType === "pdf") {
        // Create a download link for the PDF that will be returned
        const pdfDownloadLink = document.createElement('a');
        
        // Make request to the server for PDF generation
        const response = await fetch('/admin/data/export-fpr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ids: selectedIds,
            format: 'pdf'
          })
        });

        if (!response.ok) {
          alert('Failed to generate PDF');
          return;
        }

        // Get the binary data from the response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Get filename from Content-Disposition header if available
        let filename = 'fpr_records.pdf';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        // Set up download link and trigger click
        pdfDownloadLink.href = url;
        pdfDownloadLink.download = filename;
        pdfDownloadLink.click();
        
        // Clean up by revoking the object URL
        URL.revokeObjectURL(url);
      }
      
      // Close the export options dropdown after export
      exportOptions = false;
      
    } catch (error) {
      console.error("Export error:", error);
      alert('An error occurred during export');
    }
  }
</script>

<div class="pt-2 bg-[#F6F8FF]">
  <Header name={pageName} backButton/>

  <div class="flex justify-end gap-0 mt-32 pr-10 pl-10 relative bg-[#F6F8FF]">
    <!-- Button: Progress Report -->
    <button
      class="border rounded-3xl p-4 w-50 cursor-default bg-white font-bold shadow-md z-20 text-[#1A5A9E] whitespace-nowrap lg:w-72 lg:text-lg md:w-64 md:text-md sm:w-60 sm:text-sm"
    >
      <p class="text-center hidden sm:block">Family Progress Report</p>
      <p class="text-center sm:hidden">FPR</p>
    </button>
  </div>

  <div class="flex justify-center items-center mt-10 bg-[#F6F8FF]">
    <div class="relative bg-white border-grey mt-3 lg:w-300 md:w-175 sm:w-150 w-75 rounded-xl flex flex-col justify-left items-center shadow-2xl min-h-[400px] p-6">
      <div class="flex justify-between items-center w-full">
        <h1 class="text-2xl font-bold text-[#1A5A9E]">{childName} Progress Reports</h1>
        
        <!-- Desktop Action Buttons -->
        <div class="hidden md:flex items-center gap-6">
          <!-- Delete Button -->
          <button aria-label="Delete" on:click={() => showModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#1A5A9E" class="size-5">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Select Button -->
          <button class={`text-[#1A5A9E] font-bold text-lg cursor-pointer ${selectRecord ? 'text-[#808080] ' : 'text-[#1A5A9E]'}`} on:click={() => selectRecord = !selectRecord}>
            Select
          </button>
          
          <!-- Export Button with Dropdown -->
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
          
          <!-- Pagination Controls -->
          <div class="flex items-center gap-2">
            <span class="text-sm lg:text-lg md:text-md sm:text-sm whitespace-nowrap">
              {currentPage} of {totalPages}
            </span>
            <button 
              on:click={() => goToPage(currentPage - 1)} 
              aria-label="Previous Page" 
              disabled={currentPage <= 1}
              class="disabled:opacity-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                <path d="M7.825 11L20 11V13L7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11Z" fill="black"/>
              </svg>
            </button>
            <button 
              on:click={() => goToPage(currentPage + 1)} 
              aria-label="Next Page"
              disabled={currentPage >= totalPages}
              class="disabled:opacity-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                <path d="M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z" fill="black"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Action Buttons -->
        <div class="flex md:hidden items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-sm whitespace-nowrap">
              {currentPage} of {totalPages}
            </span>
            <button 
              on:click={() => goToPage(currentPage - 1)} 
              aria-label="Previous Page" 
              disabled={currentPage <= 1}
              class="disabled:opacity-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                <path d="M7.825 11L20 11V13L7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11Z" fill="black"/>
              </svg>
            </button>
            <button 
              on:click={() => goToPage(currentPage + 1)} 
              aria-label="Next Page"
              disabled={currentPage >= totalPages}
              class="disabled:opacity-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                <path d="M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z" fill="black"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Action Bar (Fixed at bottom of screen) -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg py-2 px-4 flex justify-center items-center gap-4 z-50">
        <!-- Delete Button -->
        <button aria-label="Delete" on:click={() => showModal = true}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#1A5A9E" class="size-5">
            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <!-- Select Button -->
        <button class={`text-[#1A5A9E] font-bold text-lg cursor-pointer ${selectRecord ? 'text-[#808080]' : 'text-[#1A5A9E]'}`} on:click={() => selectRecord = !selectRecord}>
          Select
        </button>
        
        <!-- Export Button with Dropdown -->
        <div class="flex flex-col relative">
          <button class="flex justify-center items-center bg-[#1A5A9E] text-white border-1 rounded-md p-1 px-2 gap-1 font-semibold cursor-pointer" on:click={() => exportOptions = !exportOptions} aria-label="Export Selected Records">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-0.75">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3469 4.5C19.7731 4.5 20.6771 6.029 19.9898 7.2786L13.6425 18.8192C12.9302 20.1144 11.0691 20.1144 10.3567 18.8192L4.00939 7.2786C3.32211 6.029 4.22617 4.5 5.6523 4.5L18.3469 4.5Z" fill="white"/>
            </svg>
            <span>Export</span>
          </button>
          {#if exportOptions}
            <div class="absolute bottom-10 z-999">
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
      
      <!-- Delete Confirmation Modal -->
      <Confirm
        bind:show={showModal}
        ids={Array.from($selectedRecords)}
        onConfirmAction={confirmDeleteAction}
        deleteMessage="Are you sure you want to delete the selected records?"
      />
      
      <!-- Add this near the Confirm component -->
      {#if showDeleteInProgress}
        <div class="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[1000]">
          <div class="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <svg class="animate-spin h-8 w-8 text-[#1A5A9E] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Deleting records...</p>
          </div>
        </div>
      {/if}

      <!-- Records Display -->
      <div class="w-full mt-6 pb-16 md:pb-0">
        <Year years={yearsAsStrings} recordsByYear={recordsByYearStrings} childId={childIdStr} {selectRecord} />
      </div>
    </div>
  </div>
</div>