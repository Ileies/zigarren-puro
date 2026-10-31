export const ORDER_NUMBER_PREFIX = 'ZP-';

/**
 * The order number customers and staff see (emails, bank transfer reference, phone calls).
 * Orders created before numbers existed have none and fall back to a short id.
 */
export function formatOrderNumber(order: { id: string; orderNumber?: number | null }) {
	if (order.orderNumber) return `${ORDER_NUMBER_PREFIX}${order.orderNumber}`;
	return order.id.slice(0, 8).toUpperCase();
}
