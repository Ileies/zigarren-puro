import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { orderTable } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const orders = await db
		.select({
			id: orderTable.id,
			orderStatus: orderTable.orderStatus,
			paymentStatus: orderTable.paymentStatus,
			shippingMethod: orderTable.shippingMethod,
			totalAmount: orderTable.totalAmount,
			createdAt: orderTable.createdAt,
			placedAt: orderTable.placedAt
		})
		.from(orderTable)
		.where(eq(orderTable.customerId, locals.user.id))
		.orderBy(desc(orderTable.createdAt));

	return { orders };
};
