<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PhotoUpload from './PhotoUpload.svelte'; // Update if the file name differs

  const { Story } = defineMeta({
    title: 'Components/PhotoUpload',
    component: PhotoUpload,
    tags: ['autodocs'],
    argTypes: {
      sectionTitle: { control: 'text' }
    }
  });
</script>

<Story
  name="Default"
  args={{
    sectionTitle: 'Upload Images'
  }}
/>
