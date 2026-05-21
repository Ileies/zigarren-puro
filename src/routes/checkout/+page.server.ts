import { fail, redirect } from '@sveltejs/kit';
import { eq, inArray, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import {
	addressTable,
	customerTable,
	orderTable,
	orderItemTable,
	productTable,
	producerTable
} from '$lib/server/db/schema';
import { getCart, setCart } from '$lib/server/cart';
import { OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod } from '$lib/types';
import { sendOrderConfirmationEmail } from '$lib/server/functions';
import { freeShippingThreshold, shippingCosts } from '$lib/config';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_ORIGIN } from '$env/static/public';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (!locals.user) redirect(302, '/login?redirect=/checkout');

	const cartItems = getCart(cookies);
	if (cartItems.length === 0) redirect(302, '/cart');

	const ids = cartItems.map((i) => i.id);

	const [products, addresses, customerRows] = await Promise.all([
		db
			.select({
				id: productTable.id,
				name: productTable.name,
				price: productTable.price,
				stock: productTable.stock,
				productType: productTable.productType,
				producerName: producerTable.name
			})
			.from(productTable)
			.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
			.where(inArray(productTable.id, ids)),
		db.select().from(addressTable).where(eq(addressTable.customerId, locals.user.id)),
		db
			.select({ birthDate: customerTable.birthDate, phone: customerTable.phone })
			.from(customerTable)
			.where(eq(customerTable.id, locals.user.id))
	]);

	const items = cartItems
		.map((cartItem) => {
			const product = products.find((p) => p.id === cartItem.id);
			if (!product) return null;
			return { ...product, qty: cartItem.qty };
		})
		.filter((i): i is NonNullable<typeof i> => i !== null);

	if (items.length === 0) redirect(302, '/cart');

	return {
		items,
		addresses,
		customer: customerRows[0] ?? null,
		firstName: locals.user.firstName,
		lastName: locals.user.lastName,
		email: locals.user.email
	};
};

