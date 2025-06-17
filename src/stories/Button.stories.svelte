<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
<<<<<<< HEAD
  import { fn } from 'storybook/test';
=======
  import { fn } from '@storybook/test';
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Example/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
      backgroundColor: { control: 'color' },
      size: {
        control: { type: 'select' },
        options: ['small', 'medium', 'large'],
      },
    },
    args: {
<<<<<<< HEAD
      onclick: fn(),
=======
      onClick: fn(),
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed
    }
  });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Primary" args={{ primary: true, label: 'Button' }} />

<Story name="Secondary" args={{ label: 'Button' }} />

<Story name="Large" args={{ size: 'large', label: 'Button' }} />

<Story name="Small" args={{ size: 'small', label: 'Button' }} />
