import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { orderItemTable, orderTable, productTable } from '#lib/server/db/schema/index.js';
import {
	FIRST_ORDER_NUMBER,
	InsufficientStockError,
	applyOrderStatus,
	cancelPendingCardOrders,
	cancelUnpaidOrder,
	createOrderReservingStock,
	expireStaleCardOrders,
	markOrderPaid
} from '#lib/server/orders.js';
import { formatOrderNumber } from '#lib/orderNumber.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '#lib/types.js';
import { baseOrder, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

const line = (productId: string, quantity: number) => ({
	productId,
	name: productId,
	sku: `SKU-${productId}`,
	vatRate: 0.19,
	quantity,
	unitPrice: 40
});

const create = (...args: Parameters<typeof createOrderReservingStock>) =>
	createOrderReservingStock(...args).id;

const stock = async (id: string) =>
	(await db.select().from(productTable).where(eq(productTable.id, id)))[0].stock;
const order = async (id: string) =>
	(await db.select().from(orderTable).where(eq(orderTable.id, id)))[0];

beforeEach(async () => {
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('createOrderReservingStock', () => {
	test('creates order and items and decrements stock', async () => {
		const id = create(baseOrder(), [line('cigar-1', 2), line('rum-1', 1)]);
		expect(await stock('cigar-1')).toBe(3);
		expect(await stock('rum-1')).toBe(2);
		expect((await order(id)).orderStatus).toBe(OrderStatus.PENDING);
	});

	test('rolls everything back when one line is short', async () => {
		expect(() => create(baseOrder(), [line('cigar-1', 2), line('rum-1', 4)])).toThrow(
			InsufficientStockError
		);
		expect(await stock('cigar-1')).toBe(5);
		expect(await stock('rum-1')).toBe(3);
		expect((await db.select().from(orderTable)).length).toBe(0);
	});

	test('cannot oversell the last unit', async () => {
		create(baseOrder(), [line('rum-1', 3)]);
		expect(() => create(baseOrder(), [line('rum-1', 1)])).toThrow(InsufficientStockError);
		expect(await stock('rum-1')).toBe(0);
	});
});

describe('order numbers', () => {
	test('start at the first number and count up', () => {
		const a = createOrderReservingStock(baseOrder(), [line('cigar-1', 1)]);
		const b = createOrderReservingStock(baseOrder(), [line('cigar-1', 1)]);
		expect(a.orderNumber).toBe(FIRST_ORDER_NUMBER);
		expect(b.orderNumber).toBe(FIRST_ORDER_NUMBER + 1);
	});

	test('a failed order does not use up a number', () => {
		expect(() => create(baseOrder(), [line('rum-1', 99)])).toThrow(InsufficientStockError);
		const a = createOrderReservingStock(baseOrder(), [line('cigar-1', 1)]);
		expect(a.orderNumber).toBe(FIRST_ORDER_NUMBER);
	});

	test('continue after the highest existing number, also with older orders without one', async () => {
		await db.insert(orderTable).values({ ...baseOrder(), id: 'legacy', orderNumber: null });
		const a = createOrderReservingStock(baseOrder(), [line('cigar-1', 1)]);
		expect(a.orderNumber).toBe(FIRST_ORDER_NUMBER);
		const b = createOrderReservingStock(baseOrder(), [line('cigar-1', 1)]);
		expect(b.orderNumber).toBe(FIRST_ORDER_NUMBER + 1);
	});

	test('are formatted for customers, with a fallback for old orders', () => {
		expect(formatOrderNumber({ id: 'abcdef123456', orderNumber: 10042 })).toBe('ZP-10042');
		expect(formatOrderNumber({ id: 'abcdef123456', orderNumber: null })).toBe('ABCDEF12');
	});
});

describe('order item snapshots', () => {
	test('keep name, SKU and VAT rate after the product changes', async () => {
		const id = create(baseOrder(), [
			{ ...line('cigar-1', 2), name: 'Siglo VI', sku: 'SKU-1', vatRate: 0.19 }
		]);
		await db
			.update(productTable)
			.set({ name: 'Renamed', sku: 'SKU-NEW' })
			.where(eq(productTable.id, 'cigar-1'));

		const [item] = await db.select().from(orderItemTable).where(eq(orderItemTable.orderId, id));
		expect(item.productName).toBe('Siglo VI');
		expect(item.sku).toBe('SKU-1');
		expect(item.vatRate).toBe(0.19);
		expect(item.subtotal).toBe(80);
	});
});

describe('cancelling unpaid orders', () => {
	test('returns stock once, even when called repeatedly', async () => {
		const id = create(baseOrder(), [line('cigar-1', 2)]);
		expect(cancelUnpaidOrder(eq(orderTable.id, id))).toBe(true);
		expect(cancelUnpaidOrder(eq(orderTable.id, id))).toBe(false);
		expect(await stock('cigar-1')).toBe(5);
		const o = await order(id);
		expect(o.orderStatus).toBe(OrderStatus.CANCELLED);
		expect(o.paymentStatus).toBe(PaymentStatus.FAILED);
	});

	test('does not touch paid orders', async () => {
		const id = create(baseOrder({ paymentStatus: PaymentStatus.PAID }), [line('cigar-1', 2)]);
		expect(cancelUnpaidOrder(eq(orderTable.id, id))).toBe(false);
		expect(await stock('cigar-1')).toBe(3);
	});

	test('a retried checkout releases the earlier card order', async () => {
		create(baseOrder(), [line('cigar-1', 2)]);
		expect(cancelPendingCardOrders('cust-1')).toBe(true);
		expect(await stock('cigar-1')).toBe(5);
	});

	test('does not release bank transfer orders', async () => {
		create(baseOrder({ paymentMethod: PaymentMethod.BANK_TRANSFER }), [line('cigar-1', 2)]);
		expect(cancelPendingCardOrders('cust-1')).toBe(false);
		expect(await stock('cigar-1')).toBe(3);
	});

	test('expires only stale card orders', async () => {
		const stale = create(baseOrder({ createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }), [
			line('cigar-1', 1)
		]);
		const fresh = create(baseOrder(), [line('cigar-1', 1)]);
		expect(expireStaleCardOrders(40 * 60 * 1000)).toBe(1);
		expect((await order(stale)).orderStatus).toBe(OrderStatus.CANCELLED);
		expect((await order(fresh)).orderStatus).toBe(OrderStatus.PENDING);
		expect(await stock('cigar-1')).toBe(4);
	});
});

describe('markOrderPaid', () => {
	test('confirms the order once and ignores duplicate deliveries', async () => {
		const id = create(baseOrder({ stripeSessionId: 'cs_1' }), [line('cigar-1', 1)]);
		const first = markOrderPaid('cs_1');
		expect(first?.id).toBe(id);
		expect(markOrderPaid('cs_1')).toBeNull();
		const o = await order(id);
		expect(o.paymentStatus).toBe(PaymentStatus.PAID);
		expect(o.orderStatus).toBe(OrderStatus.CONFIRMED);
		expect(o.placedAt).not.toBeNull();
	});

	test('ignores unknown sessions', () => {
		expect(markOrderPaid('cs_unknown')).toBeNull();
	});

	test('takes the stock again when a cancelled order is paid anyway', async () => {
		const id = create(baseOrder({ stripeSessionId: 'cs_2' }), [line('cigar-1', 2)]);
		cancelUnpaidOrder(eq(orderTable.id, id));
		expect(await stock('cigar-1')).toBe(5);
		expect(markOrderPaid('cs_2')?.orderStatus).toBe(OrderStatus.CONFIRMED);
		expect(await stock('cigar-1')).toBe(3);
	});
});

describe('applyOrderStatus', () => {
	test('cancelling returns stock, reviving takes it again', async () => {
		const id = create(baseOrder({ paymentMethod: PaymentMethod.BANK_TRANSFER }), [
			line('cigar-1', 2)
		]);
		applyOrderStatus(id, OrderStatus.CANCELLED, PaymentStatus.PENDING);
		expect(await stock('cigar-1')).toBe(5);
		expect((await order(id)).cancelledAt).not.toBeNull();

		applyOrderStatus(id, OrderStatus.CONFIRMED, PaymentStatus.PAID);
		expect(await stock('cigar-1')).toBe(3);
	});

	test('reviving fails when the stock has been sold meanwhile', async () => {
		const id = create(baseOrder({ paymentMethod: PaymentMethod.BANK_TRANSFER }), [
			line('rum-1', 3)
		]);
		applyOrderStatus(id, OrderStatus.CANCELLED, PaymentStatus.PENDING);
		create(baseOrder(), [line('rum-1', 2)]);
		expect(() => applyOrderStatus(id, OrderStatus.PENDING, PaymentStatus.PENDING)).toThrow(
			InsufficientStockError
		);
		expect((await order(id)).orderStatus).toBe(OrderStatus.CANCELLED);
		expect(await stock('rum-1')).toBe(1);
	});

	test('status changes that keep the order active leave stock alone', async () => {
		const id = create(baseOrder({ paymentMethod: PaymentMethod.BANK_TRANSFER }), [
			line('cigar-1', 2)
		]);
		applyOrderStatus(id, OrderStatus.SHIPPED, PaymentStatus.PAID);
		expect(await stock('cigar-1')).toBe(3);
	});

	test('unknown order', () => {
		expect(applyOrderStatus('nope', OrderStatus.SHIPPED, PaymentStatus.PAID)).toBe(false);
	});
});