export const actions: Actions = {
	placeOrder: async ({ locals, request, cookies }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();

		const shippingAddressId = data.get('shippingAddressId')?.toString() || null;
		const shippingStreet = data.get('shippingStreet')?.toString().trim() ?? '';
		const shippingCity = data.get('shippingCity')?.toString().trim() ?? '';
		const shippingPostalCode = data.get('shippingPostalCode')?.toString().trim() ?? '';
		const shippingState = data.get('shippingState')?.toString().trim() ?? '';

		const billingSameAsShipping = data.get('billingSameAsShipping') === '1';
		const billingAddressId = data.get('billingAddressId')?.toString() || null;
		const billingStreet = data.get('billingStreet')?.toString().trim() ?? '';
		const billingCity = data.get('billingCity')?.toString().trim() ?? '';
		const billingPostalCode = data.get('billingPostalCode')?.toString().trim() ?? '';
		const billingState = data.get('billingState')?.toString().trim() ?? '';

		const shippingMethodRaw = data.get('shippingMethod')?.toString();
		const paymentMethodRaw = data.get('paymentMethod')?.toString() ?? 'bank_transfer';
		const notes = data.get('notes')?.toString().trim() || null;

		if (!shippingMethodRaw || !['standard', 'express'].includes(shippingMethodRaw)) {
			return fail(400, { error: 'Ungültige Versandart.' });
		}
		if (!['bank_transfer', 'credit_card'].includes(paymentMethodRaw)) {
			return fail(400, { error: 'Ungültige Zahlungsart.' });
		}
		const shippingMethodKey = shippingMethodRaw as 'standard' | 'express';
		const useStripe = paymentMethodRaw === 'credit_card';

		// Age verification
		const [customer] = await db
			.select({ birthDate: customerTable.birthDate })
			.from(customerTable)
			.where(eq(customerTable.id, locals.user.id));

		if (customer) {
			const birth = new Date(customer.birthDate);
			const today = new Date();
			let age = today.getFullYear() - birth.getFullYear();
			const m = today.getMonth() - birth.getMonth();
			if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
			if (age < 18) return fail(400, { error: 'age' });
		}

		// Verify cart + calculate totals from DB prices
		const cartItems = getCart(cookies);
		if (cartItems.length === 0) return fail(400, { error: 'Warenkorb ist leer.' });

		const ids = cartItems.map((i) => i.id);
		const products = await db
			.select({ id: productTable.id, name: productTable.name, price: productTable.price, stock: productTable.stock })
			.from(productTable)
			.where(inArray(productTable.id, ids));

		for (const cartItem of cartItems) {
			const product = products.find((p) => p.id === cartItem.id);
			if (!product) return fail(400, { error: 'Ein Produkt ist nicht mehr verfügbar.' });
			if (product.stock !== null && product.stock < cartItem.qty) {
				return fail(400, { error: `"${product.name}" ist nicht in der gewünschten Menge verfügbar.` });
			}
		}

		const subtotal = cartItems.reduce((sum, item) => {
			const p = products.find((p) => p.id === item.id)!;
			return sum + parseFloat(p.price) * item.qty;
		}, 0);
		const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCosts[shippingMethodKey];
		const total = subtotal + shippingCost;

		// Resolve shipping address
		let resolvedShippingId: string;
		if (shippingAddressId) {
			const [addr] = await db
				.select({ id: addressTable.id })
				.from(addressTable)
				.where(and(eq(addressTable.id, shippingAddressId), eq(addressTable.customerId, locals.user.id)));
			if (!addr) return fail(400, { error: 'Ungültige Lieferadresse.' });
			resolvedShippingId = addr.id;
		} else {
			if (!shippingStreet || !shippingCity || !shippingPostalCode || !shippingState) {
				return fail(400, { error: 'Bitte füllen Sie alle Pflichtfelder der Lieferadresse aus.' });
			}
			const [newAddr] = await db
				.insert(addressTable)
				.values({
					customerId: locals.user.id,
					type: 'shipping',
					street: shippingStreet,
					city: shippingCity,
					postalCode: shippingPostalCode,
					state: shippingState,
					country: 'DE',
					isDefault: false
				})
				.returning({ id: addressTable.id });
			resolvedShippingId = newAddr.id;
		}

		// Resolve billing address
		let resolvedBillingId: string;
		if (billingSameAsShipping) {
			resolvedBillingId = resolvedShippingId;
		} else if (billingAddressId) {
			const [addr] = await db
				.select({ id: addressTable.id })
				.from(addressTable)
				.where(and(eq(addressTable.id, billingAddressId), eq(addressTable.customerId, locals.user.id)));
			if (!addr) return fail(400, { error: 'Ungültige Rechnungsadresse.' });
			resolvedBillingId = addr.id;
		} else {
			if (!billingStreet || !billingCity || !billingPostalCode || !billingState) {
				return fail(400, { error: 'Bitte füllen Sie alle Pflichtfelder der Rechnungsadresse aus.' });
			}
			const [newAddr] = await db
				.insert(addressTable)
				.values({
					customerId: locals.user.id,
					type: 'billing',
					street: billingStreet,
					city: billingCity,
					postalCode: billingPostalCode,
					state: billingState,
					country: 'DE',
					isDefault: false
				})
				.returning({ id: addressTable.id });
			resolvedBillingId = newAddr.id;
		}

		// Create order
		const [order] = await db
			.insert(orderTable)
			.values({
				customerId: locals.user.id,
				orderStatus: OrderStatus.PENDING,
				paymentStatus: PaymentStatus.PENDING,
				paymentMethod: useStripe ? PaymentMethod.CREDIT_CARD : PaymentMethod.BANK_TRANSFER,
				shippingMethod: shippingMethodKey === 'express' ? ShippingMethod.EXPRESS : ShippingMethod.STANDARD,
				shippingAddressId: resolvedShippingId,
				billingAddressId: resolvedBillingId,
				subtotalAmount: subtotal.toFixed(2),
				shippingAmount: shippingCost.toFixed(2),
				taxAmount: '0.00',
				totalAmount: total.toFixed(2),
				notes,
				// placedAt is set by webhook for Stripe; immediately for bank transfer
				placedAt: useStripe ? null : new Date()
			})
			.returning({ id: orderTable.id });

		// Create order items
		await db.insert(orderItemTable).values(
			cartItems.map((cartItem) => {
				const p = products.find((p) => p.id === cartItem.id)!;
				const unitPrice = parseFloat(p.price);
				return {
					orderId: order.id,
					productId: cartItem.id,
					quantity: cartItem.qty,
					unitPrice: unitPrice.toFixed(2),
					subtotal: (unitPrice * cartItem.qty).toFixed(2)
				};
			})
		);

		setCart(cookies, []);

		if (useStripe) {
			// Create Stripe Checkout Session
			const stripe = new Stripe(STRIPE_SECRET_KEY);

			const lineItems = cartItems.map((cartItem) => {
				const p = products.find((p) => p.id === cartItem.id)!;
				return {
					price_data: {
						currency: 'eur',
						product_data: { name: p.name },
						unit_amount: Math.round(parseFloat(p.price) * 100)
					},
					quantity: cartItem.qty
				};
			});

			if (shippingCost > 0) {
				lineItems.push({
					price_data: {
						currency: 'eur',
						product_data: { name: 'Versandkosten' },
						unit_amount: Math.round(shippingCost * 100)
					},
					quantity: 1
				});
			}

			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				ui_mode: 'embedded_page',
				line_items: lineItems,
				customer_email: locals.user.email,
				metadata: { orderId: order.id },
				return_url: `https://${PUBLIC_ORIGIN}/checkout/confirmation?id=${order.id}`
			});

			await db
				.update(orderTable)
				.set({ stripeSessionId: session.id })
				.where(eq(orderTable.id, order.id));

			return { clientSecret: session.client_secret!, orderId: order.id };
		}

		// Bank transfer: send confirmation email and redirect
		try {
			await sendOrderConfirmationEmail(
				locals.user.id,
				locals.user.email,
				locals.user.firstName,
				order.id,
				cartItems.map((item) => {
					const p = products.find((p) => p.id === item.id)!;
					return { name: p.name, qty: item.qty, unitPrice: parseFloat(p.price) };
				}),
				subtotal,
				shippingCost,
				total,
				'bank_transfer'
			);
		} catch {
			// Don't block order on email failure
		}

		redirect(302, `/checkout/confirmation?id=${order.id}`);
	}
};
