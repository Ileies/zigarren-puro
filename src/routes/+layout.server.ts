import type { LayoutServerLoad } from './$types';
import { getCartCount } from '$lib/server/cart';

export const load: LayoutServerLoad = ({ locals, cookies }) => {
	return { dbOffline: locals.dbOffline, user: locals.user, cartCount: getCartCount(cookies) };
};
