import { and, eq, inArray } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { addressTable, customerTable, productTable } from '#lib/server/db/schema/index.js';
import {
	InsufficientStockError,
	createOrderReservingStock,
	paymentDeadline,
	type OrderLine
} from '#lib/server/orders.js';
import { OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from '#lib/types.js';
import {
	bankTransferAvailable,
	defaultVatRate,
	freeShippingThreshold,
	shippingCosts,
	vatRates
} from '#lib/config.js';
import { calculateTax } from '#lib/vat.js';
import { ageOn, MINIMUM_AGE } from '#lib/age.js';

/** New addresses are German until the shipping countries are decided (D2 in the plan). */
const ADDRESS_COUNTRY = 'DE';

export type CartLine = { id: string; qty: number };

type AddressInput = {
	id: string | null;
	street: string;
	city: string;
	postalCode: string;
	state: string;
};

export type CheckoutForm = {
	shipping: AddressInput;
	billing: AddressInput & { sameAsShipping: boolean };
	shippingMethod: string | undefined;
	paymentMethod: string;
	notes: string | null;
};

/** Why an order was refused. The route turns the code into a message in the visitor's language. */
export type CheckoutError =
	| { code: 'shippingMethod' }
	| { code: 'paymentMethod' }
	| { code: 'underage' }
	| { code: 'cartEmpty' }
	| { code: 'productUnavailable' }
	| { code: 'insufficientStock'; productName: string }
	| { code: 'shippingAddress' }
	| { code: 'shippingAddressIncomplete' }
	| { code: 'billingAddress' }
	| { code: 'billingAddressIncomplete' };

export type PlacedOrder = {
	id: string;
	orderNumber: number;
	lines: OrderLine[];
	subtotal: number;
	shippingCost: number;
	taxTotal: number;
	total: number;
};

export type PlaceOrderResult =
	| { ok: true; order: PlacedOrder }
	| { ok: false; error: CheckoutError };

const refuse = (error: CheckoutError): PlaceOrderResult => ({ ok: false, error });

const text = (data: FormData, key: string) => data.get(key)?.toString().trim() ?? '';

export function parseCheckoutForm(data: FormData): CheckoutForm {
	const address = (prefix: 'shipping' | 'billing'): AddressInput => ({
		id: data.get(`${prefix}AddressId`)?.toString() || null,
		street: text(data, `${prefix}Street`),
		city: text(data, `${prefix}City`),
		postalCode: text(data, `${prefix}PostalCode`),
		state: text(data, `${prefix}State`)
	});
	return {
		shipping: address('shipping'),
		billing: { ...address('billing'), sameAsShipping: data.get('billingSameAsShipping') === '1' },
		shippingMethod: data.get('shippingMethod')?.toString(),
		paymentMethod: data.get('paymentMethod')?.toString() ?? 'bank_transfer',
		notes: data.get('notes')?.toString().trim() || null
	};
}

/** An address the customer picked (must be theirs) or typed in (saved as a new address). */
async function resolveAddress(
	customerId: string,
	type: 'shipping' | 'billing',
	input: AddressInput
): Promise<string | 'unknown' | 'incomplete'> {
	if (input.id) {
		const [owned] = await db
			.select({ id: addressTable.id })
			.from(addressTable)
			.where(and(eq(addressTable.id, input.id), eq(addressTable.customerId, customerId)));
		return owned ? owned.id : 'unknown';
	}
	const { street, city, postalCode, state } = input;
	if (!street || !city || !postalCode || !state) return 'incomplete';
	const [created] = await db
		.insert(addressTable)
		.values({
			customerId,
			type,
			street,
			city,
			postalCode,
			state,
			country: ADDRESS_COUNTRY,
			isDefault: false
		})
		.returning({ id: addressTable.id });
	return created.id;
}

/**
 * Validates a checkout and creates the order with its items, taking the stock in one
 * transaction. Prices, VAT and totals always come from the database, never from the form.
 * Bank transfer is the only payment method until the Mollie integration lands.
 */
export async function placeOrder(
	customerId: string,
	form: CheckoutForm,
	cart: CartLine[],
	options: { bankTransferAvailable?: boolean; now?: Date } = {}
): Promise<PlaceOrderResult> {
	const { bankTransferAvailable: bankTransfer = bankTransferAvailable, now = new Date() } = options;

	if (form.shippingMethod !== 'standard' && form.shippingMethod !== 'express') {
		return refuse({ code: 'shippingMethod' });
	}
	if (form.paymentMethod !== 'bank_transfer' || !bankTransfer) {
		return refuse({ code: 'paymentMethod' });
	}
	const shippingMethodKey = form.shippingMethod;

	const [customer] = await db
		.select({ birthDate: customerTable.birthDate })
		.from(customerTable)
		.where(eq(customerTable.id, customerId));
	if (customer && ageOn(customer.birthDate, now) < MINIMUM_AGE) return refuse({ code: 'underage' });

	if (cart.length === 0) return refuse({ code: 'cartEmpty' });

	const products = await db
		.select({
			id: productTable.id,
			name: productTable.name,
			price: productTable.price,
			stock: productTable.stock,
			sku: productTable.sku,
			productType: productTable.productType
		})
		.from(productTable)
		.where(
			inArray(
				productTable.id,
				cart.map((i) => i.id)
			)
		);

	for (const item of cart) {
		const product = products.find((p) => p.id === item.id);
		if (!product) return refuse({ code: 'productUnavailable' });
		if (product.stock !== null && product.stock < item.qty) {
			return refuse({ code: 'insufficientStock', productName: product.name });
		}
	}

	const lines: OrderLine[] = cart.map((item) => {
		const p = products.find((p) => p.id === item.id)!;
		return {
			productId: item.id,
			name: p.name,
			sku: p.sku,
			vatRate: vatRates[p.productType],
			quantity: item.qty,
			unitPrice: p.price
		};
	});
	const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
	const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCosts[shippingMethodKey];
	const total = subtotal + shippingCost;
	const tax = calculateTax(
		lines.map((l) => ({ gross: l.unitPrice * l.quantity, rate: l.vatRate })),
		shippingCost,
		defaultVatRate
	);

	const shippingId = await resolveAddress(customerId, 'shipping', form.shipping);
	if (shippingId === 'unknown') return refuse({ code: 'shippingAddress' });
	if (shippingId === 'incomplete') return refuse({ code: 'shippingAddressIncomplete' });

	let billingId = shippingId;
	if (!form.billing.sameAsShipping) {
		const resolved = await resolveAddress(customerId, 'billing', form.billing);
		if (resolved === 'unknown') return refuse({ code: 'billingAddress' });
		if (resolved === 'incomplete') return refuse({ code: 'billingAddressIncomplete' });
		billingId = resolved;
	}

	try {
		const { id, orderNumber } = createOrderReservingStock(
			{
				customerId,
				orderStatus: OrderStatus.PENDING,
				paymentStatus: PaymentStatus.PENDING,
				paymentMethod: PaymentMethod.BANK_TRANSFER,
				shippingMethod:
					shippingMethodKey === 'express' ? ShippingMethod.EXPRESS : ShippingMethod.STANDARD,
				shippingAddressId: shippingId,
				billingAddressId: billingId,
				subtotalAmount: subtotal,
				shippingAmount: shippingCost,
				taxAmount: tax.total,
				totalAmount: total,
				notes: form.notes,
				placedAt: now,
				paymentDueAt: paymentDeadline(now)
			},
			lines
		);
		return {
			ok: true,
			order: { id, orderNumber, lines, subtotal, shippingCost, taxTotal: tax.total, total }
		};
	} catch (err) {
		if (err instanceof InsufficientStockError) {
			return refuse({ code: 'insufficientStock', productName: err.productName });
		}
		throw err;
	}
}
