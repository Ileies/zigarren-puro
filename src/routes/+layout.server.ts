import type { LayoutServerLoad } from './$types';
import { getCartCount } from '$lib/server/cart';

export const load: LayoutServerLoad = ({ locals, cookies }) => {
	const showWelcome = cookies.get('show_welcome') === '1';
	if (showWelcome) {
		cookies.delete('show_welcome', { path: '/' });
	}
	return {
		dbOffline: locals.dbOffline,
		user: locals.user,
		cartCount: getCartCount(cookies),
		showWelcome
	};
};
