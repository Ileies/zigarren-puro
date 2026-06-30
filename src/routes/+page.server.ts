import type { PageServerLoad } from './$types';
import { getSiteContent } from '$lib/server/content';

export const load: PageServerLoad = async () => {
	const content = await getSiteContent();
	return { content };
};
