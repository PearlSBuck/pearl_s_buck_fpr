<script lang="ts">
    import Dropzone from 'svelte-file-dropzone';
    interface Props {
        sectionTitle: string;
    }
    const { sectionTitle }: Props = $props();

    type FileRejection = {
        file: File;
        errors: { code: string; message: string }[];
    };

    type DropEventDetail = {
        acceptedFiles: File[];
        fileRejections: FileRejection[];
    };

    let files: {
        accepted: File[];
        rejected: FileRejection[];
    } = {
        accepted: [],
        rejected: [],
    };

    function handleFilesSelect(e: CustomEvent<DropEventDetail>) {
        const { acceptedFiles, fileRejections } = e.detail;
        files.accepted = [...files.accepted, ...acceptedFiles];
        files.rejected = [...files.rejected, ...fileRejections];
    }

    function handleRemoveFile(_e: Event, index: number) {
        files.accepted.splice(index, 1);
        files.accepted = [...files.accepted]; // trigger reactivity
    }

    function handleRemoveAll() {
        files.accepted = [];
    }
</script>

<div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 mb-4 center place-self-center">
  <div class="text-3xl font-bold pb-4">{sectionTitle}</div>

  <Dropzone on:drop={handleFilesSelect} accept={["image/*"]} containerClasses="custom-dropzone">
  <button>Choose images to upload</button>

  <p>or</p>
  <p>Drag and drop them here</p>
  </Dropzone>
  <div style="margin: 5px;">
    {#if files.accepted.length > 0}
      <button onclick={handleRemoveAll}>RemoveAll</button>
    {/if}
    {#each files.accepted as item, index}
    <div>
      <span>{item.name}</span>
      <button onclick={(e) => handleRemoveFile(e, index)}>Remove</button>
      </div>
    {/each}
  </div>

  <style>
  :global(.custom-dropzone) {
  }
  </style>
</div>
