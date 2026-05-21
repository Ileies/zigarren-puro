// Exception to the no-+server.ts convention: Stripe sends raw POST requests
// to this endpoint that cannot be handled via SvelteKit form actions.
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import db from '$lib/server/db';
import { orderTable, orderItemTable, productTable, customerTable } from '$lib/server/db/schema';
import { OrderStatus, PaymentStatus } from '$lib/types';
import { sendOrderConfirmationEmail } from '$lib/server/functions';

export const POST: RequestHandler = async ({ request }) => {
	const sig = request.headers.get('stripe-signature');
	if (!sig) return json({ error: 'No signature' }, { status: 400 });

	const rawBody = await request.text();
	const stripe = new Stripe(STRIPE_SECRET_KEY);

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
	} catch {
		return json({ error: 'Invalid signature' }, { status: 400 });
	}

	if (
		event.type === 'checkout.session.completed' ||
		event.type === 'checkout.session.async_payment_succeeded'
	) {
		const session = event.data.object as Stripe.Checkout.Session;

		if (session.payment_status === 'paid') {
			const [order] = await db
				.update(orderTable)
				.set({
					paymentStatus: PaymentStatus.PAID,
					orderStatus: OrderStatus.CONFIRMED,
					placedAt: new Date(),
					updatedAt: new Date()
				})
				.where(eq(orderTable.stripeSessionId, session.id))
				.returning();

			if (order) {
				try {
					const [items, customer] = await Promise.all([
						db
							.select({
								quantity: orderItemTable.quantity,
								unitPrice: orderItemTable.unitPrice,
								productName: productTable.name
							})
							.from(orderItemTable)
							.leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
							.where(eq(orderItemTable.orderId, order.id)),
						db
							.select({ email: customerTable.email, firstName: customerTable.firstName })
							.from(customerTable)
							.where(eq(customerTable.id, order.customerId))
					]);

					if (customer[0]) {
						await sendOrderConfirmationEmail(
							order.customerId,
							customer[0].email,
							customer[0].firstName,
							order.id,
							items.map((i) => ({
								name: i.productName ?? 'Produkt',
								qty: i.quantity,
								unitPrice: parseFloat(i.unitPrice)
							})),
							parseFloat(order.subtotalAmount),
							parseFloat(order.shippingAmount),
							parseFloat(order.totalAmount),
							'credit_card'
						);
					}
				} catch {
					// Email failure should not affect webhook response
				}
			}
		}
	}

	if (event.type === 'checkout.session.async_payment_failed') {
		const session = event.data.object as Stripe.Checkout.Session;
		await db
			.update(orderTable)
			.set({ paymentStatus: PaymentStatus.FAILED, updatedAt: new Date() })
			.where(eq(orderTable.stripeSessionId, session.id));
	}

	return json({ received: true });
};
