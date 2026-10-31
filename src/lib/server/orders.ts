import { and, eq, lt, ne, sql, type SQL } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { orderTable, orderItemTable, productTable } from '#lib/server/db/schema/index.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '#lib/types.js';

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

		tx.update(orderTable)
			.set({
				orderStatus,
				paymentStatus,
				updatedAt: new Date(),
				...(isCancelled && !wasCancelled ? { cancelledAt: new Date() } : {})
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
