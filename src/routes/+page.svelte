<!-- +page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  export let data;
  export let form;
  
  let forms = [
    {
      id: 1
      // You can add more fields here if needed
    }
  ];

  /** @type {Record<string, any> | null} */
  let selectedForm = null;
  let showModal = false;
  let showDeleteConfirm = false;
  /** @type {Record<string, any> | null} */
  let formToDelete = null;

  function addForm() {
    forms = [
      ...forms,
      { id: forms.length + 1 }
    ];
  }

  /**
   * @param {any} savedForm
   */
  function viewForm(savedForm) {
    selectedForm = savedForm;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedForm = null;
  }

  /**
   * @param {any} savedForm
   */
  /**
   * @param {any} savedForm
   * @param {Event} event
   */
  function confirmDelete(savedForm, event) {
  console.log('confirmDelete called with:', savedForm); // Add this
  event.stopPropagation();
  formToDelete = savedForm;
  showDeleteConfirm = true;
  console.log('formToDelete set to:', formToDelete); // Add this
}

  function cancelDelete() {
    showDeleteConfirm = false;
    formToDelete = null;
  }

  /**
   * @param {Event} event
   */
  function stopClick(event) {
    event.stopPropagation();
  }

  /**
   * Handle keyboard events for interactive elements
   * @param {KeyboardEvent} event
   * @param {Function} callback
   */
  function handleKeyDown(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  /**
   * Handle keyboard events with saved form parameter
   * @param {KeyboardEvent} event
   * @param {any} savedForm
   */
  function handleFormKeyDown(event, savedForm) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      viewForm(savedForm);
    }
  }

   /**
 * Delete form after confirmation - Reactive version
 * @param {any} formToDelete
 */
