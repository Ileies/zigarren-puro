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
import { load as loadCustomers } from '../src/routes/admin/customers/+page.server.ts';
import { baseOrder, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';
import { mailBroken, resetMail, sent } from './mail.ts';

// The order page sends mail, which needs the SvelteKit runtime. `mail.ts` replaces the sender.
const { actions: orderActions, load: loadOrder } =
	await import('../src/routes/admin/orders/[id]/+page.server.ts');

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
	resetMail();
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('admin inventory list', () => {
	const list = async (query = '') =>
		(await loadInventory(url(`/admin/inventory${query}`))) as unknown as {
			products: { id: string; productType: string }[];
			filters: { search: string; type: string; stock: string };
			sort: string;
			order: string;
			paging: { page: number; pages: number; total: number };
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

	test('an unknown type, stock filter or sort is ignored', async () => {
		expect(await list('?type=pipe&stock=lots&sort=secret&order=sideways')).toMatchObject({
			filters: { type: '', stock: '' },
			sort: 'name',
			order: 'asc'
		});
		expect((await list('?type=pipe&stock=lots')).products).toHaveLength(3);
	});

	test('the stock filter finds low stock and sold out products', async () => {
		// The warning level is 4: Reserva Rum has 3, Siglo VI has 5, the box is sold out
		expect(ids((await list('?stock=low')).products)).toEqual(['rum-1']);
		expect(ids((await list('?stock=out')).products)).toEqual(['cigar-2']);
		expect(ids((await list('?stock=out&type=beverage')).products)).toEqual([]);
	});

	describe('pages', () => {
		beforeEach(async () => {
			// 30 products with the same price: the order inside the sort has to stay stable
			await db.insert(productTable).values(
				Array.from({ length: 30 }, (_, i) => ({
					id: `bulk-${i}`,
					producerId: 'prod-1',
					name: `Bulk ${i}`,
					price: 10,
					stock: 10,
					sku: `BULK-${i}`,
					productType: ProductType.TOOL
				}))
			);
		});

		test('shows 25 per page and every product exactly once', async () => {
			const first = await list('?sort=price');
			const second = await list('?sort=price&page=2');
			expect(first.products).toHaveLength(25);
			expect(first.paging).toMatchObject({ page: 1, pages: 2, total: 33 });
			expect(second.products).toHaveLength(8);
			expect(new Set([...first.products, ...second.products].map((p) => p.id)).size).toBe(33);
		});

		test('a page beyond the last one shows the last, a malformed one the first', async () => {
			expect((await list('?page=99')).paging.page).toBe(2);
			for (const page of ['0', '-3', 'abc', '1.5']) {
				expect((await list(`?page=${page}`)).paging.page).toBe(1);
			}
		});

		test('the count and the pages follow the filters', async () => {
			const tools = await list('?type=tool');
			expect(tools.paging).toMatchObject({ total: 30, pages: 2 });
			expect((await list('?search=Bulk 1')).paging.total).toBe(11);
		});
	});

	test('updateStock refuses an unknown product', async () => {
		expect(await inventoryActions.updateStock(event({ id: 'gone', stock: '4' }))).toEqual({
			error: 'Produkt nicht gefunden'
		});
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

	describe('the list', () => {
		const list = async (query = '') =>
			(await loadOrders(url(`/admin/orders${query}`))) as unknown as {
				orders: { id: string; customerEmail: string }[];
				filters: Record<string, string>;
				paging: { page: number; pages: number; total: number };
			};
		const listed = async (query = '') => (await list(query)).orders.map((o) => o.id);

		test('shows every order or those of one status, newest first', async () => {
			await seedOrder('old', { createdAt: new Date('2026-01-01') });
			await seedOrder('new', {
				createdAt: new Date('2026-02-01'),
				orderStatus: OrderStatus.SHIPPED
			});

			const all = await list();
			expect(all.orders.map((o) => o.id)).toEqual(['new', 'old']);
			expect(all.orders[0].customerEmail).toBe('max@example.com');
			expect(all.filters.status).toBe('');

			const shipped = await list('?status=shipped');
			expect(shipped.orders.map((o) => o.id)).toEqual(['new']);
			expect(shipped.filters.status).toBe('shipped');

			expect(await listed('?status=bogus&payment=bogus&shipping=bogus&preset=bogus')).toHaveLength(
				2
			);
		});

		describe('search and filters', () => {
			beforeEach(async () => {
				await db.insert(customerTable).values({
					id: 'cust-2',
					email: 'eva_100%@example.com',
					firstName: 'Eva',
					lastName: 'Schmidt',
					birthDate: '1990-05-05'
				});
				await seedOrder('a', { orderNumber: 10001, createdAt: new Date('2026-03-10T12:00:00') });
				await seedOrder('b', {
					orderNumber: 10002,
					customerId: 'cust-2',
					createdAt: new Date('2026-03-20T12:00:00'),
					orderStatus: OrderStatus.CONFIRMED,
					paymentStatus: PaymentStatus.PAID,
					shippingMethod: 'express'
				});
			});

			test('find an order by its number, with or without the ZP prefix', async () => {
				expect(await listed('?q=ZP-10002')).toEqual(['b']);
				expect(await listed('?q=zp10001')).toEqual(['a']);
				expect(await listed('?q=10002')).toEqual(['b']);
				expect(await listed('?q=10003')).toEqual([]);
			});

			test('find an order by customer name or email, % and _ match themselves', async () => {
				expect(await listed('?q=eva schmidt')).toEqual(['b']);
				expect(await listed('?q=MEIER')).toEqual(['a']);
				expect(await listed('?q=example.com')).toEqual(['b', 'a']);
				expect(await listed('?q=100%25')).toEqual(['b']);
				expect(await listed('?q=%25%25')).toEqual([]);
			});

			test('filter by payment status and shipping method', async () => {
				expect(await listed('?payment=paid')).toEqual(['b']);
				expect(await listed('?payment=pending')).toEqual(['a']);
				expect(await listed('?shipping=express')).toEqual(['b']);
				expect(await listed('?shipping=express&payment=pending')).toEqual([]);
			});

			test('filter by date, the last day counts completely', async () => {
				expect(await listed('?from=2026-03-15')).toEqual(['b']);
				expect(await listed('?to=2026-03-10')).toEqual(['a']);
				expect(await listed('?from=2026-03-10&to=2026-03-20')).toEqual(['b', 'a']);
				expect(await listed('?from=not-a-date&to=2026-13-45')).toEqual(['b', 'a']);
			});

			test('"to ship" shows paid orders that are not on their way yet', async () => {
				expect(await listed('?preset=toShip')).toEqual(['b']);
				await db
					.update(orderTable)
					.set({ orderStatus: OrderStatus.SHIPPED })
					.where(eq(orderTable.id, 'b'));
				expect(await listed('?preset=toShip')).toEqual([]);
			});

			test('"overdue" shows unpaid orders past their deadline', async () => {
				expect(await listed('?preset=overdue')).toEqual([]);
				await db
					.update(orderTable)
					.set({ paymentDueAt: new Date(Date.now() - 60_000) })
					.where(eq(orderTable.id, 'a'));
				expect(await listed('?preset=overdue')).toEqual(['a']);
			});
		});

		test('pages with a stable order, the total follows the filters', async () => {
			// All created at the same moment: the order number decides, so no order skips a page
			for (let i = 0; i < 30; i++) {
				await seedOrder(`o${i}`, { orderNumber: 10000 + i, createdAt: new Date('2026-04-01') });
			}
			const first = await list();
			const second = await list('?page=2');
			expect(first.orders).toHaveLength(25);
			expect(second.orders).toHaveLength(5);
			expect(first.paging).toMatchObject({ page: 1, pages: 2, total: 30 });
			expect(new Set([...first.orders, ...second.orders].map((o) => o.id)).size).toBe(30);
			expect((await list('?page=99')).paging.page).toBe(2);
			expect((await list('?q=10029')).paging.total).toBe(1);
		});
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
		type Outcome = {
			form: string;
			success?: true;
			error?: string;
			emailed?: string[];
			emailFailed?: boolean;
		};
		/** Staff are asked to notify the customer by default, so tests do so unless they say not to. */
		const change = (id: string, orderStatus: string, paymentStatus: string, notify = true) =>
			orderActions.updateStatus(
				event({ orderStatus, paymentStatus, ...(notify ? { notify: 'on' } : {}) }, id)
			) as Promise<Outcome>;
		const status = async (id: string) =>
			(await db.select().from(orderTable).where(eq(orderTable.id, id)))[0];
		const events = async (id: string) =>
			(await loadOrder({ params: { id } } as never)) as unknown as {
				events: {
					fromOrderStatus: string;
					toOrderStatus: string;
					fromPaymentStatus: string;
					toPaymentStatus: string;
					actor: string;
					createdAt: Date;
				}[];
				nextOrderStatuses: string[];
				nextPaymentStatuses: string[];
			};

		test('saves a valid status and refuses unknown values', async () => {
			await seedOrder('o1');
			expect(await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID)).toMatchObject({
				success: true
			});
			expect(await status('o1')).toMatchObject({ orderStatus: 'confirmed', paymentStatus: 'paid' });

			expect(await change('o1', 'lost', PaymentStatus.PAID)).toEqual({
				form: 'status',
				error: 'Ungültiger Status'
			});
			expect(await change('o1', OrderStatus.SHIPPED, 'maybe')).toEqual({
				form: 'status',
				error: 'Ungültiger Status'
			});
			expect((await status('o1')).orderStatus).toBe(OrderStatus.CONFIRMED);
		});

		test('refuses a jump that skips a step and leaves the order and its history alone', async () => {
			await seedOrder('o1');
			const result = await change('o1', OrderStatus.SHIPPED, PaymentStatus.PAID);
			expect(result.error).toBe(
				'Der Bestellstatus kann nicht von "Ausstehend" auf "Versandt" wechseln.'
			);
			expect(await status('o1')).toMatchObject({
				orderStatus: 'pending',
				paymentStatus: 'pending'
			});
			expect((await events('o1')).events).toEqual([]);
			expect(sent.paymentReceived).toEqual([]);
		});

		test('refuses payment changes the order status does not allow', async () => {
			await seedOrder('o1');
			expect((await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PENDING)).error).toContain(
				'bezahlte oder autorisierte Zahlung'
			);
			// Paid money cannot go back to open
			await db
				.update(orderTable)
				.set({ orderStatus: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID })
				.where(eq(orderTable.id, 'o1'));
			expect((await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PENDING)).error).toContain(
				'Zahlungsstatus kann nicht von "Bezahlt" auf "Ausstehend"'
			);
			expect((await status('o1')).paymentStatus).toBe(PaymentStatus.PAID);
		});

		test('a refund needs the order and the payment set to refunded together', async () => {
			await seedOrder('o1', { orderStatus: 'delivered', paymentStatus: 'paid' });
			expect((await change('o1', OrderStatus.REFUNDED, PaymentStatus.PAID)).error).toContain(
				'gemeinsam'
			);
			expect((await change('o1', OrderStatus.DELIVERED, PaymentStatus.REFUNDED)).error).toContain(
				'gemeinsam'
			);
			expect(await change('o1', OrderStatus.REFUNDED, PaymentStatus.REFUNDED)).toMatchObject({
				success: true
			});
			// A refunded order is final
			expect((await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID)).error).toBeDefined();
		});

		test('the page offers only the statuses the order can change to', async () => {
			await seedOrder('o1');
			expect(await events('o1')).toMatchObject({
				nextOrderStatuses: ['pending', 'confirmed', 'cancelled'],
				nextPaymentStatuses: ['pending', 'authorized', 'paid', 'failed']
			});
			await db
				.update(orderTable)
				.set({ orderStatus: OrderStatus.REFUNDED, paymentStatus: PaymentStatus.REFUNDED })
				.where(eq(orderTable.id, 'o1'));
			expect(await events('o1')).toMatchObject({
				nextOrderStatuses: ['refunded'],
				nextPaymentStatuses: ['refunded']
			});
		});

		test('every change is written to the history, oldest first, with who made it', async () => {
			await seedOrder('o1');
			await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID);
			await change('o1', OrderStatus.SHIPPED, PaymentStatus.PAID);
			// Saving the same status again changes nothing and leaves no entry
			await change('o1', OrderStatus.SHIPPED, PaymentStatus.PAID);

			const { events: history } = await events('o1');
			expect(
				history.map((e) => [
					e.fromOrderStatus,
					e.toOrderStatus,
					e.fromPaymentStatus,
					e.toPaymentStatus
				])
			).toEqual([
				['pending', 'confirmed', 'pending', 'paid'],
				['confirmed', 'shipped', 'paid', 'paid']
			]);
			expect(history.every((e) => e.actor === 'admin')).toBe(true);
			expect(Math.abs(history[0].createdAt.getTime() - Date.now())).toBeLessThan(60_000);
		});

		describe('emails to the customer', () => {
			test('payment received: sent once, only when the customer is to be notified', async () => {
				await seedOrder('quiet');
				await change('quiet', OrderStatus.CONFIRMED, PaymentStatus.PAID, false);
				expect(sent.paymentReceived).toEqual([]);

				await seedOrder('o1');
				const result = await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID);
				expect(result).toMatchObject({ success: true, emailed: ['paid'], emailFailed: false });
				expect(sent.paymentReceived.map((n) => n.id)).toEqual(['o1']);

				// Later steps are not payments
				await change('o1', OrderStatus.SHIPPED, PaymentStatus.PAID);
				expect(sent.paymentReceived).toHaveLength(1);
			});

			test('cancellation: sent with the staff wording, never twice', async () => {
				await seedOrder('o1');
				const result = await change('o1', OrderStatus.CANCELLED, PaymentStatus.FAILED);
				expect(result).toMatchObject({ success: true, emailed: ['cancelled'] });
				expect(sent.cancelled.map((c) => [c.notice.id, c.reason])).toEqual([['o1', 'staff']]);

				await change('o1', OrderStatus.CANCELLED, PaymentStatus.FAILED);
				expect(sent.cancelled).toHaveLength(1);
			});

			test('cancelling without notification sends nothing', async () => {
				await seedOrder('o1');
				await change('o1', OrderStatus.CANCELLED, PaymentStatus.FAILED, false);
				expect(sent.cancelled).toEqual([]);
				expect((await status('o1')).orderStatus).toBe(OrderStatus.CANCELLED);
			});

			test('reviving an order and plain status steps send nothing', async () => {
				await seedOrder('o1', { orderStatus: 'cancelled', paymentStatus: 'pending' });
				await change('o1', OrderStatus.PENDING, PaymentStatus.PENDING);
				expect(sent.cancelled).toEqual([]);
				expect(sent.paymentReceived).toEqual([]);
			});

			test('a payment that arrives after the deadline revives the order and is announced', async () => {
				await seedOrder('o1', { orderStatus: 'cancelled', paymentStatus: 'failed' });
				const result = await change('o1', OrderStatus.CONFIRMED, PaymentStatus.PAID);
				expect(result).toMatchObject({ success: true, emailed: ['paid'] });
			});

			test('a mail that fails keeps the status and tells staff', async () => {
				await seedOrder('o1');
				mailBroken.value = true;
				const result = await change('o1', OrderStatus.CANCELLED, PaymentStatus.FAILED);
				expect(result).toMatchObject({ success: true, emailed: [], emailFailed: true });
				expect((await status('o1')).orderStatus).toBe(OrderStatus.CANCELLED);
			});
		});

		describe('the internal note', () => {
			const saveNote = (internalNote: string, id = 'o1') =>
				orderActions.saveNote(event({ internalNote }, id)) as Promise<{
					form: string;
					success?: true;
					error?: string;
				}>;

			test('is saved trimmed, replaced and removed by an empty text', async () => {
				await seedOrder('o1');
				expect(await saveNote('  Kunde holt selbst ab \n')).toEqual({
					form: 'note',
					success: true
				});
				expect((await status('o1')).internalNote).toBe('Kunde holt selbst ab');
				await saveNote('Doch Versand');
				expect((await status('o1')).internalNote).toBe('Doch Versand');
				await saveNote('   ');
				expect((await status('o1')).internalNote).toBeNull();
			});

			test('is not the note the customer wrote at checkout', async () => {
				await seedOrder('o1', { notes: 'Bitte klingeln' });
				await saveNote('intern');
				expect(await status('o1')).toMatchObject({
					notes: 'Bitte klingeln',
					internalNote: 'intern'
				});
			});

			test('refuses a text that is too long and an unknown order', async () => {
				await seedOrder('o1');
				expect((await saveNote('x'.repeat(2001))).error).toContain('zu lang');
				expect((await status('o1')).internalNote).toBeNull();
				expect(await saveNote('x', 'gone')).toEqual({
					form: 'note',
					error: 'Bestellung nicht gefunden'
				});
			});
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
				form: 'status',
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
