import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	addressTable,
	customerTable,
	orderItemTable,
	orderTable,
	productTable
} from '#lib/server/db/schema/index.js';
import {
	parseCheckoutForm,
	placeOrder,
	type CheckoutError,
	type CheckoutForm,
	type CartLine
} from '#lib/server/checkout.js';
import { bankAccount, freeShippingThreshold, shippingCosts } from '#lib/config.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '#lib/types.js';
import { resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

const DAY = 24 * 60 * 60 * 1000;
const open = { bankTransferAvailable: true };

const address = { id: null, street: '', city: '', postalCode: '', state: '' };
const newAddress = {
	id: null,
	street: 'Hauptstraße 1',
	city: 'Bonn',
	postalCode: '53111',
	state: 'NRW'
};

const form = (overrides: Partial<CheckoutForm> = {}): CheckoutForm => ({
	shipping: { ...address, id: 'addr-1' },
	billing: { ...address, sameAsShipping: true },
	shippingMethod: 'standard',
	paymentMethod: 'bank_transfer',
	notes: null,
	...overrides
});

const cigars = (qty = 1): CartLine[] => [{ id: 'cigar-1', qty }];

const orders = () => db.select().from(orderTable);
const stock = async (id = 'cigar-1') =>
	(await db.select().from(productTable).where(eq(productTable.id, id)))[0].stock;
const addresses = () => db.select().from(addressTable).where(eq(addressTable.customerId, 'cust-1'));

beforeEach(async () => {
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('placeOrder', () => {
	test('creates the order, its items and takes the stock', async () => {
		const result = await placeOrder('cust-1', form({ notes: 'Bitte klingeln' }), cigars(2), open);
		if (!result.ok) throw new Error(result.error.code);

		const { order } = result;
		expect(order.orderNumber).toBe(10001);
		expect(order.subtotal).toBe(80);
		expect(order.shippingCost).toBe(shippingCosts.standard);
		expect(order.total).toBe(80 + shippingCosts.standard);
		expect(order.taxTotal).toBeGreaterThan(0);
		expect(await stock()).toBe(3);

		const [row] = await orders();
		expect(row).toMatchObject({
			id: order.id,
			customerId: 'cust-1',
			orderStatus: OrderStatus.PENDING,
			paymentStatus: PaymentStatus.PENDING,
			paymentMethod: PaymentMethod.BANK_TRANSFER,
			shippingAddressId: 'addr-1',
			billingAddressId: 'addr-1',
			notes: 'Bitte klingeln'
		});
		expect(row.totalAmount).toBe(order.total);

		const items = await db
			.select()
			.from(orderItemTable)
			.where(eq(orderItemTable.orderId, order.id));
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			productName: 'Siglo VI',
			sku: 'SKU-1',
			quantity: 2,
			unitPrice: 40,
			subtotal: 80
		});
	});

	test('sets the payment deadline from the clock', async () => {
		const now = new Date('2026-11-01T10:00:00Z');
		await placeOrder('cust-1', form(), cigars(), { ...open, now });
		const [row] = await orders();
		expect(row.paymentDueAt!.getTime() - now.getTime()).toBe(bankAccount.paymentDeadlineDays * DAY);
	});

	test('shipping is free from the threshold and express costs more below it', async () => {
		const free = await placeOrder('cust-1', form(), [{ id: 'rum-1', qty: 3 }], open);
		if (!free.ok) throw new Error(free.error.code);
		expect(free.order.subtotal).toBeGreaterThanOrEqual(freeShippingThreshold);
		expect(free.order.shippingCost).toBe(0);

		const express = await placeOrder('cust-1', form({ shippingMethod: 'express' }), cigars(), open);
		if (!express.ok) throw new Error(express.error.code);
		expect(express.order.shippingCost).toBe(shippingCosts.express);
	});

	test('saves typed addresses as new German addresses, billing can differ', async () => {
		const result = await placeOrder(
			'cust-1',
			form({
				shipping: newAddress,
				billing: {
					...newAddress,
					street: 'Rechnungsweg 2',
					city: 'Köln',
					sameAsShipping: false
				}
			}),
			cigars(),
			open
		);
		expect(result.ok).toBe(true);

		const saved = await addresses();
		expect(saved).toHaveLength(3);
		const [row] = await orders();
		const shipping = saved.find((a) => a.id === row.shippingAddressId)!;
		const billing = saved.find((a) => a.id === row.billingAddressId)!;
		expect(shipping).toMatchObject({ type: 'shipping', street: 'Hauptstraße 1', country: 'DE' });
		expect(billing).toMatchObject({ type: 'billing', street: 'Rechnungsweg 2', country: 'DE' });
	});

	test('billing the same as shipping reuses the shipping address', async () => {
		await placeOrder('cust-1', form({ shipping: newAddress }), cigars(), open);
		const [row] = await orders();
		expect(row.billingAddressId).toBe(row.shippingAddressId);
		expect(await addresses()).toHaveLength(2);
	});

	describe('refusals change nothing', () => {
		const refused = async (
			f: CheckoutForm,
			cart: CartLine[],
			expected: CheckoutError['code'],
			opts = open
		) => {
			const result = await placeOrder('cust-1', f, cart, opts);
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe(expected);
			expect(await orders()).toHaveLength(0);
			expect(await stock()).toBe(5);
		};

		test('unknown shipping method', async () => {
			await refused(form({ shippingMethod: 'pickup' }), cigars(), 'shippingMethod');
			await refused(form({ shippingMethod: undefined }), cigars(), 'shippingMethod');
		});

		test('other payment methods and bank transfer while it is not available', async () => {
			await refused(form({ paymentMethod: 'credit_card' }), cigars(), 'paymentMethod');
			await refused(form(), cigars(), 'paymentMethod', { bankTransferAvailable: false });
		});

		test('a customer under 18', async () => {
			const birthDate = new Date(Date.now() - 17 * 365 * DAY).toISOString().slice(0, 10);
			await db.update(customerTable).set({ birthDate }).where(eq(customerTable.id, 'cust-1'));
			await refused(form(), cigars(), 'underage');
		});

		test('an empty cart and an unknown product', async () => {
			await refused(form(), [], 'cartEmpty');
			await refused(form(), [{ id: 'gone', qty: 1 }], 'productUnavailable');
		});

		test('more than the stock', async () => {
			const result = await placeOrder('cust-1', form(), cigars(6), open);
			expect(result).toEqual({
				ok: false,
				error: { code: 'insufficientStock', productName: 'Siglo VI' }
			});
			expect(await orders()).toHaveLength(0);
			expect(await stock()).toBe(5);
		});

		test('a sold-out product', async () => {
			const result = await placeOrder('cust-1', form(), [{ id: 'cigar-2', qty: 1 }], open);
			expect(result.ok).toBe(false);
			expect(await orders()).toHaveLength(0);
		});

		test('an address that belongs to someone else', async () => {
			await db.insert(customerTable).values({
				id: 'cust-2',
				email: 'eva@example.com',
				firstName: 'Eva',
				lastName: 'Muster',
				birthDate: '1990-05-05'
			});
			await db.insert(addressTable).values({
				id: 'addr-other',
				customerId: 'cust-2',
				type: 'shipping',
				street: 'Fremdstraße 9',
				city: 'Essen',
				state: 'NRW',
				country: 'DE',
				postalCode: '45127'
			});
			await refused(
				form({ shipping: { ...address, id: 'addr-other' } }),
				cigars(),
				'shippingAddress'
			);
			await refused(
				form({ billing: { ...address, id: 'addr-other', sameAsShipping: false } }),
				cigars(),
				'billingAddress'
			);
		});

		test('an incomplete typed address', async () => {
			await refused(
				form({ shipping: { ...newAddress, city: '' } }),
				cigars(),
				'shippingAddressIncomplete'
			);
			await refused(
				form({ billing: { ...newAddress, state: '', sameAsShipping: false } }),
				cigars(),
				'billingAddressIncomplete'
			);
		});
	});
});

describe('parseCheckoutForm', () => {
	test('trims values, reads the checkbox and defaults the payment method', () => {
		const data = new FormData();
		data.set('shippingStreet', '  Hauptstraße 1 ');
		data.set('shippingAddressId', '');
		data.set('billingSameAsShipping', '1');
		data.set('shippingMethod', 'express');
		data.set('notes', '   ');
		const parsed = parseCheckoutForm(data);
		expect(parsed.shipping).toEqual({
			id: null,
			street: 'Hauptstraße 1',
			city: '',
			postalCode: '',
			state: ''
		});
		expect(parsed.billing.sameAsShipping).toBe(true);
		expect(parsed.shippingMethod).toBe('express');
		expect(parsed.paymentMethod).toBe('bank_transfer');
		expect(parsed.notes).toBeNull();
	});
});
