import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { orderTable } from '#lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { OrderStatus, PaymentStatus } from '#lib/types.js';

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

		const extra: { cancelledAt?: Date } = {};
		if (orderStatus === OrderStatus.CANCELLED) {
			extra.cancelledAt = new Date();
		}

		await db
			.update(orderTable)
			.set({ orderStatus, paymentStatus, updatedAt: new Date(), ...extra })
			.where(eq(orderTable.id, params.id));

		return { success: true };
	}
};
