import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import db from '$lib/server/db';
import { productTable, producerTable } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getCart, setCart, addToCart, removeFromCart, updateCartQty } from '$lib/server/cart';

export const load: PageServerLoad = async ({ cookies }) => {
	const cartItems = getCart(cookies);

	if (cartItems.length === 0) return { items: [] };

	const ids = cartItems.map((i) => i.id);
	const products = await db
		.select({
			id: productTable.id,
			name: productTable.name,
			price: productTable.price,
			stock: productTable.stock,
			sku: productTable.sku,
			productType: productTable.productType,
			producerName: producerTable.name
		})
		.from(productTable)
		.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
		.where(inArray(productTable.id, ids));

	const items = cartItems
		.map((cartItem) => {
			const product = products.find((p) => p.id === cartItem.id);
			if (!product) return null;
			return { ...product, qty: cartItem.qty };
		})
		.filter((i): i is NonNullable<typeof i> => i !== null);

	return { items };
};

export const actions: Actions = {
	add: async ({ request, cookies }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400);
		addToCart(cookies, id);
		return { success: true };
	},
	remove: async ({ request, cookies }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400);
		removeFromCart(cookies, id);
		return { success: true };
	},
	update: async ({ request, cookies }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const qty = parseInt(data.get('qty')?.toString() ?? '');
		if (!id || isNaN(qty)) return fail(400);
		if (qty <= 0) {
			removeFromCart(cookies, id);
		} else {
			updateCartQty(cookies, id, qty);
		}
		return { success: true };
	},
	clear: async ({ cookies }) => {
		setCart(cookies, []);
		return { success: true };
	}
};
