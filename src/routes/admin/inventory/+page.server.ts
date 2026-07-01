import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { productTable, producerTable } from '$lib/server/db/schema';
import { asc, eq, desc, or, like, and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { ProductType } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	const search = (url.searchParams.get('search') || '').trim();
	const filterType = (url.searchParams.get('type') || '') as ProductType | '';
	const sortBy = url.searchParams.get('sort') || 'name';
	const sortOrder = url.searchParams.get('order') || 'asc';

	const conditions: SQL[] = [];

	if (search) {
		const cond = or(like(productTable.name, `%${search}%`), like(productTable.sku, `%${search}%`));
		if (cond) conditions.push(cond);
	}

	if (filterType) {
		conditions.push(eq(productTable.productType, filterType));
	}

	const orderColumn =
		sortBy === 'price'
			? productTable.price
			: sortBy === 'stock'
				? productTable.stock
				: sortBy === 'sku'
					? productTable.sku
					: productTable.name;

	const orderFn = sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn);

	const products = await db
		.select({
			id: productTable.id,
			name: productTable.name,
			sku: productTable.sku,
			price: productTable.price,
			stock: productTable.stock,
			productType: productTable.productType,
			producerName: producerTable.name
		})
		.from(productTable)
		.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(orderFn);

	return { products, search, filterType, sortBy, sortOrder };
};

export const actions: Actions = {
	updateStock: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const stock = parseInt(data.get('stock') as string, 10);

		if (!id || isNaN(stock) || stock < 0) {
			return { error: 'Ungültige Eingabe' };
		}

		await db
			.update(productTable)
			.set({ stock, updatedAt: new Date() })
			.where(eq(productTable.id, id));

		return { success: true };
	}
};