async function handleDeleteForm(formToDelete) {
  console.log('Attempting to delete form:', formToDelete);
  console.log('Form ID being sent:', formToDelete.id);
  
  const formData = new FormData();
  formData.append('form_id', formToDelete.id);
  
  try {
    console.log('Making delete request...');
    const response = await fetch('?/deleteForm', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const result = await response.text();
    console.log('Response text:', result);
    
    if (response.ok) {
      console.log('Delete successful, updating UI...');
      
      // Store the ID before clearing formToDelete
      const deletedFormId = formToDelete.id;
      
      // Close the confirmation modal
      showDeleteConfirm = false;
      formToDelete = null;
      
      // Update the forms list reactively instead of reloading
      data.forms = data.forms.filter(form => form.id !== deletedFormId);
      
      console.log('Forms list updated, remaining forms:', data.forms.length);
      
    } else {
      console.error('Delete failed with status:', response.status);
      console.error('Response body:', result);
      alert(`Failed to delete form. Status: ${response.status}. Please try again.`);
    }
  } catch (error) {
    console.error('Error deleting form:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    alert('An error occurred while deleting the form. Please try again.');
  }
}
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  :root {
    --primary-blue: #2B5AAE;
    --section-blue: #2563EB;
    --dark-blue: #1E40AF;
    --medium-gray: #6B7280;
    --light-gray: #F3F4F6;
    --border-gray: #E5E7EB;
    --green-accent: #10B981;
  }
  
  .logo-icon {
    background: linear-gradient(135deg, #2B5AAE 0%, #10B981 100%);
  }
  
  .form-section {
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .form-section:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  
  .field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .health-status label, .vaccine-status label {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .health-status label:hover, .vaccine-status label:hover {
    background-color: #EFF6FF;
  }
  
  .collapsible-section {
    transition: all 0.3s ease;
  }
  
  .collapsible-section:hover {
    background-color: #F0FDF4;
  }
  
  .collapsible-section:focus {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }
  
  .create-btn::after {
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid white;
    margin-left: 8px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #E1EFFE;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #DBEAFE;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .section-actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .delete-btn:hover {
    color: #EF4444;
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .form-counter {
    background-color: var(--primary-blue);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .success {
    color: #10B981;
    background-color: #ECFDF5;
    border: 1px solid #A7F3D0;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .error {
    color: #EF4444;
    background-color: #FEF2F2;
    border: 1px solid #FECACA;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 0.75rem;
    max-width: 4xl;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    background-color: #E1EFFE;
    padding: 1.5rem;
    border-bottom: 1px solid #DBEAFE;
    border-radius: 0.75rem 0.75rem 0 0;
  }

  .response-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .response-field {
    background-color: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .response-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .response-value {
    color: #1F2937;
    font-size: 1rem;
  }

  .saved-form-card {
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
  }

  .saved-form-card:hover {
    background-color: #F9FAFB;
    border-color: #3B82F6;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .saved-form-card:focus {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }

  .interactive-element {
    cursor: pointer;
  }

  .interactive-element:focus {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }

  .delete-form-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: white;
    border: 1px solid #E5E7EB;
    border-radius: 0.375rem;
    padding: 0.5rem;
    color: #6B7280;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .delete-form-btn:hover {
    background-color: #FEF2F2;
    color: #EF4444;
    border-color: #FECACA;
  }

  .delete-form-btn:focus {
    outline: 2px solid #EF4444;
    outline-offset: 2px;
  }

  .confirmation-modal {
    background: white;
    border-radius: 0.75rem;
    max-width: 28rem;
    width: 90%;
    padding: 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .confirmation-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .btn-danger {
    background-color: #EF4444;
    color: white;
    border: 1px solid #EF4444;
  }

  .btn-danger:hover {
    background-color: #DC2626;
    border-color: #DC2626;
  }

  .btn-secondary {
    background-color: white;
    color: #374151;
    border: 1px solid #D1D5DB;
  }

  .btn-secondary:hover {
    background-color: #F9FAFB;
    border-color: #9CA3AF;
  }
</style>

<!-- Header Section -->
<header class="bg-white py-4 px-6 border-b border-gray-200">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <!-- Logo -->
    <div class="flex items-center">
      <div class="logo-icon w-10 h-10 rounded-lg flex items-center justify-center">
        <div class="flex">
          <div class="w-2 h-2 rounded-full bg-white mx-0.5"></div>
          <div class="w-2 h-2 rounded-full bg-white mx-0.5"></div>
          <div class="w-2 h-2 rounded-full bg-white mx-0.5"></div>
        </div>
      </div>
    </div>
    
    <!-- Organization Name -->
    <div class="text-center">
      <h1 class="text-xl font-bold text-gray-900">Pearl S. Buck Foundation Philippines, Inc.</h1>
    </div>
    
    <!-- User Icon -->
    <button class="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center" aria-label="User profile">
      <i class="fas fa-user text-white text-sm"></i>
    </button>
  </div>
</header>

<!-- Main Content -->
<main class="max-w-7xl mx-auto px-4 py-8">
  
  <!-- Success/Error Messages -->
  {#if form?.success && !form?.deleted}
    <div class="success">
      Form created successfully!
    </div>
  {/if}

  {#if form?.success && form?.deleted}
    <div class="success">
      Form deleted successfully!
    </div>
  {/if}
  
  {#if form?.error}
    <div class="error">
      {form.error}
    </div>
  {/if}

  <!-- Form Management Bar -->
  <form method="POST" action="?/createForm" use:enhance>
    <div class="bg-white rounded-lg p-6 mb-8 border border-gray-200">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label for="form-type" class="block text-sm font-medium text-gray-700 mb-1">Form Type:</label>
            <select id="form-type" name="form_type" class="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select</option>
              <option value="Child Sponsorship Form">Child Sponsorship Form</option>
              <option value="Family Information Form">Family Information Form</option>
              <option value="Health Assessment Form">Health Assessment Form</option>
              <option value="Education Progress Form">Education Progress Form</option>
            </select>
          </div>
          
          <div>
            <label for="version" class="block text-sm font-medium text-gray-700 mb-1">Version:</label>
            <input id="version" name="version" type="text" class="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="1.0.0">
          </div>
        </div>
        
        <div class="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
          <button
            type="submit"
            class="create-btn bg-blue-800 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center hover:bg-blue-900 transition-colors"
          >
            Create
          </button>
          <button type="button" class="bg-blue-800 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Container for form sections -->
    <div id="form-sections-container">
      {#each forms as formItem, i (formItem.id)}
        <div class="form-section bg-white rounded-lg overflow-hidden mb-8 fade-in">
          <!-- Section Header -->
          <div class="section-header">
            <div class="section-title">
              <div class="form-counter">{i + 1}</div>
              <h2 class="text-lg font-semibold text-blue-700">
                Sponsored Child Information
              </h2>
            </div>
            <div class="section-actions">
              <button type="button" class="text-blue-500 hover:text-blue-700" aria-label="Edit section">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button type="button" class="text-gray-500 hover:text-red-500 delete-btn" aria-label="Delete section">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="p-6">
            <div class="field-grid">
              <!-- Row 1 -->
              <div>
                <label for="assigned-date-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">Assigned Date</label>
                <input id="assigned-date-{formItem.id}" name="assigned_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label for="sponsor-name-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">Sponsor Name</label>
                <input id="sponsor-name-{formItem.id}" name="sponsor_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label for="sponsor-number-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">SN (Sponsor Number)</label>
                <input id="sponsor-number-{formItem.id}" name="sponsor_number" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Row 2 -->
              <div>
                <label for="child-name-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">SC Name (Sponsored Child Name)</label>
                <input id="child-name-{formItem.id}" name="child_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label for="child-number-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">SCN (Sponsored Child Number)</label>
                <input id="child-number-{formItem.id}" name="child_number" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label for="birthday-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                <input id="birthday-{formItem.id}" name="birthday" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Row 3 -->
              <div>
                <label for="height-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input id="height-{formItem.id}" name="height" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label for="weight-{formItem.id}" class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input id="weight-{formItem.id}" name="weight" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Health Status -->
              <div>
                <fieldset>
                  <legend class="block text-sm font-medium text-gray-700 mb-1">Health Status</legend>
                  <div class="health-status space-y-2 mt-1">
                    <label>
                      <input type="radio" name="health_status" class="h-4 w-4 text-blue-600 focus:ring-blue-500" value="healthy">
                      <span class="ml-2 text-gray-700">Healthy</span>
                    </label>
                    <label>
                      <input type="radio" name="health_status" class="h-4 w-4 text-blue-600 focus:ring-blue-500" value="unhealthy">
                      <span class="ml-2 text-gray-700">Unhealthy</span>
                    </label>
                  </div>
                </fieldset>
              </div>
              
              <!-- Vaccine Status -->
              <div>
                <fieldset>
                  <legend class="block text-sm font-medium text-gray-700 mb-1">COVID Vaccine Shot</legend>
                  <div class="vaccine-status space-y-2 mt-1">
                    <label>
                      <input type="radio" name="vaccine_status" class="h-4 w-4 text-blue-600 focus:ring-blue-500" value="complete">
                      <span class="ml-2 text-gray-700">Complete Dose</span>
                    </label>
                    <label>
                      <input type="radio" name="vaccine_status" class="h-4 w-4 text-blue-600 focus:ring-blue-500" value="one-dose">
                      <span class="ml-2 text-gray-700">One Dose</span>
                    </label>
                    <label>
                      <input type="radio" name="vaccine_status" class="h-4 w-4 text-blue-600 focus:ring-blue-500" value="none">
                      <span class="ml-2 text-gray-700">None</span>
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </form>

  <!-- Saved Forms Display -->
  {#if data.forms.length > 0}
    <div class="mt-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Saved Forms</h2>
      <div class="grid gap-4">
        {#each data.forms as savedForm}
          <div class="saved-form-card bg-white border border-gray-200 rounded-lg p-4 relative">
            <!-- Delete Button -->
            <button 
  class="delete-form-btn"
  onclick={(e) => confirmDelete(savedForm, e)}
  onkeydown={(e) => handleKeyDown(e, () => confirmDelete(savedForm, e))}
  tabindex="0"
  aria-label="Delete form: {savedForm.form_type || 'Untitled Form'}"
  type="button"
>
              <i class="fas fa-trash-alt text-sm"></i>
            </button>

            <!-- Form Card Content -->
            <button 
              class="text-left w-full interactive-element"
              onclick={() => viewForm(savedForm)}
              onkeydown={(e) => handleFormKeyDown(e, savedForm)}
              tabindex="0"
              aria-label="View form: {savedForm.form_type || 'Untitled Form'}"
              type="button"
            >
              <div class="flex justify-between items-start pr-12">
                <div>
                  <h3 class="font-medium text-gray-900">{savedForm.form_type || 'Untitled Form'}</h3>
                  <p class="text-sm text-gray-500">Version: {savedForm.version || 'N/A'}</p>
                  {#if savedForm.child_name}
                    <p class="text-sm text-gray-600">Child: {savedForm.child_name}</p>
                  {/if}
                  {#if savedForm.sponsor_name}
                    <p class="text-sm text-gray-600">Sponsor: {savedForm.sponsor_name}</p>
                  {/if}
                </div>
                <div class="flex flex-col items-end">
                  <div class="text-sm text-gray-500">
                    {new Date(savedForm.created_at).toLocaleDateString()}
                  </div>
                  <div class="text-xs text-blue-600 mt-1">Click to view</div>
                </div>
              </div>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Additional Components -->
  <div class="space-y-4 mt-8">
    <!-- Collapsible Section - Add Header -->
    <button 
      class="collapsible-section bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between w-full interactive-element"
      tabindex="0"
      aria-label="Add Header"
      onkeydown={(e) => handleKeyDown(e, () => console.log('Add Header clicked'))}
      type="button"
    >
      <div class="flex items-center">
        <i class="fas fa-plus-circle text-green-500 mr-3"></i>
        <span class="font-medium text-gray-700">Add Header</span>
      </div>
      <i class="fas fa-chevron-down text-gray-500"></i>
    </button>
    
    <!-- Collapsible Section - Add Question -->
    <button 
      class="collapsible-section bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between w-full interactive-element"
      tabindex="0"
      aria-label="Add Question"
      onkeydown={(e) => handleKeyDown(e, () => console.log('Add Question clicked'))}
      type="button"
    >
      <div class="flex items-center">
        <i class="fas fa-plus-circle text-green-500 mr-3"></i>
        <span class="font-medium text-gray-700">Add Question</span>
      </div>
      <i class="fas fa-chevron-down text-gray-500"></i>
    </button>
  </div>
  
  <!-- Add Section Button -->
  <div class="mt-8 flex justify-end">
    <button type="button" onclick={addForm} class="bg-blue-800 text-white px-5 py-2.5 rounded-md font-medium hover:bg-blue-900 transition-colors flex items-center">
      <i class="fas fa-plus mr-2"></i> Add Section
    </button>
  </div>
</main>

<!-- Footer -->
<footer class="bg-white border-t border-gray-200 mt-12 py-6">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center mb-4 md:mb-0">
        <div class="logo-icon w-8 h-8 rounded-lg flex items-center justify-center mr-3">
          <div class="flex">
            <div class="w-1.5 h-1.5 rounded-full bg-white mx-0.5"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-white mx-0.5"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-white mx-0.5"></div>
          </div>
        </div>
        <span class="font-medium text-gray-700">Pearl S. Buck Foundation Philippines, Inc.</span>
      </div>
      <div class="text-gray-500 text-sm">
        © 2023 Pearl S. Buck Foundation. All rights reserved.
      </div>
    </div>
  </div>
</footer>

<!-- Modal for viewing form responses -->
{#if showModal && selectedForm}
  <div 
    class="modal-overlay" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div class="modal-content" role="document">
      <div class="modal-header">
        <div class="flex justify-between items-center">
          <div>
            <h2 id="modal-title" class="text-2xl font-bold text-blue-700">Form Response</h2>
            <p id="modal-description" class="text-sm text-blue-600 mt-1">
              {selectedForm.form_type || 'Untitled Form'} - Version {selectedForm.version || 'N/A'}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Created: {new Date(selectedForm.created_at).toLocaleString()}
            </p>
          </div>
          <button 
            class="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded" 
            onclick={closeModal}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
      
      <div class="response-grid">
        <!-- Form Type & Version -->
        <div class="response-field">
          <div class="response-label">Form Type</div>
          <div class="response-value">{selectedForm.form_type || 'Not specified'}</div>
        </div>
        
        <div class="response-field">
          <div class="response-label">Version</div>
          <div class="response-value">{selectedForm.version || 'Not specified'}</div>
        </div>
        
        <!-- Assigned Date -->
        <div class="response-field">
          <div class="response-label">Assigned Date</div>
          <div class="response-value">
            {selectedForm.assigned_date ? new Date(selectedForm.assigned_date).toLocaleDateString() : 'Not provided'}
          </div>
        </div>
        
       <!-- Sponsor Information -->
        <div class="response-field">
          <div class="response-label">Sponsor Name</div>
          <div class="response-value">{selectedForm.sponsor_name || 'Not provided'}</div>
        </div>
        
        <div class="response-field">
          <div class="response-label">Sponsor Number</div>
          <div class="response-value">{selectedForm.sponsor_number || 'Not provided'}</div>
        </div>
        
        <!-- Child Information -->
        <div class="response-field">
          <div class="response-label">Child Name</div>
          <div class="response-value">{selectedForm.child_name || 'Not provided'}</div>
        </div>
        
        <div class="response-field">
          <div class="response-label">Child Number</div>
          <div class="response-value">{selectedForm.child_number || 'Not provided'}</div>
        </div>
        
        <div class="response-field">
          <div class="response-label">Birthday</div>
          <div class="response-value">
            {selectedForm.birthday ? new Date(selectedForm.birthday).toLocaleDateString() : 'Not provided'}
          </div>
        </div>
        
        <!-- Physical Information -->
        <div class="response-field">
          <div class="response-label">Height</div>
          <div class="response-value">{selectedForm.height ? `${selectedForm.height} cm` : 'Not provided'}</div>
        </div>
        
        <div class="response-field">
          <div class="response-label">Weight</div>
          <div class="response-value">{selectedForm.weight ? `${selectedForm.weight} kg` : 'Not provided'}</div>
        </div>
        
        <!-- Health Information -->
        <div class="response-field">
          <div class="response-label">Health Status</div>
          <div class="response-value">
            {#if selectedForm.health_status}
              <span class="capitalize">{selectedForm.health_status}</span>
            {:else}
              Not provided
            {/if}
          </div>
        </div>
        
        <div class="response-field">
          <div class="response-label">COVID Vaccine Status</div>
          <div class="response-value">
            {#if selectedForm.vaccine_status}
              <span class="capitalize">
                {selectedForm.vaccine_status === 'complete' ? 'Complete Dose' : 
                 selectedForm.vaccine_status === 'one-dose' ? 'One Dose' : 
                 selectedForm.vaccine_status === 'none' ? 'None' : selectedForm.vaccine_status}
              </span>
            {:else}
              Not provided
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && formToDelete}
  <div 
    class="modal-overlay" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-modal-title"
  >
    <div class="confirmation-modal" role="document">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
        </div>
        
        <h3 id="delete-modal-title" class="text-lg font-medium text-gray-900 mb-2">
          Delete Form
        </h3>
        
        <p class="text-sm text-gray-500 mb-4">
          Are you sure you want to delete this form? This action cannot be undone.
        </p>
        
        <div class="bg-gray-50 rounded-lg p-3 mb-6">
          <p class="text-sm font-medium text-gray-700">
            {formToDelete.form_type || 'Untitled Form'}
          </p>
          {#if formToDelete.child_name}
            <p class="text-xs text-gray-500">Child: {formToDelete.child_name}</p>
          {/if}
          {#if formToDelete.sponsor_name}
            <p class="text-xs text-gray-500">Sponsor: {formToDelete.sponsor_name}</p>
          {/if}
        </div>
      </div>
      
      <div class="confirmation-buttons">
        <button 
          type="button"
          class="btn-secondary px-4 py-2 rounded-md font-medium transition-colors"
          onclick={cancelDelete}
        >
          Cancel
        </button>
        
        <button 
  type="button"
  class="btn-danger px-4 py-2 rounded-md font-medium transition-colors"
  onclick={() => {
    console.log('Delete button clicked, formToDelete:', formToDelete);
    handleDeleteForm(formToDelete);
  }}
>
  Delete Form
</button>
      </div>
    </div>
  </div>
{/if}

<!-- Overlay click handlers -->
<svelte:window 
  on:click={(e) => {
    if (
      showModal &&
      e.target &&
      (e.target instanceof HTMLElement) &&
      e.target.classList.contains('modal-overlay')
    ) {
      closeModal();
    }
    if (
      showDeleteConfirm &&
      e.target &&
      (e.target instanceof HTMLElement) &&
      e.target.classList.contains('modal-overlay')
    ) {
      cancelDelete();
    }
  }}
  on:keydown={(e) => {
    if (e.key === 'Escape') {
      if (showModal) {
        closeModal();
      }
      if (showDeleteConfirm) {
        cancelDelete();
      }
    }
  }}
/>
