<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import OfflinePopUp from './OfflinePopup.svelte';

  const { Story } = defineMeta({
    title: 'Components/OfflinePopUp',
    component: OfflinePopUp,
    tags: ['autodocs'],
    argTypes: {
      message: { control: 'text' }
    }
  });
</script>

<Story
  name="Default"
  args={{ 
    message: 'You are currently offline'
  }}
/>

