<<<<<<< HEAD
import adapter from '@sveltejs/adapter-auto';

const config = { kit: { adapter: adapter() } };

export default config;

=======
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() }
};

export default config;
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed
