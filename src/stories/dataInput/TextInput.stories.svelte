<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TextInput from './TextInput.svelte';
  import { fn } from '@storybook/test';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Components/TextInput',
    component: TextInput,
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text' },
      value: { control: 'text' },
      name: { control: 'text' },
      placeholder: { control: 'text' },
      required: { control: 'boolean' },
    },
  });
</script>


<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Default"
  args={{
    label: 'First Name',
    value: '',
    name: 'firstName',
    placeholder: 'Enter your first name',
    required: true
  }}
/>



