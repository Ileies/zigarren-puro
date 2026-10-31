import { and, eq, gt, isNull, lt, lte, ne, sql, type SQL } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	customerTable,
	orderTable,
	orderItemTable,
	productTable
} from '#lib/server/db/schema/index.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '#lib/types.js';
import { bankAccount } from '#lib/config.js';

export class InsufficientStockError extends Error {
	constructor(public productName: string) {
		super(`Insufficient stock for "${productName}"`);
	}
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type NewOrder = typeof orderTable.$inferInsert;
export type OrderLine = {
	productId: string;
	name: string;
	sku: string;
	vatRate: number;
	quantity: number;
	unitPrice: number;
};

export const FIRST_ORDER_NUMBER = 10001;

const DAY_MS = 24 * 60 * 60 * 1000;

/** How long before the deadline the payment reminder goes out (never more than half the period). */
export const PAYMENT_REMINDER_LEAD_MS = Math.min(2, bankAccount.paymentDeadlineDays / 2) * DAY_MS;

/** The moment an unpaid bank-transfer order created at `from` expires. */
export function paymentDeadline(from: Date = new Date()): Date {
	return new Date(from.getTime() + bankAccount.paymentDeadlineDays * DAY_MS);
}

/** What the unpaid-order emails need to know about an order and its customer. */
export type OrderNotice = {
	id: string;
	orderNumber: number | null;
	customerId: string;
	email: string;
	firstName: string;
	totalAmount: number;
	paymentDueAt: Date | null;
};

export function loadOrderNotice(orderId: string): OrderNotice | undefined {
	return db
		.select({
			id: orderTable.id,
			orderNumber: orderTable.orderNumber,
			customerId: orderTable.customerId,
			email: customerTable.email,
			firstName: customerTable.firstName,
			totalAmount: orderTable.totalAmount,
			paymentDueAt: orderTable.paymentDueAt
		})
		.from(orderTable)
		.innerJoin(customerTable, eq(orderTable.customerId, customerTable.id))
		.where(eq(orderTable.id, orderId))
		.get();
}

function nextOrderNumber(tx: Tx) {
	const row = tx
		.select({ last: sql<number | null>`max(${orderTable.orderNumber})` })
		.from(orderTable)
		.get();
	return (row?.last ?? FIRST_ORDER_NUMBER - 1) + 1;
}

/** Decrements stock for one product, failing when fewer than `quantity` units remain. */
function takeStock(tx: Tx, productId: string, name: string, quantity: number) {
	const updated = tx
		.update(productTable)
		.set({ stock: sql`${productTable.stock} - ${quantity}` })
		.where(and(eq(productTable.id, productId), sql`${productTable.stock} >= ${quantity}`))
		.returning({ id: productTable.id })
		.all();
	if (updated.length === 0) throw new InsufficientStockError(name);
}

function returnStock(tx: Tx, orderId: string) {
	const items = tx.select().from(orderItemTable).where(eq(orderItemTable.orderId, orderId)).all();
	for (const item of items) {
		tx.update(productTable)
			.set({ stock: sql`${productTable.stock} + ${item.quantity}` })
			.where(eq(productTable.id, item.productId))
			.run();
	}
}

/**
 * Creates an order with its items and takes the stock in one transaction. The order gets the
 * next sequential order number and every item keeps a snapshot of the product.
 * Throws `InsufficientStockError` (and changes nothing) if any line cannot be served.
 */
export function createOrderReservingStock(
	values: Omit<NewOrder, 'orderNumber'>,
	lines: OrderLine[]
): { id: string; orderNumber: number } {
	return db.transaction((tx) => {
		for (const line of lines) takeStock(tx, line.productId, line.name, line.quantity);

		const order = tx
			.insert(orderTable)
			.values({ ...values, orderNumber: nextOrderNumber(tx) })
			.returning({ id: orderTable.id, orderNumber: orderTable.orderNumber })
			.get();
		tx.insert(orderItemTable)
			.values(
				lines.map((line) => ({
					orderId: order.id,
					productId: line.productId,
					productName: line.name,
					sku: line.sku,
					vatRate: line.vatRate,
					quantity: line.quantity,
					unitPrice: line.unitPrice,
					subtotal: line.unitPrice * line.quantity
				}))
			)
			.run();
		return { id: order.id, orderNumber: order.orderNumber! };
	});
}

/**
 * Cancels an order that is still unpaid and gives its stock back.
 * Safe to call repeatedly: only the first call that finds the order unpaid has an effect.
 */
export function cancelUnpaidOrder(where: SQL): boolean {
	return db.transaction((tx) => {
		const cancelled = tx
			.update(orderTable)
			.set({
				orderStatus: OrderStatus.CANCELLED,
				paymentStatus: PaymentStatus.FAILED,
				cancelledAt: new Date(),
				updatedAt: new Date()
			})
			.where(
				and(
					where,
					eq(orderTable.orderStatus, OrderStatus.PENDING),
					eq(orderTable.paymentStatus, PaymentStatus.PENDING)
				)
			)
			.returning({ id: orderTable.id })
			.all();
		for (const { id } of cancelled) returnStock(tx, id);
		return cancelled.length > 0;
	});
}

/** Cancels all unpaid card orders of a customer, so a retried checkout does not hold stock twice. */
export function cancelPendingCardOrders(customerId: string) {
	return cancelUnpaidOrder(
		and(
			eq(orderTable.customerId, customerId),
			eq(orderTable.paymentMethod, PaymentMethod.CREDIT_CARD)
		)!
	);
}

/** Cancels card orders whose payment session must have expired by now. */
export function expireStaleCardOrders(maxAgeMs: number) {
	const cutoff = new Date(Date.now() - maxAgeMs);
	const stale = db
		.select({ id: orderTable.id })
		.from(orderTable)
		.where(
			and(
				eq(orderTable.paymentMethod, PaymentMethod.CREDIT_CARD),
				eq(orderTable.orderStatus, OrderStatus.PENDING),
				eq(orderTable.paymentStatus, PaymentStatus.PENDING),
				lt(orderTable.createdAt, cutoff)
			)
		)
		.all();
	for (const { id } of stale) cancelUnpaidOrder(eq(orderTable.id, id));
	return stale.length;
}

/**
 * Cancels every unpaid order whose payment deadline has passed and gives its stock back.
 * Orders without a deadline are left alone. Returns the ids of the orders it cancelled.
 */
export function expireOverdueOrders(now: Date = new Date()): string[] {
	const overdue = db
		.select({ id: orderTable.id })
		.from(orderTable)
		.where(
			and(
				eq(orderTable.orderStatus, OrderStatus.PENDING),
				eq(orderTable.paymentStatus, PaymentStatus.PENDING),
				lt(orderTable.paymentDueAt, now)
			)
		)
		.all();
	const cancelled: string[] = [];
	for (const { id } of overdue) {
		if (cancelUnpaidOrder(eq(orderTable.id, id))) cancelled.push(id);
	}
	return cancelled;
}

/**
 * Picks the unpaid bank-transfer orders that are close to their deadline and have not been
 * reminded yet, and marks them as reminded. Each order is returned once per deadline, even if
 * several processes run this at the same time. Overdue orders are not reminded.
 */
export function claimPaymentReminders(now: Date = new Date()): string[] {
	const candidates = db
		.select({ id: orderTable.id })
		.from(orderTable)
		.where(
			and(
				eq(orderTable.orderStatus, OrderStatus.PENDING),
				eq(orderTable.paymentStatus, PaymentStatus.PENDING),
				eq(orderTable.paymentMethod, PaymentMethod.BANK_TRANSFER),
				isNull(orderTable.paymentReminderSentAt),
				gt(orderTable.paymentDueAt, now),
				lte(orderTable.paymentDueAt, new Date(now.getTime() + PAYMENT_REMINDER_LEAD_MS))
			)
		)
		.all();
	const claimed: string[] = [];
	for (const { id } of candidates) {
		const row = db
			.update(orderTable)
			.set({ paymentReminderSentAt: now })
			.where(and(eq(orderTable.id, id), isNull(orderTable.paymentReminderSentAt)))
			.returning({ id: orderTable.id })
			.get();
		if (row) claimed.push(row.id);
	}
	return claimed;
}

/**
 * Applies an admin status change and keeps stock consistent:
 * cancelling returns the stock, reviving a cancelled order takes it again.
 * Throws `InsufficientStockError` when a revived order can no longer be served.
 */
export function applyOrderStatus(
	orderId: string,
	orderStatus: OrderStatus,
	paymentStatus: PaymentStatus
): boolean {
	return db.transaction((tx) => {
		const order = tx.select().from(orderTable).where(eq(orderTable.id, orderId)).get();
		if (!order) return false;

		const wasCancelled = order.orderStatus === OrderStatus.CANCELLED;
		const isCancelled = orderStatus === OrderStatus.CANCELLED;

		if (!wasCancelled && isCancelled) {
			returnStock(tx, orderId);
		} else if (wasCancelled && !isCancelled) {
			const items = tx
				.select({
					productId: orderItemTable.productId,
					quantity: orderItemTable.quantity,
					name: productTable.name
				})
				.from(orderItemTable)
				.innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
				.where(eq(orderItemTable.orderId, orderId))
				.all();
			for (const item of items) takeStock(tx, item.productId, item.name, item.quantity);
		}

		// A revived unpaid order gets a fresh deadline, otherwise the sweep would cancel it again
		const revivedUnpaid = wasCancelled && !isCancelled && paymentStatus === PaymentStatus.PENDING;

		tx.update(orderTable)
			.set({
				orderStatus,
				paymentStatus,
				updatedAt: new Date(),
				...(isCancelled && !wasCancelled ? { cancelledAt: new Date() } : {}),
				...(revivedUnpaid ? { paymentDueAt: paymentDeadline(), paymentReminderSentAt: null } : {})
			})
			.where(eq(orderTable.id, orderId))
			.run();
		return true;
	});
}

/**
 * Marks a card order as paid. Returns the order only for the first call, so duplicate
 * webhook deliveries do not trigger a second confirmation email.
 */
export function markOrderPaid(sessionId: string) {
	return db.transaction((tx) => {
		const order = tx
			.select()
			.from(orderTable)
			.where(eq(orderTable.stripeSessionId, sessionId))
			.get();
		if (!order || order.paymentStatus === PaymentStatus.PAID) return null;

		// The order was cancelled (for example superseded by a newer checkout) but the customer
		// paid anyway. Take the stock again where possible, the payment has to be honoured.
		if (order.orderStatus === OrderStatus.CANCELLED) {
			const items = tx
				.select({ productId: orderItemTable.productId, quantity: orderItemTable.quantity })
				.from(orderItemTable)
				.where(eq(orderItemTable.orderId, order.id))
				.all();
			for (const item of items) {
				tx.update(productTable)
					.set({ stock: sql`max(${productTable.stock} - ${item.quantity}, 0)` })
					.where(eq(productTable.id, item.productId))
					.run();
			}
		}

		return tx
			.update(orderTable)
			.set({
				paymentStatus: PaymentStatus.PAID,
				orderStatus: OrderStatus.CONFIRMED,
				placedAt: new Date(),
				cancelledAt: null,
				updatedAt: new Date()
			})
			.where(and(eq(orderTable.id, order.id), ne(orderTable.paymentStatus, PaymentStatus.PAID)))
			.returning()
			.get();
	});
}
