<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FPRForm from './FPRForm.svelte';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Forms/FPR',
    component: FPRForm,
    tags: ['autodocs'],
    argTypes: {
      formTitle: { control: "text" }
    },
  });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default"/>
