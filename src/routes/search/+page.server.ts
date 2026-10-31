import type { PageServerLoad } from './$types';
import db from '#lib/server/db/index.js';
import { productTable, producerTable } from '#lib/server/db/schema/index.js';
import { asc, desc, eq, sql, or, and } from 'drizzle-orm';
import { ProductType } from '#lib/types.js';

const VALID_TYPES = Object.values(ProductType) as string[];

// SQLite has no ILIKE. LIKE is case-insensitive for ASCII only, which is acceptable here.
function containsPattern(q: string) {
	return `%${q.replace(/[\\%_]/g, '\\$&')}%`;
}

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() || '';
	const typeParam = url.searchParams.get('type');
	const sort = url.searchParams.get('sort') || 'name_asc';
	const activeType =
		typeParam && VALID_TYPES.includes(typeParam) ? (typeParam as ProductType) : null;

	let orderBy;
	switch (sort) {
		case 'name_desc':
			orderBy = desc(productTable.name);
			break;
		case 'price_asc':
			orderBy = asc(productTable.price);
			break;
		case 'price_desc':
			orderBy = desc(productTable.price);
			break;
		default:
			orderBy = asc(productTable.name);
	}

	const conditions = [];
	if (q) {
		const pattern = containsPattern(q);
		conditions.push(
			or(
				sql`${productTable.name} like ${pattern} escape '\\'`,
				sql`${productTable.description} like ${pattern} escape '\\'`
			)
		);
	}
	if (activeType) {
		conditions.push(eq(productTable.productType, activeType));
	}

	const products = await db
		.select({
			id: productTable.id,
			name: productTable.name,
			price: productTable.price,
			stock: productTable.stock,
			productType: productTable.productType,
			producerName: producerTable.name
		})
		.from(productTable)
		.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(orderBy);

	return { products, q, activeType, sort };
};
