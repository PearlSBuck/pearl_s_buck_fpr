<script lang="ts">

/*
Variable Definitions:
show = boolean to control visibility of the confirmation dialog
ids = array of IDs to be deleted
deleteMessage = message to display in the confirmation dialog
onConfirmAction = function to call when the user confirms the deletion
onCancel = function to call when the user cancels the deletion
*/
  export let show = false;
  export let ids: unknown[] = [];
  export let deleteMessage: string;
  export let onConfirmAction: (ids: unknown[]) => Promise<void>;
  export let onCancel: () => void = () => {};

  // function to handle the confirmation action
  const handleConfirm = async () => {
    try {
      await onConfirmAction(ids);
      show = false;
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Something went wrong.");
    }
  };
  // function to handle the cancellation of the dialog
  const handleCancel = () => {
    onCancel();
    show = false;
  };
</script>
<!-- Confirmation Dialog Component -->
{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
    <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
      <h2 class="text-lg font-semibold mb-4">{deleteMessage}</h2>
      <div class="flex justify-end space-x-3">
        <button
          on:click={handleCancel}
          class="px-4 py-2 bg-[#9ABDDC] hover:bg-[#1A5A9E] rounded-lg"
          aria-label= "Cancel Delete"
        >
          Cancel
        </button>
        <button
          on:click={handleConfirm}
          class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
          aria-label= "Confirm Delete"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
{/if}
