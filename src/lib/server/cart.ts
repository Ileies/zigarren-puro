import type { Cookies } from '@sveltejs/kit';

export type CartItem = { id: string; qty: number };

const CART_COOKIE = 'cart';
const MAX_QTY = 99;
const MAX_ITEMS = 50;

export function getCart(cookies: Cookies): CartItem[] {
	const raw = cookies.get(CART_COOKIE);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(i): i is CartItem => typeof i.id === 'string' && typeof i.qty === 'number' && i.qty > 0
		);
	} catch {
		return [];
	}
}

export function setCart(cookies: Cookies, items: CartItem[]): void {
	const valid = items.filter((i) => i.qty > 0).slice(0, MAX_ITEMS);
	if (valid.length === 0) {
		cookies.delete(CART_COOKIE, { path: '/' });
	} else {
		cookies.set(CART_COOKIE, Buffer.from(JSON.stringify(valid)).toString('base64'), {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
	}
}

export function addToCart(cookies: Cookies, productId: string, qty = 1): void {
	const cart = getCart(cookies);
	const existing = cart.find((i) => i.id === productId);
	if (existing) {
		existing.qty = Math.min(existing.qty + qty, MAX_QTY);
	} else {
		cart.push({ id: productId, qty });
	}
	setCart(cookies, cart);
}

export function removeFromCart(cookies: Cookies, productId: string): void {
	setCart(
		cookies,
		getCart(cookies).filter((i) => i.id !== productId)
	);
}

export function updateCartQty(cookies: Cookies, productId: string, qty: number): void {
	const cart = getCart(cookies);
	const item = cart.find((i) => i.id === productId);
	if (item) item.qty = Math.min(Math.max(1, qty), MAX_QTY);
	setCart(cookies, cart);
}

export function getCartCount(cookies: Cookies): number {
	return getCart(cookies).reduce((sum, i) => sum + i.qty, 0);
}
