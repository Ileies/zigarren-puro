import { beforeEach, describe, expect, test } from 'bun:test';
import db from '#lib/server/db/index.js';
import { productReviewTable } from '#lib/server/db/schema/index.js';
import { load as loadSearch } from '../src/routes/search/+page.server.ts';
import { load as loadShop } from '../src/routes/shop/+page.server.ts';
import { load as loadProduct } from '../src/routes/products/[id]/+page.server.ts';
import { load as loadCart } from '../src/routes/cart/+page.server.ts';
import { cartCookies, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

// These tests run the real queries against SQLite. The type checker cannot catch SQL
// that SQLite does not support (ILIKE, LEFT), so every route loader needs a smoke test.

const search = (query: string) =>
	loadSearch({ url: new URL(`http://localhost/search${query}`) } as never) as Promise<{
		products: { id: string }[];
	}>;

beforeEach(async () => {
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('search', () => {
	test('returns everything without a query', async () => {
		expect((await search('')).products.length).toBe(3);
	});

	test('matches name case-insensitively', async () => {
		const { products } = await search('?q=siglo');
		expect(products.map((p) => p.id)).toEqual(['cigar-1']);
	});

	test('matches description', async () => {
		const { products } = await search('?q=würzig');
		expect(products.map((p) => p.id)).toEqual(['cigar-1']);
	});

	test('treats % and _ in the query literally', async () => {
		expect((await search('?q=100%25')).products.map((p) => p.id)).toEqual(['cigar-2']);
		expect((await search('?q=natural_box')).products.map((p) => p.id)).toEqual(['cigar-2']);
		expect((await search('?q=%25')).products.map((p) => p.id)).toEqual(['cigar-2']);
		expect((await search('?q=_')).products.map((p) => p.id)).toEqual(['cigar-2']);
	});

	test('combines query, type and sort', async () => {
		const { products } = await search('?q=r&type=beverage&sort=price_desc');
		expect(products.map((p) => p.id)).toEqual(['rum-1']);
	});
});

describe('shop', () => {
	test('lists and filters products', async () => {
		const all = (await loadShop({
			url: new URL('http://localhost/shop?sort=price_desc')
		} as never)) as { products: { id: string }[] };
		expect(all.products.map((p) => p.id)).toEqual(['cigar-2', 'rum-1', 'cigar-1']);

		const cigars = (await loadShop({
			url: new URL('http://localhost/shop?type=cigar')
		} as never)) as { products: unknown[] };
		expect(cigars.products.length).toBe(2);
	});
});

describe('product page', () => {
	const open = (id: string, user: { id: string } | null = null) =>
		loadProduct({ params: { id }, locals: { user } } as never) as Promise<{
			product: { name: string };
			reviews: { reviewerName: string }[];
			reviewCount: number;
		}>;

	test('loads a product without reviews', async () => {
		const page = await open('cigar-1');
		expect(page.product.name).toBe('Siglo VI');
		expect(page.reviewCount).toBe(0);
	});

	test('loads reviews with the abbreviated reviewer name', async () => {
		await db
			.insert(productReviewTable)
			.values({ productId: 'cigar-1', customerId: 'cust-1', rating: 5, title: 'Gut' });
		const page = await open('cigar-1', { id: 'cust-1' });
		expect(page.reviews.map((r) => r.reviewerName)).toEqual(['Max M.']);
		expect(page.reviewCount).toBe(1);
	});

	test('unknown product is a 404', async () => {
		expect(open('missing')).rejects.toMatchObject({ status: 404 });
	});
});

describe('cart', () => {
	test('loads cart lines from the database', async () => {
		const { items } = (await loadCart({
			cookies: cartCookies([{ id: 'cigar-1', qty: 2 }])
		} as never)) as { items: { id: string; qty: number }[] };
		expect(items.map((i) => [i.id, i.qty])).toEqual([['cigar-1', 2]]);
	});
});
