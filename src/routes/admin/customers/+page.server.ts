import type { PageServerLoad } from './$types';
import db from '#lib/server/db/index.js';
import { customerTable, orderTable } from '#lib/server/db/schema/index.js';
import { asc, count, eq, or } from 'drizzle-orm';
import { likeContains } from '#lib/server/like.js';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search')?.trim() ?? '';

	const customers = await db
		.select({
			id: customerTable.id,
			email: customerTable.email,
			firstName: customerTable.firstName,
			lastName: customerTable.lastName,
			isVerified: customerTable.isVerified,
			createdAt: customerTable.createdAt,
			orderCount: count(orderTable.id)
		})
		.from(customerTable)
		.leftJoin(orderTable, eq(customerTable.id, orderTable.customerId))
		.where(
			search
				? or(
						likeContains(customerTable.email, search),
						likeContains(customerTable.firstName, search),
						likeContains(customerTable.lastName, search)
					)
				: undefined
		)
		.groupBy(customerTable.id)
		.orderBy(asc(customerTable.lastName), asc(customerTable.firstName));

	return { customers, search };
};
