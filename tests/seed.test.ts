import { beforeEach, describe, expect, test } from 'bun:test';
import { count } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { productTable, producerTable } from '#lib/server/db/schema/index.js';
import { load as loadProduct } from '../src/routes/products/[id]/+page.server.ts';
import { load as loadSearch } from '../src/routes/search/+page.server.ts';
import { seed } from '../scripts/seed.ts';
import { resetDb } from './fixtures.ts';

const productPage = (id: string) =>
	loadProduct({ params: { id }, locals: {} } as never) as Promise<{
		product: { id: string };
		details: unknown;
	}>;
const search = (query: string) =>
	loadSearch({ url: new URL(`http://localhost/search${query}`) } as never) as Promise<{
		products: { id: string }[];
	}>;

beforeEach(async () => {
	await resetDb();
});

describe('dev seed', () => {
	test('creates the catalogue once and is idempotent', async () => {
		const first = seed();
		expect(first.producers).toBe(4);
		expect(first.products).toBe(12);
		expect(first.details).toBe(12);

		expect(seed()).toEqual({ producers: 0, products: 0, details: 0 });
		const [{ n }] = await db.select({ n: count() }).from(productTable);
		expect(n).toBe(12);
		const [{ p }] = await db.select({ p: count() }).from(producerTable);
		expect(p).toBe(4);
	});

	test('covers sold out, low stock and a long name', async () => {
		seed();
		const rows = await db.select().from(productTable);
		expect(rows.some((r) => r.stock === 0)).toBe(true);
		expect(rows.some((r) => r.stock > 0 && r.stock <= 2)).toBe(true);
		expect(rows.some((r) => r.name.length > 60)).toBe(true);
		expect(new Set(rows.map((r) => r.productType)).size).toBe(4);
		expect(new Set(rows.map((r) => r.sku)).size).toBe(rows.length);
	});

	test('every seeded product opens on its product page', async () => {
		seed();
		const rows = await db.select({ id: productTable.id }).from(productTable);
		for (const { id } of rows) {
			const result = await productPage(id);
			expect(result.product.id).toBe(id);
			expect(result.details).not.toBeNull();
		}
	});

	test('the seeded rows can be found through search', async () => {
		seed();
		const result = await search('?q=rum');
		expect(result.products.map((p) => p.id)).toContain('seed-rum');
	});
});
