import { expireOverdueOrders } from '#lib/server/orders.js';
import Logger from '#lib/server/Logger.js';

export const SWEEP_INTERVAL_MS = 15 * 60 * 1000;

const started = Symbol.for('zigarren-puro.orderSweep');
type Flagged = typeof globalThis & { [started]?: ReturnType<typeof setInterval> };

async function sweep() {
	try {
		const cancelled = expireOverdueOrders();
		if (cancelled > 0) await Logger.info('Cancelled overdue unpaid orders', { cancelled });
	} catch (error) {
		console.error('Order sweep failed', error);
	}
}

/**
 * Starts the periodic cancellation of overdue unpaid orders. Runs once right away, then every
 * `intervalMs`. Calling it again (dev server reloads) does nothing, so only one timer exists.
 */
export function startOrderSweep(intervalMs: number = SWEEP_INTERVAL_MS) {
	const scope = globalThis as Flagged;
	if (scope[started]) return;
	void sweep();
	const timer = setInterval(sweep, intervalMs);
	timer.unref?.();
	scope[started] = timer;
}
