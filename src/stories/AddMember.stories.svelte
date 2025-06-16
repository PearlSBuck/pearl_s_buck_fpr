<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AddMember from './AddMember.svelte';
  import { fn } from '@storybook/test';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Components/AddMember',
    component: AddMember,
    tags: ['autodocs'],
    argTypes: {
      familyMembers: { control: 'object' }
    },
  });
</script>


<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Default"
/>



