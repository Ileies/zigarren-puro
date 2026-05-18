import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { i18nPlugin } from './src/lib/i18n-plugin';

export default defineConfig({
	plugins: [tailwindcss(), i18nPlugin(), sveltekit(), devtoolsJson()]
});
