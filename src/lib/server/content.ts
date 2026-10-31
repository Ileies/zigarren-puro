import db from '#lib/server/db/index.js';
import { siteContentTable } from '#lib/server/db/schema/index.js';

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

/** Saves several content entries together, so a form is stored completely or not at all. */
export function saveContent(entries: Record<string, string>) {
	db.transaction((tx) => {
		for (const [key, value] of Object.entries(entries)) {
			tx.insert(siteContentTable)
				.values({ key, value })
				.onConflictDoUpdate({ target: siteContentTable.key, set: { value } })
				.run();
		}
	});
}

// ─── Admin forms ─────────────────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 300;

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const field = (data: FormData, key: string) => data.get(key)?.toString().trim() ?? '';

/** A link on this site ("/shop") or an http(s) address. Rejects "javascript:" and "//host". */
export function isSafeLink(link: string) {
	if (link.startsWith('/')) return !link.startsWith('//') && !link.includes('\\');
	try {
		const { protocol } = new URL(link);
		return protocol === 'https:' || protocol === 'http:';
	} catch {
		return false;
	}
}

export function parseHeroForm(data: FormData): ParseResult<{
	hero_subtitle: string;
	hero_tagline: string;
	hero_cta_text: string;
	hero_cta_link: string;
}> {
	const value = {
		hero_subtitle: field(data, 'hero_subtitle'),
		hero_tagline: field(data, 'hero_tagline'),
		hero_cta_text: field(data, 'hero_cta_text'),
		hero_cta_link: field(data, 'hero_cta_link')
	};

	if (Object.values(value).some((v) => !v))
		return { ok: false, error: 'Alle Felder sind erforderlich' };
	if (Object.values(value).some((v) => v.length > MAX_TEXT_LENGTH)) {
		return { ok: false, error: `Maximal ${MAX_TEXT_LENGTH} Zeichen pro Feld` };
	}
	if (!isSafeLink(value.hero_cta_link)) {
		return { ok: false, error: 'Der Link muss mit / beginnen oder eine http(s)-Adresse sein' };
	}
	return { ok: true, value };
}

export function parseSocialForm(
	data: FormData
): ParseResult<{ social_facebook: string; social_instagram: string }> {
	const value = {
		social_facebook: field(data, 'social_facebook'),
		social_instagram: field(data, 'social_instagram')
	};

	if (!value.social_facebook || !value.social_instagram) {
		return { ok: false, error: 'Alle Felder sind erforderlich' };
	}
	const external = (link: string) => isSafeLink(link) && !link.startsWith('/');
	if (!external(value.social_facebook) || !external(value.social_instagram)) {
		return { ok: false, error: 'Die Links müssen vollständige http(s)-Adressen sein' };
	}
	return { ok: true, value };
}
