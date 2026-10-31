import type { PageServerLoad } from './$types';
import db from '#lib/server/db/index.js';
import { orderTable, customerTable } from '#lib/server/db/schema/index.js';
import { and, count, desc, eq, gte, inArray, lt, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { OrderStatus, PaymentStatus, ShippingMethod } from '#lib/types.js';
import { likeContains } from '#lib/server/like.js';
import { pageInfo, parsePage } from '#lib/server/pagination.js';

/** Shortcuts for the two things staff look for first. */
const PRESETS = {
	// Paid, but not on its way yet
	toShip: 'toShip',
	// Waiting for a payment that is past its deadline
	overdue: 'overdue'
} as const;
type Preset = (typeof PRESETS)[keyof typeof PRESETS];

const oneOf = <T extends string>(values: T[], value: string | null): T | '' =>
	values.includes(value as T) ? (value as T) : '';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const day = (value: string | null) => {
	if (!value || !DAY_PATTERN.test(value)) return '';
	return Number.isNaN(new Date(`${value}T00:00:00`).getTime()) ? '' : value;
};

export const load: PageServerLoad = async ({ url }) => {
	const param = (name: string) => url.searchParams.get(name);
	const filters = {
		q: (param('q') ?? '').trim(),
		status: oneOf(Object.values(OrderStatus), param('status')),
		payment: oneOf(Object.values(PaymentStatus), param('payment')),
		shipping: oneOf(Object.values(ShippingMethod), param('shipping')),
		preset: oneOf<Preset>(Object.values(PRESETS), param('preset')),
		from: day(param('from')),
		to: day(param('to'))
	};

	const conditions: (SQL | undefined)[] = [];

	if (filters.q) {
		// "ZP-10001" and "10001" find the order, anything else is looked up in name and email
		const number = /^(?:zp-?)?(\d+)$/i.exec(filters.q)?.[1];
		conditions.push(
			or(
				number ? eq(orderTable.orderNumber, Number(number)) : undefined,
				likeContains(customerTable.email, filters.q),
				likeContains(sql`${customerTable.firstName} || ' ' || ${customerTable.lastName}`, filters.q)
			)
		);
	}
	if (filters.status) conditions.push(eq(orderTable.orderStatus, filters.status));
	if (filters.payment) conditions.push(eq(orderTable.paymentStatus, filters.payment));
	if (filters.shipping) conditions.push(eq(orderTable.shippingMethod, filters.shipping));
	if (filters.from)
		conditions.push(gte(orderTable.createdAt, new Date(`${filters.from}T00:00:00`)));
	if (filters.to) {
		// The end day counts as a whole day
		const end = new Date(`${filters.to}T00:00:00`);
		end.setDate(end.getDate() + 1);
		conditions.push(lt(orderTable.createdAt, end));
	}
	if (filters.preset === PRESETS.toShip) {
		conditions.push(
			eq(orderTable.paymentStatus, PaymentStatus.PAID),
			inArray(orderTable.orderStatus, [OrderStatus.CONFIRMED, OrderStatus.PROCESSING])
		);
	}
	if (filters.preset === PRESETS.overdue) {
		conditions.push(
			eq(orderTable.orderStatus, OrderStatus.PENDING),
			eq(orderTable.paymentStatus, PaymentStatus.PENDING),
			lt(orderTable.paymentDueAt, new Date())
		);
	}

	const where = and(...conditions);
	const counted = db
		.select({ total: count() })
		.from(orderTable)
		.leftJoin(customerTable, eq(orderTable.customerId, customerTable.id))
		.where(where)
		.get();
	const paging = pageInfo(parsePage(url), counted?.total ?? 0);

	const orders = await db
		.select({
			id: orderTable.id,
			orderNumber: orderTable.orderNumber,
			orderStatus: orderTable.orderStatus,
			paymentStatus: orderTable.paymentStatus,
			paymentDueAt: orderTable.paymentDueAt,
			shippingMethod: orderTable.shippingMethod,
			totalAmount: orderTable.totalAmount,
			createdAt: orderTable.createdAt,
			placedAt: orderTable.placedAt,
			customerFirstName: customerTable.firstName,
			customerLastName: customerTable.lastName,
			customerEmail: customerTable.email
		})
		.from(orderTable)
		.leftJoin(customerTable, eq(orderTable.customerId, customerTable.id))
		.where(where)
		.orderBy(desc(orderTable.createdAt), desc(orderTable.orderNumber))
		.limit(paging.pageSize)
		.offset(paging.offset);

	return { orders, filters, paging };
};
