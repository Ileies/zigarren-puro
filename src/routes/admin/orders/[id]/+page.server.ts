import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { orderTable } from '#lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { OrderStatus, PaymentStatus } from '#lib/types.js';
import { InsufficientStockError, applyOrderStatus } from '#lib/server/orders.js';

export const load: PageServerLoad = async ({ params }) => {
	const order = await db.query.orderTable.findFirst({
		where: eq(orderTable.id, params.id),
		with: {
			customer: true,
			shippingAddress: true,
			billingAddress: true,
			items: {
				with: { product: true }
			}
		}
	});

	if (!order) error(404, 'Bestellung nicht gefunden');

	return { order };
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const data = await request.formData();
		const orderStatus = data.get('orderStatus') as OrderStatus;
		const paymentStatus = data.get('paymentStatus') as PaymentStatus;

		if (
			!Object.values(OrderStatus).includes(orderStatus) ||
			!Object.values(PaymentStatus).includes(paymentStatus)
		) {
			return { error: 'Ungültiger Status' };
		}

		try {
			if (!applyOrderStatus(params.id, orderStatus, paymentStatus)) {
				return { error: 'Bestellung nicht gefunden' };
			}
		} catch (err) {
			if (err instanceof InsufficientStockError) {
				return {
					error: `Bestand von "${err.productName}" reicht nicht, um die Bestellung wieder zu aktivieren.`
				};
			}
			throw err;
		}

		return { success: true };
	}
};
