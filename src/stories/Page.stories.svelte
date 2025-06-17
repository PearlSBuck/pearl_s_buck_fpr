<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
<<<<<<< HEAD
  import { expect, userEvent, waitFor, within } from 'storybook/test';
  import Page from './Page.svelte';
  import { fn } from 'storybook/test';
=======
  import { expect, userEvent, waitFor, within } from '@storybook/test';
  import Page from './Page.svelte';
  import { fn } from '@storybook/test';
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Example/Page',
    component: Page,
    parameters: {
      // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
      layout: 'fullscreen',
    },
  });
</script>

<Story name="Logged In" play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole('button', { name: /Log in/i });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    await waitFor(() => expect(loginButton).not.toBeInTheDocument());

    const logoutButton = canvas.getByRole('button', { name: /Log out/i });
    await expect(logoutButton).toBeInTheDocument();
  }}
<<<<<<< HEAD
  />
=======
/>
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed

<Story name="Logged Out" />
