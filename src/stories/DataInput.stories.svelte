<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DataInput from './DataInput.svelte';
  import { fn } from '@storybook/test';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Components/DataInput',
    component: DataInput,
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text' },
        value: { control: 'text' },
        name: { control: 'text' },
        placeholder: { control: 'text' },
        required: { control: 'boolean' },
        type: { control: 'text' },
        options: {
            control: 'object',
            description: 'Array of options with label and value',
        },    },
  });
</script>


<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Default"
  args={{
    label: '',
    value: '',
    name: '',
    placeholder: '',
    required: true,
    type: '',
    options: [
      { label: 'Healthy', value: 'healthy' },
      { label: 'Unhealthy', value: 'unhealthy' },
    ]
  }}
/>



