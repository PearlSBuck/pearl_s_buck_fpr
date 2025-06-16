<!-- this file was solely made to test how svelte handles form data -->
<script lang="ts">
  import DataInput from './DataInput.svelte'; // adjust if needed
  export let sectionTitle: string = 'Form Testing';

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const result = Object.fromEntries(formData.entries());
    console.log(result);
    alert(`Assigned Date: ${result.assignedDate}\n
            Radio Answer: ${result.healthStatus}`);
  }
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
  <div class="text-3xl font-bold pb-4">{sectionTitle}</div>
  <form on:submit={handleSubmit}>
    <DataInput
      type="text"
      label="Assigned Date"
      name="assignedDate"
      placeholder="Enter date of tracking"
      required={true}
      value=""
    />
    <DataInput
        type = "radio"
        label="Health Status"
        name="healthStatus"
        value=""
        options= {[
            {
                "label": "Healthy",
                "value": "healthy"
            },
            {
                "label": "Unhealthy",
                "value": "unhealthy"
            }
        ]}
        required={true}
    />
    <DataInput
        type = "signature"
        label="Sponsored Child's Signature"
        name="signature"
        required={true}
        value=""
    />
    
    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
      Submit
    </button>
  </form>
</div>
