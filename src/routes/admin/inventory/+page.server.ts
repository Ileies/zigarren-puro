import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { productTable, producerTable } from '#lib/server/db/schema/index.js';
import { asc, count, desc, eq, gt, lte, or, and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { likeContains } from '#lib/server/like.js';
import { pageInfo, parsePage } from '#lib/server/pagination.js';
import { lowStockThreshold } from '#lib/config.js';
import { ProductType } from '#lib/types.js';

const SORT_COLUMNS = {
	name: productTable.name,
	sku: productTable.sku,
	price: productTable.price,
	stock: productTable.stock
};
type SortKey = keyof typeof SORT_COLUMNS;

const STOCK_FILTERS = ['low', 'out'] as const;
type StockFilter = (typeof STOCK_FILTERS)[number];

export const load: PageServerLoad = async ({ url }) => {
	const param = (name: string) => url.searchParams.get(name);
	const type = Object.values(ProductType).find((t) => t === param('type')) ?? '';
	const stock: StockFilter | '' = STOCK_FILTERS.find((s) => s === param('stock')) ?? '';
	const search = (param('search') ?? '').trim();
	const sort: SortKey =
		(Object.keys(SORT_COLUMNS) as SortKey[]).find((k) => k === param('sort')) ?? 'name';
	const order = param('order') === 'desc' ? 'desc' : 'asc';

	const conditions: (SQL | undefined)[] = [];
	if (search) {
		conditions.push(
			or(likeContains(productTable.name, search), likeContains(productTable.sku, search))
		);
	}
	if (type) conditions.push(eq(productTable.productType, type));
	// "low" is everything that is not sold out yet but at or under the warning level
	if (stock === 'out') conditions.push(eq(productTable.stock, 0));
	if (stock === 'low') {
		conditions.push(gt(productTable.stock, 0), lte(productTable.stock, lowStockThreshold));
	}

	const where = and(...conditions);
	const total = db.select({ total: count() }).from(productTable).where(where).get()?.total ?? 0;
	const paging = pageInfo(parsePage(url), total);

	const column = SORT_COLUMNS[sort];
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
		.where(where)
		// The id keeps the order stable when the sorted values are equal, so no row skips a page
		.orderBy(order === 'desc' ? desc(column) : asc(column), asc(productTable.id))
		.limit(paging.pageSize)
		.offset(paging.offset);

	return { products, filters: { search, type, stock }, sort, order, paging };
};

export const actions: Actions = {
	updateStock: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const stock = parseInt(data.get('stock') as string, 10);

		if (!id || isNaN(stock) || stock < 0) {
			return { error: 'Ungültige Eingabe' };
		}

		const updated = await db
			.update(productTable)
			.set({ stock, updatedAt: new Date() })
			.where(eq(productTable.id, id))
			.returning({ id: productTable.id });
		if (updated.length === 0) return { error: 'Produkt nicht gefunden' };

		return { success: true };
	}
};
