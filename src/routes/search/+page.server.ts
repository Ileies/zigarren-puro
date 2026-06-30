import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { productTable, producerTable } from '$lib/server/db/schema';
import { asc, desc, eq, ilike, or, and } from 'drizzle-orm';
import { ProductType } from '$lib/types';

const VALID_TYPES = Object.values(ProductType) as string[];

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
		conditions.push(
			or(ilike(productTable.name, `%${q}%`), ilike(productTable.description, `%${q}%`))
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
