<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SCInformation from './SCInformation.svelte';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Sections/SCChildInformation',
    component: SCInformation,
    tags: ['autodocs'],
    argTypes: {
      sectionTitle: { control: "text" }
    },
  });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default"/>
