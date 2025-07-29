<script lang="ts">

  export let show = false;
  export let onConfirmAction: (newPassword: string, repeatNewPassword: string) => Promise<void>;
  export let onCancel: () => void = () => {};

  let newPassword: string;
  let repeatNewPassword: string;

  const handleConfirm = async () => {
    try {
      await onConfirmAction(newPassword, repeatNewPassword);
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
    <div class="flex flex-col gap-2 bg-white rounded-xl p-12 w-full max-w-sm shadow-lg">
      <label class="mb-4">
            <strong>New Password:</strong>
                <input
                type="password"
                class="border rounded-xl px-2 py-1 ml-4 w-64"
                bind:value={newPassword}
                placeholder="Enter new password..."
                />
      </label>
      <label class="mb-4">
            <strong>Repeat New Password:</strong>
                <input
                type="password"
                class="border rounded-xl px-2 py-1 ml-4 w-64"
                bind:value={repeatNewPassword}
                placeholder="Enter new password again..."
                />
      </label>
      <div class="flex justify-end space-x-3 mt-4">
        <button
          on:click={handleCancel}
          class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
          aria-label= "Cancel Delete"
        >
          Cancel
        </button>
        <button
          on:click={handleConfirm}
          class="px-4 py-2 bg-[#9ABDDC] hover:bg-[#1A5A9E] rounded-lg"
          aria-label= "Confirm Delete"
        >
          Save Password
        </button>
      </div>
    </div>
  </div>
{/if}
