import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { orderTable, productTable } from '#lib/server/db/schema/index.js';
import {
	applyOrderStatus,
	createOrderReservingStock,
	expireOverdueOrders,
	paymentDeadline
} from '#lib/server/orders.js';
import { bankAccount } from '#lib/config.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '#lib/types.js';
import { baseOrder, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

const DAY = 24 * 60 * 60 * 1000;

const line = (productId: string, quantity: number) => ({
	productId,
	name: productId,
	sku: `SKU-${productId}`,
	vatRate: 0.19,
	quantity,
	unitPrice: 40
});

const place = (overrides: Partial<typeof orderTable.$inferInsert>, quantity = 1) =>
	createOrderReservingStock(
		baseOrder({ paymentMethod: PaymentMethod.BANK_TRANSFER, ...overrides }),
		[line('cigar-1', quantity)]
	).id;

const stock = async () =>
	(await db.select().from(productTable).where(eq(productTable.id, 'cigar-1')))[0].stock;
const order = async (id: string) =>
	(await db.select().from(orderTable).where(eq(orderTable.id, id)))[0];

beforeEach(async () => {
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('paymentDeadline', () => {
	test('is the configured number of days after the given moment', () => {
		const from = new Date('2026-11-01T10:00:00Z');
		expect(paymentDeadline(from).getTime() - from.getTime()).toBe(
			bankAccount.paymentDeadlineDays * DAY
		);
	});
});

describe('expireOverdueOrders', () => {
	test('cancels only unpaid orders past their deadline and returns their stock', async () => {
		const overdue = place({ paymentDueAt: new Date(Date.now() - DAY) }, 2);
		const open = place({ paymentDueAt: new Date(Date.now() + DAY) });
		expect(await stock()).toBe(2);

		expect(expireOverdueOrders()).toBe(1);

		const o = await order(overdue);
		expect(o.orderStatus).toBe(OrderStatus.CANCELLED);
		expect(o.paymentStatus).toBe(PaymentStatus.FAILED);
		expect(o.cancelledAt).not.toBeNull();
		expect((await order(open)).orderStatus).toBe(OrderStatus.PENDING);
		expect(await stock()).toBe(4);
	});

	test('leaves paid orders and orders without a deadline alone', async () => {
		const paid = place({
			paymentStatus: PaymentStatus.PAID,
			paymentDueAt: new Date(Date.now() - DAY)
		});
		const legacy = place({ paymentDueAt: null });
		expect(expireOverdueOrders()).toBe(0);
		expect((await order(paid)).orderStatus).toBe(OrderStatus.PENDING);
		expect((await order(legacy)).orderStatus).toBe(OrderStatus.PENDING);
		expect(await stock()).toBe(3);
	});

	test('is safe to run repeatedly', async () => {
		place({ paymentDueAt: new Date(Date.now() - DAY) }, 2);
		expect(expireOverdueOrders()).toBe(1);
		expect(expireOverdueOrders()).toBe(0);
		expect(await stock()).toBe(5);
	});

	test('uses the given moment instead of the clock', async () => {
		const due = new Date('2026-11-10T00:00:00Z');
		place({ paymentDueAt: due });
		expect(expireOverdueOrders(new Date('2026-11-09T00:00:00Z'))).toBe(0);
		expect(expireOverdueOrders(new Date('2026-11-11T00:00:00Z'))).toBe(1);
	});

	test('a revived unpaid order gets a fresh deadline and survives the next sweep', async () => {
		const id = place({ paymentDueAt: new Date(Date.now() - DAY) }, 1);
		expireOverdueOrders();
		applyOrderStatus(id, OrderStatus.PENDING, PaymentStatus.PENDING);

		const revived = await order(id);
		expect(revived.paymentDueAt!.getTime()).toBeGreaterThan(Date.now());
		expect(expireOverdueOrders()).toBe(0);
		expect((await order(id)).orderStatus).toBe(OrderStatus.PENDING);
	});
});
