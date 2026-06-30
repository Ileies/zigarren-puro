import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { siteContentTable } from '$lib/server/db/schema';
import { getSiteContent, contentDefaults } from '$lib/server/content';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_IMAGES_DIR = join(
	process.cwd(),
	process.env.NODE_ENV === 'production' ? 'client' : 'static',
	'content-images'
);

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

async function upsertContent(key: string, value: string) {
	await db
		.insert(siteContentTable)
		.values({ key, value })
		.onConflictDoUpdate({ target: siteContentTable.key, set: { value } });
}

export const load: PageServerLoad = async () => {
	const content = await getSiteContent();
	return { content, defaults: contentDefaults };
};

export const actions: Actions = {
	updateHero: async ({ request }) => {
		const data = await request.formData();

		const subtitle = (data.get('hero_subtitle') as string)?.trim();
		const tagline = (data.get('hero_tagline') as string)?.trim();
		const ctaText = (data.get('hero_cta_text') as string)?.trim();
		const ctaLink = (data.get('hero_cta_link') as string)?.trim();

		if (!subtitle || !tagline || !ctaText || !ctaLink) {
			return { error: 'Alle Felder sind erforderlich' };
		}

		await Promise.all([
			upsertContent('hero_subtitle', subtitle),
			upsertContent('hero_tagline', tagline),
			upsertContent('hero_cta_text', ctaText),
			upsertContent('hero_cta_link', ctaLink)
		]);

		return { heroSuccess: true };
	},

	uploadHeroImage: async ({ request }) => {
		const data = await request.formData();
		const file = data.get('hero_image') as File;

		if (!file || file.size === 0) return { error: 'Keine Datei ausgewählt' };
		if (!ALLOWED_MIME.includes(file.type)) return { error: 'Nur JPG, PNG und WebP erlaubt' };
		if (file.size > MAX_SIZE) return { error: 'Datei zu groß (max. 5 MB)' };

		const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
		const filename = `hero-bg.${ext}`;

		await mkdir(CONTENT_IMAGES_DIR, { recursive: true });
		await writeFile(join(CONTENT_IMAGES_DIR, filename), Buffer.from(await file.arrayBuffer()));

		await upsertContent('hero_bg_image', `/content-images/${filename}`);

		return { imageSuccess: true };
	},

	updateSocial: async ({ request }) => {
		const data = await request.formData();

		const facebook = (data.get('social_facebook') as string)?.trim();
		const instagram = (data.get('social_instagram') as string)?.trim();

		if (!facebook || !instagram) {
			return { error: 'Alle Felder sind erforderlich' };
		}

		await Promise.all([
			upsertContent('social_facebook', facebook),
			upsertContent('social_instagram', instagram)
		]);

		return { socialSuccess: true };
	}
};
