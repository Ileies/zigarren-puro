import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$db: './src/lib/server/db',
			$ui: './src/lib/client/components'
		}
	}
};

export default config;
