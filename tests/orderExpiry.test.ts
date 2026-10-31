import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { orderTable, productTable } from '#lib/server/db/schema/index.js';
import {
	PAYMENT_REMINDER_LEAD_MS,
	applyOrderStatus,
	claimPaymentReminders,
	createOrderReservingStock,
	expireOverdueOrders,
	loadOrderNotice,
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

		expect(expireOverdueOrders()).toEqual([overdue]);

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
		expect(expireOverdueOrders()).toEqual([]);
		expect((await order(paid)).orderStatus).toBe(OrderStatus.PENDING);
		expect((await order(legacy)).orderStatus).toBe(OrderStatus.PENDING);
		expect(await stock()).toBe(3);
	});

	test('is safe to run repeatedly', async () => {
		place({ paymentDueAt: new Date(Date.now() - DAY) }, 2);
		expect(expireOverdueOrders()).toHaveLength(1);
		expect(expireOverdueOrders()).toHaveLength(0);
		expect(await stock()).toBe(5);
	});

	test('uses the given moment instead of the clock', async () => {
		const due = new Date('2026-11-10T00:00:00Z');
		place({ paymentDueAt: due });
		expect(expireOverdueOrders(new Date('2026-11-09T00:00:00Z'))).toHaveLength(0);
		expect(expireOverdueOrders(new Date('2026-11-11T00:00:00Z'))).toHaveLength(1);
	});

	test('a revived unpaid order gets a fresh deadline and survives the next sweep', async () => {
		const id = place({ paymentDueAt: new Date(Date.now() - DAY) }, 1);
		expireOverdueOrders();
		applyOrderStatus(id, OrderStatus.PENDING, PaymentStatus.PENDING);

		const revived = await order(id);
		expect(revived.paymentDueAt!.getTime()).toBeGreaterThan(Date.now());
		expect(expireOverdueOrders()).toHaveLength(0);
		expect((await order(id)).orderStatus).toBe(OrderStatus.PENDING);
	});
});

describe('claimPaymentReminders', () => {
	const soon = () => new Date(Date.now() + PAYMENT_REMINDER_LEAD_MS / 2);

	test('picks an unpaid order close to its deadline, once', async () => {
		const id = place({ paymentDueAt: soon() });
		expect(claimPaymentReminders()).toEqual([id]);
		expect((await order(id)).paymentReminderSentAt).not.toBeNull();
		expect(claimPaymentReminders()).toEqual([]);
	});

	test('skips orders with a distant, passed or missing deadline', () => {
		place({ paymentDueAt: new Date(Date.now() + 10 * DAY) });
		place({ paymentDueAt: new Date(Date.now() - DAY) });
		place({ paymentDueAt: null });
		expect(claimPaymentReminders()).toEqual([]);
	});

	test('skips paid, cancelled and card orders', () => {
		place({ paymentDueAt: soon(), paymentStatus: PaymentStatus.PAID });
		place({ paymentDueAt: soon(), orderStatus: OrderStatus.CANCELLED });
		place({ paymentDueAt: soon(), paymentMethod: PaymentMethod.CREDIT_CARD });
		expect(claimPaymentReminders()).toEqual([]);
	});

	test('an order that just expired is cancelled and not reminded', () => {
		place({ paymentDueAt: new Date(Date.now() - 1000) });
		expect(expireOverdueOrders()).toHaveLength(1);
		expect(claimPaymentReminders()).toEqual([]);
	});

	test('a revived order can be reminded again for its new deadline', async () => {
		const id = place({ paymentDueAt: soon() });
		claimPaymentReminders();
		applyOrderStatus(id, OrderStatus.CANCELLED, PaymentStatus.FAILED);
		applyOrderStatus(id, OrderStatus.PENDING, PaymentStatus.PENDING);
		expect((await order(id)).paymentReminderSentAt).toBeNull();
		// The fresh deadline is a full period away, so move the clock into the reminder window
		const later = new Date(Date.now() + bankAccount.paymentDeadlineDays * DAY - 1000);
		expect(claimPaymentReminders(later)).toEqual([id]);
	});
});

describe('loadOrderNotice', () => {
	test('returns the order with the customer contact data', () => {
		const id = place({ paymentDueAt: new Date(Date.now() + DAY) });
		expect(loadOrderNotice(id)).toMatchObject({
			id,
			customerId: 'cust-1',
			email: 'max@example.com',
			firstName: 'Max'
		});
		expect(loadOrderNotice('missing')).toBeUndefined();
	});
});
