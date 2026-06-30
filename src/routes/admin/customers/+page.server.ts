import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { customerTable, orderTable } from '$lib/server/db/schema';
import { asc, count, eq, ilike, or, sql } from 'drizzle-orm';

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
				? sql`lower(${customerTable.email}) like ${'%' + search.toLowerCase() + '%'}
				   or lower(${customerTable.firstName}) like ${'%' + search.toLowerCase() + '%'}
				   or lower(${customerTable.lastName}) like ${'%' + search.toLowerCase() + '%'}`
				: undefined
		)
		.groupBy(customerTable.id)
		.orderBy(asc(customerTable.lastName), asc(customerTable.firstName));

	return { customers, search };
};
