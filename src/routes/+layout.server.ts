import type { LayoutServerLoad } from './$types';
import { getCartCount } from '$lib/server/cart';
import { getSiteContent } from '$lib/server/content';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const showWelcome = cookies.get('show_welcome') === '1';
	if (showWelcome) {
		cookies.delete('show_welcome', { path: '/' });
	}
	const content = await getSiteContent();
	return {
		dbOffline: locals.dbOffline,
		user: locals.user,
		cartCount: getCartCount(cookies),
		showWelcome,
		socialFacebook: content.social_facebook,
		socialInstagram: content.social_instagram
	};
};
