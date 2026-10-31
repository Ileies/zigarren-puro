import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { productTable, producerTable, wishlistTable } from '#lib/server/db/schema/index.js';
import { addToCart } from '#lib/server/cart.js';
import { and, eq } from 'drizzle-orm';
import * as m from '#lib/messages.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const items = await db
		.select({
			productId: wishlistTable.productId,
			addedAt: wishlistTable.createdAt,
			name: productTable.name,
			price: productTable.price,
			stock: productTable.stock,
			sku: productTable.sku,
			productType: productTable.productType,
			producerName: producerTable.name
		})
		.from(wishlistTable)
		.innerJoin(productTable, eq(wishlistTable.productId, productTable.id))
		.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
		.where(eq(wishlistTable.customerId, locals.user.id))
		.orderBy(wishlistTable.createdAt);

	return { items };
};

export const actions: Actions = {
	remove: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		if (!productId) return;

		await db
			.delete(wishlistTable)
			.where(
				and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, productId))
			);
	},

	addToCart: async ({ locals, cookies, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		if (!productId) return;

		const product = await db.query.productTable.findFirst({
			where: eq(productTable.id, productId),
			columns: { stock: true }
		});
		if (!product || product.stock <= 0) {
			return fail(409, { error: m.errProductUnavailable() });
		}

		addToCart(cookies, productId);
		return { success: true };
	}
};
