<script lang="ts">

  export let show = false;
  export let ids: unknown[] = [];
  export let deleteMessage: string;
  export let onConfirmAction: (ids: unknown[]) => Promise<void>;
  export let onCancel: () => void = () => {};

  const handleConfirm = async () => {
    try {
      await onConfirmAction(ids);
      show = false;
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Something went wrong.");
    }
  };

  const handleCancel = () => {
    onCancel();
    show = false;
  };
</script>
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
