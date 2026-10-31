import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	cigarDetailsTable,
	customerTable,
	orderItemTable,
	orderTable,
	productTable,
	toolDetailsTable
} from '#lib/server/db/schema/index.js';
import { OrderStatus, PaymentStatus, ProductType } from '#lib/types.js';
import {
	load as loadInventory,
	actions as inventoryActions
} from '../src/routes/admin/inventory/+page.server.ts';
import {
	actions as updateActions,
	load as loadProductEdit
} from '../src/routes/admin/inventory/[id]/+page.server.ts';
import { actions as createActions } from '../src/routes/admin/inventory/create/+page.server.ts';
import { load as loadOrders } from '../src/routes/admin/orders/+page.server.ts';
import {
	actions as orderActions,
	load as loadOrder
} from '../src/routes/admin/orders/[id]/+page.server.ts';
import { load as loadCustomers } from '../src/routes/admin/customers/+page.server.ts';
import { baseOrder, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

// Loaders and actions are called with the few event fields they read. They run the real
// queries against SQLite, so SQL that SQLite does not support fails here.

const formData = (fields: Record<string, string>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};

const event = (fields: Record<string, string> = {}, id = 'cigar-1') =>
	({ request: { formData: async () => formData(fields) }, params: { id } }) as never;

const url = (path: string) => ({ url: new URL(`http://localhost${path}`) }) as never;

/** What a thrown `redirect()` or `error()` carries. */
async function thrown(run: () => unknown) {
	try {
		await run();
	} catch (err) {
		return err as { status: number; location?: string };
	}
	throw new Error('expected a redirect or an error');
}

const ids = (rows: { id: string }[]) => rows.map((r) => r.id).sort();
const product = async (id: string) =>
	(await db.select().from(productTable).where(eq(productTable.id, id)))[0];

const baseFields = {
	name: 'Siglo VI Reserva',
	description: 'Neu abgefüllt',
	price: '42,50',
	stock: '7',
	sku: 'SKU-1',
	producerId: 'prod-1'
};
const cigarFields = {
	...baseFields,
	lengthMm: '150',
	ringGauge: '52',
	strength: 'full',
	wrapperType: 'Habano',
	countryOfOrigin: 'Kuba',
	agingTimeMonths: '24'
};

beforeEach(async () => {
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('admin inventory list', () => {
	const list = async (query = '') =>
		(await loadInventory(url(`/admin/inventory${query}`))) as unknown as {
			products: { id: string; productType: string }[];
		};

	test('lists everything, filters by type and searches name and SKU', async () => {
		expect(ids((await list()).products)).toEqual(['cigar-1', 'cigar-2', 'rum-1']);
		expect(ids((await list('?type=beverage')).products)).toEqual(['rum-1']);
		expect(ids((await list('?search=siglo')).products)).toEqual(['cigar-1']);
		expect(ids((await list('?search=SKU-3')).products)).toEqual(['rum-1']);
	});

	test('% and _ in the search match themselves', async () => {
		expect(ids((await list('?search=%25')).products)).toEqual(['cigar-2']);
		expect(ids((await list('?search=l_B')).products)).toEqual(['cigar-2']);
		expect(ids((await list('?search=%25_')).products)).toEqual([]);
		expect(ids((await list('?search=S_glo')).products)).toEqual([]);
	});

	test('sorts by price in both directions', async () => {
		expect((await list('?sort=price&order=desc')).products[0].id).toBe('cigar-2');
		expect((await list('?sort=price&order=asc')).products[0].id).toBe('cigar-1');
	});

	test('stores product types in lower case, which is what the list labels are keyed by', async () => {
		const types = (await list()).products.map((p) => p.productType);
		expect(types.every((t) => t === t.toLowerCase())).toBe(true);
	});

	test('updateStock sets the stock and refuses bad input', async () => {
		expect(await inventoryActions.updateStock(event({ id: 'cigar-1', stock: '9' }))).toEqual({
			success: true
		});
		expect((await product('cigar-1')).stock).toBe(9);

		for (const stock of ['-1', 'abc', '']) {
			expect(await inventoryActions.updateStock(event({ id: 'cigar-1', stock }))).toEqual({
				error: 'Ungültige Eingabe'
			});
		}
		expect((await product('cigar-1')).stock).toBe(9);
	});
});

describe('admin product update', () => {
	const update = (fields: Record<string, string>, id = 'cigar-1') =>
		updateActions.update(event(fields, id)) as Promise<{ success?: true; error?: string }>;

	const cigarDetails = async () =>
		(
			await db.select().from(cigarDetailsTable).where(eq(cigarDetailsTable.productId, 'cigar-1'))
		)[0];

	test('saves the product and its details together', async () => {
		expect(await update({ ...cigarFields, tags: 'Maduro, , Kubanisch' })).toEqual({
			success: true
		});

		expect(await product('cigar-1')).toMatchObject({
			name: 'Siglo VI Reserva',
			description: 'Neu abgefüllt',
			price: 42.5,
			stock: 7,
			tags: JSON.stringify(['Maduro', 'Kubanisch'])
		});
		expect(await cigarDetails()).toMatchObject({
			lengthMm: 150,
			ringGauge: 52,
			strength: 'full',
			wrapperType: 'Habano',
			agingTimeMonths: 24
		});
	});

	test('updates details that exist already', async () => {
		await update(cigarFields);
		await update({ ...cigarFields, strength: 'mild', agingTimeMonths: '' });
		expect(await cigarDetails()).toMatchObject({ strength: 'mild', agingTimeMonths: null });
	});

	test('incomplete details save nothing, not even the product fields', async () => {
		const before = await product('cigar-1');
		const result = await update({ ...cigarFields, wrapperType: '' });
		expect(result).toEqual({ error: 'Zigarren-Details unvollständig' });
		expect(await product('cigar-1')).toEqual(before);
		expect(await cigarDetails()).toBeUndefined();
	});

	test('numbers that are not numbers are refused', async () => {
		const before = await product('cigar-1');
		const cases: [Record<string, string>, string][] = [
			[{ ...cigarFields, lengthMm: 'lang' }, 'Zigarren-Details unvollständig'],
			[{ ...cigarFields, ringGauge: '0' }, 'Ungültige Maße oder Reifezeit'],
			[{ ...cigarFields, agingTimeMonths: '2 Jahre' }, 'Ungültige Maße oder Reifezeit'],
			[{ ...cigarFields, strength: 'extreme' }, 'Ungültige Stärke'],
			[{ ...cigarFields, price: 'teuer' }, 'Ungültiger Preis'],
			[{ ...cigarFields, price: '-1' }, 'Ungültiger Preis'],
			[{ ...cigarFields, stock: '-3' }, 'Ungültige Eingabe'],
			[{ ...cigarFields, stock: '2.5' }, 'Ungültige Eingabe'],
			[{ ...cigarFields, sku: '' }, 'Ungültige Eingabe']
		];
		for (const [fields, error] of cases) expect(await update(fields)).toEqual({ error });
		expect(await product('cigar-1')).toEqual(before);
		expect(await cigarDetails()).toBeUndefined();
	});

	test('a SKU that is taken rolls everything back', async () => {
		const before = await product('cigar-1');
		const result = await update({ ...cigarFields, sku: 'SKU-3' });
		expect(result.error).toContain('SKU');
		expect(await product('cigar-1')).toEqual(before);
		expect(await cigarDetails()).toBeUndefined();
	});

	test('an unknown producer is refused', async () => {
		const result = await update({ ...cigarFields, producerId: 'nobody' });
		expect(result).toEqual({ error: 'Hersteller nicht gefunden' });
		expect((await product('cigar-1')).name).toBe('Siglo VI');
	});

	test('an unknown product is a 404', async () => {
		expect((await thrown(() => update(cigarFields, 'gone'))).status).toBe(404);
	});

	test('beverages and accessories use their own details', async () => {
		const rum = {
			...baseFields,
			sku: 'SKU-3',
			volumeMl: '700',
			alcoholPercentage: '40,5',
			beverageType: 'rum',
			countryOfOrigin: 'Kuba',
			agingYears: '7',
			tastingNotes: 'Vanille'
		};
		expect(await update(rum, 'rum-1')).toEqual({ success: true });
		expect(await update({ ...rum, alcoholPercentage: '140' }, 'rum-1')).toEqual({
			error: 'Ungültige Menge, Alkoholgehalt oder Reifezeit'
		});
		expect(await update({ ...rum, beverageType: 'beer' }, 'rum-1')).toEqual({
			error: 'Ungültige Getränkeart'
		});

		await db
			.update(productTable)
			.set({ productType: ProductType.TOOL })
			.where(eq(productTable.id, 'cigar-2'));
		expect(
			await update(
				{ ...baseFields, sku: 'SKU-2', material: 'Zedernholz', brand: 'Xikar' },
				'cigar-2'
			)
		).toEqual({
			success: true
		});
		const [tool] = await db.select().from(toolDetailsTable);
		expect(tool).toMatchObject({
			productId: 'cigar-2',
			material: 'Zedernholz',
			specifications: null
		});
	});

	test('the edit page loads the product with its producers', async () => {
		const loaded = (await loadProductEdit({ params: { id: 'cigar-1' } } as never)) as unknown as {
			product: { name: string };
			producers: unknown[];
		};
		expect(loaded.product.name).toBe('Siglo VI');
		expect(loaded.producers).toHaveLength(1);
		expect((await thrown(() => loadProductEdit({ params: { id: 'gone' } } as never))).status).toBe(
			404
		);
	});
});

describe('admin product create', () => {
	const create = (fields: Record<string, string>) => createActions.create(event(fields));

	test('creates the product and its details and opens the edit page', async () => {
		const redirected = await thrown(() =>
			create({ ...cigarFields, productType: 'cigar', sku: 'NEW-1', name: 'Neue Zigarre' })
		);
		expect(redirected.status).toBe(303);

		const [created] = await db.select().from(productTable).where(eq(productTable.sku, 'NEW-1'));
		expect(redirected.location).toBe(`/admin/inventory/${created.id}`);
		expect(created).toMatchObject({ name: 'Neue Zigarre', price: 42.5, productType: 'cigar' });
		const [details] = await db.select().from(cigarDetailsTable);
		expect(details).toMatchObject({ productId: created.id, wrapperType: 'Habano' });
	});

	test('a failed detail check leaves no half-created product behind', async () => {
		const result = await create({
			...cigarFields,
			productType: 'cigar',
			sku: 'NEW-1',
			wrapperType: ''
		});
		expect(result).toEqual({ error: 'Zigarren-Details unvollständig' });
		expect(await db.select().from(productTable)).toHaveLength(3);
	});

	test('a SKU that is taken, an unknown type and an unknown producer create nothing', async () => {
		expect(await create({ ...cigarFields, productType: 'cigar', sku: 'SKU-2' })).toMatchObject({
			error: expect.stringContaining('SKU')
		});
		expect(await create({ ...cigarFields, productType: 'sofa', sku: 'NEW-1' })).toEqual({
			error: 'Ungültige Eingabe'
		});
		expect(
			await create({ ...cigarFields, productType: 'cigar', sku: 'NEW-1', producerId: 'x' })
		).toEqual({
			error: 'Hersteller nicht gefunden'
		});
		expect(await db.select().from(productTable)).toHaveLength(3);
		expect(await db.select().from(cigarDetailsTable)).toHaveLength(0);
	});

	test('a product of every type can be created', async () => {
		const forms: [string, Record<string, string>][] = [
			[
				'cigarillo',
				{ lengthMm: '100', ringGauge: '20', filterType: 'none', wrapperType: 'Sumatra' }
			],
			[
				'beverage',
				{
					volumeMl: '700',
					alcoholPercentage: '40',
					beverageType: 'whiskey',
					countryOfOrigin: 'Schottland'
				}
			],
			['tool', { material: 'Stahl', brand: 'Xikar' }]
		];
		for (const [productType, fields] of forms) {
			const redirected = await thrown(() =>
				create({ ...baseFields, ...fields, productType, sku: `NEW-${productType}` })
			);
			expect(redirected.status).toBe(303);
		}
		expect(await db.select().from(productTable)).toHaveLength(6);
	});
});

describe('admin orders', () => {
	async function seedOrder(id: string, overrides = {}, quantity = 2) {
		await db.insert(orderTable).values(baseOrder({ id, ...overrides }));
		await db.insert(orderItemTable).values({
			orderId: id,
			productId: 'cigar-1',
			quantity,
			unitPrice: 40,
			subtotal: 40 * quantity
		});
	}

	test('the list shows every order or those of one status, newest first', async () => {
		await seedOrder('old', { createdAt: new Date('2026-01-01') });
		await seedOrder('new', { createdAt: new Date('2026-02-01'), orderStatus: OrderStatus.SHIPPED });

		const all = (await loadOrders(url('/admin/orders'))) as unknown as {
			orders: { id: string; customerEmail: string }[];
			statusFilter: string | null;
		};
		expect(all.orders.map((o) => o.id)).toEqual(['new', 'old']);
		expect(all.orders[0].customerEmail).toBe('max@example.com');
		expect(all.statusFilter).toBeNull();

		const shipped = (await loadOrders(url('/admin/orders?status=shipped'))) as unknown as {
			orders: { id: string }[];
			statusFilter: string;
		};
		expect(shipped.orders.map((o) => o.id)).toEqual(['new']);
		expect(shipped.statusFilter).toBe('shipped');

		const bogus = (await loadOrders(url('/admin/orders?status=bogus'))) as unknown as {
			orders: unknown[];
		};
		expect(bogus.orders).toHaveLength(2);
	});

	test('the detail page loads items, products and addresses, an unknown order is a 404', async () => {
		await seedOrder('o1');
		const loaded = (await loadOrder({ params: { id: 'o1' } } as never)) as unknown as {
			order: {
				customer: { firstName: string };
				shippingAddress: { city: string };
				items: { quantity: number; product: { name: string } }[];
			};
		};
		expect(loaded.order.customer.firstName).toBe('Max');
		expect(loaded.order.shippingAddress.city).toBe('Köln');
		expect(loaded.order.items[0]).toMatchObject({ quantity: 2, product: { name: 'Siglo VI' } });
		expect((await thrown(() => loadOrder({ params: { id: 'gone' } } as never))).status).toBe(404);
	});

	describe('changing the status', () => {
		const change = (id: string, orderStatus: string, paymentStatus: string) =>
			orderActions.updateStatus(event({ orderStatus, paymentStatus }, id)) as Promise<{
				success?: true;
				error?: string;
			}>;
		const status = async (id: string) =>
			(await db.select().from(orderTable).where(eq(orderTable.id, id)))[0];

		test('saves a valid status and refuses unknown values', async () => {
			await seedOrder('o1');
			expect(await change('o1', OrderStatus.SHIPPED, PaymentStatus.PAID)).toEqual({
				success: true
			});
			expect(await status('o1')).toMatchObject({ orderStatus: 'shipped', paymentStatus: 'paid' });

			expect(await change('o1', 'lost', PaymentStatus.PAID)).toEqual({
				error: 'Ungültiger Status'
			});
			expect(await change('o1', OrderStatus.SHIPPED, 'maybe')).toEqual({
				error: 'Ungültiger Status'
			});
			expect((await status('o1')).orderStatus).toBe(OrderStatus.SHIPPED);
		});

		test('cancelling gives the stock back and reviving takes it again', async () => {
			await seedOrder('o1', {}, 2);
			await db.update(productTable).set({ stock: 3 }).where(eq(productTable.id, 'cigar-1'));

			await change('o1', OrderStatus.CANCELLED, PaymentStatus.FAILED);
			expect((await product('cigar-1')).stock).toBe(5);
			expect((await status('o1')).cancelledAt).not.toBeNull();

			await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID);
			expect((await product('cigar-1')).stock).toBe(3);
		});

		test('reviving fails with a message when the stock has been sold meanwhile', async () => {
			await seedOrder(
				'o1',
				{ orderStatus: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
				2
			);
			await db.update(productTable).set({ stock: 1 }).where(eq(productTable.id, 'cigar-1'));

			const result = await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID);
			expect(result.error).toContain('Siglo VI');
			expect((await status('o1')).orderStatus).toBe(OrderStatus.CANCELLED);
			expect((await product('cigar-1')).stock).toBe(1);
		});

		test('an unknown order', async () => {
			expect(await change('gone', OrderStatus.SHIPPED, PaymentStatus.PAID)).toEqual({
				error: 'Bestellung nicht gefunden'
			});
		});
	});
});

describe('admin customers', () => {
	beforeEach(async () => {
		await db.insert(customerTable).values({
			id: 'cust-2',
			email: 'eva_100%@example.com',
			firstName: 'Eva',
			lastName: 'Schmidt',
			birthDate: '1990-05-05'
		});
		await db.insert(orderTable).values([baseOrder({ id: 'a' }), baseOrder({ id: 'b' })]);
	});

	const list = async (query = '') =>
		(await loadCustomers(url(`/admin/customers${query}`))) as unknown as {
			customers: { id: string; orderCount: number }[];
		};

	test('lists customers with their order counts, sorted by name', async () => {
		const { customers } = await list();
		expect(customers.map((c) => [c.id, c.orderCount])).toEqual([
			['cust-1', 2],
			['cust-2', 0]
		]);
	});

	test('searches name and email, ignoring case', async () => {
		expect((await list('?search=MEIER')).customers.map((c) => c.id)).toEqual(['cust-1']);
		expect((await list('?search=eva')).customers.map((c) => c.id)).toEqual(['cust-2']);
		expect((await list('?search=example.com')).customers).toHaveLength(2);
	});

	test('% and _ in the search match themselves', async () => {
		expect((await list('?search=100%25')).customers.map((c) => c.id)).toEqual(['cust-2']);
		expect((await list('?search=a_1')).customers.map((c) => c.id)).toEqual(['cust-2']);
		expect((await list('?search=m_x')).customers).toHaveLength(0);
		expect((await list('?search=%25%25')).customers).toHaveLength(0);
	});
});
