import type { PageServerLoad } from './$types';
import { getSiteContent } from '#lib/server/content.js';

export const load: PageServerLoad = async () => {
	const content = await getSiteContent();
	return { content };
};
