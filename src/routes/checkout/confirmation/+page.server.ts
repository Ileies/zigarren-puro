import { redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import db from '#lib/server/db/index.js';
import {
	orderTable,
	orderItemTable,
	productTable,
	addressTable
} from '#lib/server/db/schema/index.js';
import { setCart } from '#lib/server/cart.js';
import { OrderStatus, PaymentStatus } from '#lib/types.js';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	if (!locals.user) redirect(302, '/login');

	const orderId = url.searchParams.get('id');
	if (!orderId) redirect(302, '/');

	const [order] = await db.select().from(orderTable).where(eq(orderTable.id, orderId));

	if (!order || order.customerId !== locals.user.id) redirect(302, '/');

	// Card checkout keeps the cart until the customer returns from the payment page
	if (order.orderStatus !== OrderStatus.CANCELLED && order.paymentStatus !== PaymentStatus.FAILED) {
		setCart(cookies, []);
	}

	const [items, shippingAddress] = await Promise.all([
		db
			.select({
				id: orderItemTable.id,
				quantity: orderItemTable.quantity,
				unitPrice: orderItemTable.unitPrice,
				subtotal: orderItemTable.subtotal,
				productName: sql<
					string | null
				>`coalesce(${orderItemTable.productName}, ${productTable.name})`
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
