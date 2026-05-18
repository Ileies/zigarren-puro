import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { productTable, orderTable, customerTable } from '$lib/server/db/schema';
import { count, desc, eq, and, gt, lte } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const [{ total: totalProducts }] = await db.select({ total: count() }).from(productTable);

	const [{ total: outOfStock }] = await db
		.select({ total: count() })
		.from(productTable)
		.where(eq(productTable.stock, 0));

	const [{ total: lowStock }] = await db
		.select({ total: count() })
		.from(productTable)
		.where(and(gt(productTable.stock, 0), lte(productTable.stock, 4)));

	const orderCounts = await db
		.select({ status: orderTable.orderStatus, total: count() })
		.from(orderTable)
		.groupBy(orderTable.orderStatus);

	const recentOrders = await db
		.select({
			id: orderTable.id,
			orderStatus: orderTable.orderStatus,
			paymentStatus: orderTable.paymentStatus,
			totalAmount: orderTable.totalAmount,
			createdAt: orderTable.createdAt,
			customerFirstName: customerTable.firstName,
			customerLastName: customerTable.lastName
		})
		.from(orderTable)
		.leftJoin(customerTable, eq(orderTable.customerId, customerTable.id))
		.orderBy(desc(orderTable.createdAt))
		.limit(8);

	return { totalProducts, outOfStock, lowStock, orderCounts, recentOrders };
};
