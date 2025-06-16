<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CheckBoxGroup from './CheckBoxGroup.svelte';
  import { fn } from '@storybook/test';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Components/CheckBoxGroup',
    component: CheckBoxGroup,
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text' },
      name: { control: 'text' },
      value: { control: 'text' },
      options: {
        control: 'object',
        description: 'Array of options with label and value',
      },
      required: { control: 'boolean' },
    },
  });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Default"
  args={{
    label: 'Select Status',
    name: 'status',
    value: '',
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ]
  }}
/>




