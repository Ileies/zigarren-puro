import type { PageServerLoad } from './$types';
import db from '#lib/server/db/index.js';
import { orderTable, customerTable } from '#lib/server/db/schema/index.js';
import { desc, eq } from 'drizzle-orm';
import { OrderStatus } from '#lib/types.js';

export const load: PageServerLoad = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	const statusFilter = Object.values(OrderStatus).includes(statusParam as OrderStatus)
		? (statusParam as OrderStatus)
		: null;

	const orders = await db
		.select({
			id: orderTable.id,
			orderNumber: orderTable.orderNumber,
			orderStatus: orderTable.orderStatus,
			paymentStatus: orderTable.paymentStatus,
			shippingMethod: orderTable.shippingMethod,
			totalAmount: orderTable.totalAmount,
			createdAt: orderTable.createdAt,
			placedAt: orderTable.placedAt,
			customerFirstName: customerTable.firstName,
			customerLastName: customerTable.lastName,
			customerEmail: customerTable.email
		})
		.from(orderTable)
		.leftJoin(customerTable, eq(orderTable.customerId, customerTable.id))
		.where(statusFilter ? eq(orderTable.orderStatus, statusFilter) : undefined)
		.orderBy(desc(orderTable.createdAt));

	return { orders, statusFilter };
};
