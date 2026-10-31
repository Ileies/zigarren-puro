import { fail, redirect } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import {
	addressTable,
	customerTable,
	productTable,
	producerTable
} from '#lib/server/db/schema/index.js';
import { getCart, setCart } from '#lib/server/cart.js';
import { sendOrderConfirmationEmail } from '#lib/server/functions.js';
import { parseCheckoutForm, placeOrder, type CheckoutError } from '#lib/server/checkout.js';
import { bankTransferAvailable } from '#lib/config.js';
import { formatOrderNumber } from '#lib/orderNumber.js';
import * as m from '#lib/messages.js';

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
		bankTransferAvailable,
		firstName: locals.user.firstName,
		lastName: locals.user.lastName,
		email: locals.user.email
	};
};

/** The message for a refused checkout, in the visitor's language. */
function errorMessage(error: CheckoutError): string {
	switch (error.code) {
		case 'shippingMethod':
			return m.errShippingMethod();
		case 'paymentMethod':
			return m.errPaymentMethod();
		case 'underage':
			return m.checkoutAgeError();
		case 'cartEmpty':
			return m.errCartEmpty();
		case 'productUnavailable':
			return m.errProductUnavailable();
		case 'insufficientStock':
			return m.errInsufficientStock({ name: error.productName });
		case 'shippingAddress':
			return m.errShippingAddress();
		case 'shippingAddressIncomplete':
			return m.errShippingAddressIncomplete();
		case 'billingAddress':
			return m.errBillingAddress();
		case 'billingAddressIncomplete':
			return m.errBillingAddressIncomplete();
	}
}

export const actions: Actions = {
	placeOrder: async ({ locals, request, cookies }) => {
		if (!locals.user) redirect(302, '/login');

		const result = await placeOrder(
			locals.user.id,
			parseCheckoutForm(await request.formData()),
			getCart(cookies)
		);
		if (!result.ok) return fail(400, { error: errorMessage(result.error) });
		const { order } = result;

		setCart(cookies, []);

		try {
			await sendOrderConfirmationEmail(
				locals.user.id,
				locals.user.email,
				locals.user.firstName,
				order.id,
				formatOrderNumber(order),
				order.lines.map((l) => ({ name: l.name, qty: l.quantity, unitPrice: l.unitPrice })),
				order.subtotal,
				order.shippingCost,
				order.taxTotal,
				order.total,
				'bank_transfer'
			);
		} catch {
			// Don't block order on email failure
		}

		redirect(302, `/checkout/confirmation?id=${order.id}`);
	}
};
