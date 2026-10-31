import { claimPaymentReminders, expireOverdueOrders, loadOrderNotice } from '#lib/server/orders.js';
import { sendOrderCancelledEmail, sendPaymentReminderEmail } from '#lib/server/functions.js';
import Logger from '#lib/server/Logger.js';

export const SWEEP_INTERVAL_MS = 15 * 60 * 1000;

const started = Symbol.for('zigarren-puro.orderSweep');
type Flagged = typeof globalThis & { [started]?: ReturnType<typeof setInterval> };

/** Sends one email per order. A failing email is logged and does not stop the others. */
async function notify(
	orderIds: string[],
	send: (notice: NonNullable<ReturnType<typeof loadOrderNotice>>) => Promise<void>
) {
	for (const id of orderIds) {
		try {
			const notice = loadOrderNotice(id);
			if (notice) await send(notice);
		} catch (error) {
			console.error('Order email failed', id, error);
		}
	}
}

async function sweep() {
	try {
		// Cancel first, so an order that just expired is not reminded as well
		const cancelled = expireOverdueOrders();
		const reminded = claimPaymentReminders();
		if (cancelled.length > 0) {
			await Logger.info('Cancelled overdue unpaid orders', { cancelled: cancelled.length });
		}
		if (reminded.length > 0) {
			await Logger.info('Sending payment reminders', { reminded: reminded.length });
		}
		await notify(cancelled, sendOrderCancelledEmail);
		await notify(reminded, sendPaymentReminderEmail);
	} catch (error) {
		console.error('Order sweep failed', error);
	}
}

/**
 * Starts the periodic cancellation of overdue unpaid orders and the payment reminders before
 * the deadline. Runs once right away, then every `intervalMs`. Calling it again (dev server
 * reloads) does nothing, so only one timer exists.
 */
export function startOrderSweep(intervalMs: number = SWEEP_INTERVAL_MS) {
	const scope = globalThis as Flagged;
	if (scope[started]) return;
	void sweep();
	const timer = setInterval(sweep, intervalMs);
	timer.unref?.();
	scope[started] = timer;
}
