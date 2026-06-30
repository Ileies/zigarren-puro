import db from '$lib/server/db';
import { siteContentTable } from '$lib/server/db/schema';

export const contentDefaults: Record<string, string> = {
	hero_bg_image: '/gallery/cohiba-linea.png',
	hero_subtitle: 'Premium · Since 2024',
	hero_tagline: 'Exklusive Zigarren und Spirituosen aus aller Welt - für wahre Kenner.',
	hero_cta_text: 'Shop besuchen',
	hero_cta_link: '/shop',
	social_facebook: 'https://www.facebook.com/profile.php?id=100094063374349',
	social_instagram: 'https://www.instagram.com/zigarrenpuro'
};

export async function getSiteContent(): Promise<Record<string, string>> {
	const rows = await db.select().from(siteContentTable);
	const content = { ...contentDefaults };
	for (const row of rows) {
		content[row.key] = row.value;
	}
	return content;
}
