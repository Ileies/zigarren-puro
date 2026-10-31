import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { orderTable } from '#lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { OrderStatus, PaymentStatus } from '#lib/types.js';
import {
	InsufficientStockError,
	InvalidTransitionError,
	MAX_INTERNAL_NOTE_LENGTH,
	ORDER_TRANSITIONS,
	PAYMENT_TRANSITIONS,
	applyOrderStatus,
	customerNotices,
	loadOrderNotice,
	orderHistory,
	saveInternalNote
} from '#lib/server/orders.js';
import { sendOrderCancelledEmail, sendPaymentReceivedEmail } from '#lib/server/functions.js';

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

	return {
		order,
		events: orderHistory(order.id),
		// What the status form offers: the current status and the ones it may change to
		nextOrderStatuses: [order.orderStatus, ...ORDER_TRANSITIONS[order.orderStatus]],
		nextPaymentStatuses: [order.paymentStatus, ...PAYMENT_TRANSITIONS[order.paymentStatus]]
	};
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
			return { form: 'status', error: 'Ungültiger Status' };
		}

		let change;
		try {
			change = applyOrderStatus(params.id, orderStatus, paymentStatus);
		} catch (err) {
			if (err instanceof InvalidTransitionError) return { form: 'status', error: err.message };
			if (err instanceof InsufficientStockError) {
				return {
					form: 'status',
					error: `Bestand von "${err.productName}" reicht nicht, um die Bestellung wieder zu aktivieren.`
				};
			}
			throw err;
		}
		if (!change) return { form: 'status', error: 'Bestellung nicht gefunden' };

		// The status is saved. A mail that fails to go out must not undo that, staff are told instead.
		const emailed: ('cancelled' | 'paid')[] = [];
		let emailFailed = false;
		if (data.get('notify') === 'on') {
			const notice = loadOrderNotice(params.id);
			for (const kind of notice
				? customerNotices(change.from, { orderStatus, paymentStatus })
				: []) {
				try {
					if (kind === 'cancelled') await sendOrderCancelledEmail(notice!, 'staff');
					else await sendPaymentReceivedEmail(notice!);
					emailed.push(kind);
				} catch (err) {
					console.error('Order email failed', params.id, kind, err);
					emailFailed = true;
				}
			}
		}

		return { form: 'status', success: true, emailed, emailFailed };
	},

	saveNote: async ({ request, params }) => {
		const note = (await request.formData()).get('internalNote')?.toString() ?? '';
		if (note.trim().length > MAX_INTERNAL_NOTE_LENGTH) {
			return {
				form: 'note',
				error: `Die Notiz ist zu lang (max. ${MAX_INTERNAL_NOTE_LENGTH} Zeichen).`
			};
		}
		if (!saveInternalNote(params.id, note))
			return { form: 'note', error: 'Bestellung nicht gefunden' };
		return { form: 'note', success: true };
	}
};
