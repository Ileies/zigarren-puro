import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { orderTable, orderItemTable, productTable, addressTable } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const orderId = url.searchParams.get('id');
	if (!orderId) redirect(302, '/');

	const [order] = await db.select().from(orderTable).where(eq(orderTable.id, orderId));

	if (!order || order.customerId !== locals.user.id) redirect(302, '/');

	const [items, shippingAddress] = await Promise.all([
		db
			.select({
				id: orderItemTable.id,
				quantity: orderItemTable.quantity,
				unitPrice: orderItemTable.unitPrice,
				subtotal: orderItemTable.subtotal,
				productName: productTable.name
			})
			.from(orderItemTable)
			.leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
			.where(eq(orderItemTable.orderId, orderId)),
		db.select().from(addressTable).where(eq(addressTable.id, order.shippingAddressId))
	]);

	return {
		order,
		items,
		shippingAddress: shippingAddress[0] ?? null,
		firstName: locals.user.firstName,
		lastName: locals.user.lastName
	};
};
