import type { PageServerLoad, Actions } from './$types';
import {
	contentDefaults,
	getSiteContent,
	parseHeroForm,
	parseSocialForm,
	saveContent
} from '#lib/server/content.js';
import { replaceImage } from '#lib/server/uploads.js';

const MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024;

export const load: PageServerLoad = async () => {
	const content = await getSiteContent();
	return { content, defaults: contentDefaults };
};

export const actions: Actions = {
	updateHero: async ({ request }) => {
		const input = parseHeroForm(await request.formData());
		if (!input.ok) return { error: input.error };

		saveContent(input.value);
		return { heroSuccess: true };
	},

	uploadHeroImage: async ({ request }) => {
		const data = await request.formData();

		const result = await replaceImage({
			folder: 'content-images',
			name: 'hero-bg',
			file: data.get('hero_image'),
			maxBytes: MAX_HERO_IMAGE_BYTES,
			save: (url) => saveContent({ hero_bg_image: url })
		});
		if (!result.ok) return { error: result.error };

		return { imageSuccess: true };
	},

	updateSocial: async ({ request }) => {
		const input = parseSocialForm(await request.formData());
		if (!input.ok) return { error: input.error };

		saveContent(input.value);
		return { socialSuccess: true };
	}
};
