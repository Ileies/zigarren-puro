import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	addressTable,
	authCredentialsTable,
	customerTable,
	newsletterSubscriberTable,
	orderTable,
	sessionTable,
	tokenTable,
	wishlistTable
} from '#lib/server/db/schema/index.js';
import { MAX_FAILED_ATTEMPTS } from '#lib/server/accounts.js';
import { hashPassword, verifyPassword } from '#lib/server/auth.js';
import { parseAddressForm } from '#lib/server/addresses.js';
import { parseProfileForm } from '#lib/server/profile.js';
import { NewsletterStatus, TokenType } from '#lib/types.js';
import * as m from '#lib/messages.js';
import { baseOrder, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

// The profile page sends mail through a module that needs the SvelteKit runtime, so the mail
// sender is replaced by one that records what would have been sent.
const sentChangeMails: unknown[][] = [];
mock.module('#lib/server/functions.js', () => ({
	sendEmailChangeConfirmation: async (...args: unknown[]) => {
		sentChangeMails.push(args);
	}
}));

const profile = await import('../src/routes/account/+page.server.ts');
const confirmEmail = await import('../src/routes/account/confirm-email/+page.server.ts');
const addresses = await import('../src/routes/account/addresses/+page.server.ts');
const wishlist = await import('../src/routes/account/wishlist/+page.server.ts');
const orders = await import('../src/routes/account/orders/+page.server.ts');
const orderDetail = await import('../src/routes/account/orders/[id]/+page.server.ts');

const HOUR = 60 * 60 * 1000;
const PASSWORD = 'correct horse';

type Fields = Record<string, string>;

const formData = (fields: Fields) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};

/** The event fields the account routes read. `userId` null is a visitor who is not signed in. */
function event(
	fields: Fields = {},
	{ userId = 'cust-1' as string | null, sessionId = 'session-now', params = {}, url = '/' } = {}
) {
	const cookieWrites: { name: string; value: string }[] = [];
	const built = {
		locals: userId ? { user: { id: userId }, session: { id: sessionId } } : {},
		request: { formData: async () => formData(fields) },
		params,
		url: new URL(`http://localhost${url}`),
		cookies: {
			get: () => undefined,
			set: (name: string, value: string) => cookieWrites.push({ name, value }),
			delete: () => {}
		}
	};
	return Object.assign(built as never, { cookieWrites });
}

async function thrown(run: () => unknown) {
	try {
		await run();
	} catch (err) {
		return err as { status: number; location?: string };
	}
	throw new Error('expected a redirect or an error');
}

type Failure = { status: number; data: { error: string; action?: string } };
const failure = (result: unknown) => result as Failure;

async function seedLogin() {
	await db.update(customerTable).set({ isVerified: true }).where(eq(customerTable.id, 'cust-1'));
	await db
		.insert(authCredentialsTable)
		.values({ customerId: 'cust-1', passwordHash: await hashPassword(PASSWORD) });
}

async function seedOtherCustomer() {
	await db.insert(customerTable).values({
		id: 'cust-2',
		email: 'erika@example.com',
		firstName: 'Erika',
		lastName: 'Muster',
		birthDate: '1985-02-02'
	});
	await db.insert(addressTable).values({
		id: 'addr-2',
		customerId: 'cust-2',
		type: 'shipping',
		street: 'Hauptstraße 1',
		city: 'Bonn',
		state: 'NRW',
		country: 'DE',
		postalCode: '53111',
		isDefault: true
	});
}

const customer = async (id = 'cust-1') =>
	(await db.select().from(customerTable).where(eq(customerTable.id, id)))[0];
const credentials = async () =>
	(
		await db
			.select()
			.from(authCredentialsTable)
			.where(eq(authCredentialsTable.customerId, 'cust-1'))
	)[0];
const addressRow = async (id: string) =>
	(await db.select().from(addressTable).where(eq(addressTable.id, id)))[0];

beforeEach(async () => {
	sentChangeMails.length = 0;
	await resetDb();
	await seedCatalogue();
	await seedCustomer();
});

describe('account profile', () => {
	const fields = { firstName: 'Maximilian', lastName: 'Meier', phone: '0221 123', gender: 'male' };

	test('parseProfileForm trims, turns an empty phone into null and checks the title', () => {
		const ok = parseProfileForm(
			formData({ firstName: ' Max ', lastName: ' Meier ', phone: ' ', gender: '' })
		);
		expect(ok).toEqual({
			ok: true,
			value: {
				firstName: 'Max',
				lastName: 'Meier',
				phone: null,
				gender: null,
				marketingConsent: false
			}
		});
		expect(parseProfileForm(formData({ firstName: 'Max', lastName: '' }))).toEqual({
			ok: false,
			error: { code: 'nameRequired' }
		});
		expect(parseProfileForm(formData({ ...fields, gender: 'robot' }))).toEqual({
			ok: false,
			error: { code: 'invalidRequest' }
		});
		expect(parseProfileForm(formData({ ...fields, lastName: 'x'.repeat(101) }))).toEqual({
			ok: false,
			error: { code: 'invalidRequest' }
		});
	});

	test('the page loads the signed-in customer, and a visitor goes to the login', async () => {
		const loaded = (await profile.load(event())) as { customer: { email: string } };
		expect(loaded.customer.email).toBe('max@example.com');

		const visitor = await thrown(() => profile.load(event({}, { userId: null })));
		expect(visitor).toMatchObject({ status: 302, location: '/login' });
	});

	test('updateProfile saves the fields', async () => {
		const result = await profile.actions.updateProfile!(
			event({ ...fields, marketingConsent: 'on' })
		);

		expect(result).toEqual({ action: 'profile', success: true });
		expect(await customer()).toMatchObject({
			firstName: 'Maximilian',
			phone: '0221 123',
			gender: 'male',
			marketingConsent: true
		});
	});

	test('choosing "no answer" for the title clears it', async () => {
		await profile.actions.updateProfile!(event(fields));
		await profile.actions.updateProfile!(event({ ...fields, gender: '' }));

		expect((await customer()).gender).toBeNull();
	});

	test('a missing name or an unknown title saves nothing', async () => {
		const noName = failure(
			await profile.actions.updateProfile!(event({ ...fields, firstName: '' }))
		);
		const badGender = failure(
			await profile.actions.updateProfile!(event({ ...fields, gender: 'robot' }))
		);

		expect(noName.status).toBe(400);
		expect(noName.data.error).toBe(m.errNameRequired());
		expect(badGender.data.error).toBe(m.errInvalidRequest());
		expect(await customer()).toMatchObject({ firstName: 'Max', gender: null });
	});

	test('turning marketing consent off also withdraws the newsletter subscription', async () => {
		await db.insert(newsletterSubscriberTable).values({
			email: 'max@example.com',
			status: NewsletterStatus.CONFIRMED,
			unsubscribeToken: 'unsub-1'
		});

		await profile.actions.updateProfile!(event({ ...fields, marketingConsent: 'on' }));
		const kept = await db.select().from(newsletterSubscriberTable);
		await profile.actions.updateProfile!(event(fields));
		const withdrawn = await db.select().from(newsletterSubscriberTable);

		expect(kept[0].status).toBe(NewsletterStatus.CONFIRMED);
		expect(withdrawn[0].status).toBe(NewsletterStatus.UNSUBSCRIBED);
	});

	test('a visitor cannot change a profile', async () => {
		const result = await thrown(() =>
			profile.actions.updateProfile!(event(fields, { userId: null }))
		);

		expect(result).toMatchObject({ status: 302, location: '/login' });
		expect((await customer()).firstName).toBe('Max');
	});
});

describe('account password', () => {
	const change = (overrides: Fields = {}, sessionId = 'session-now') =>
		profile.actions.changePassword!(
			event(
				{
					currentPassword: PASSWORD,
					newPassword: 'brand new pass',
					confirmPassword: 'brand new pass',
					...overrides
				},
				{ sessionId }
			)
		);

	beforeEach(seedLogin);

	test('saves the new password, keeps this session and closes the others', async () => {
		const expiresAt = new Date(Date.now() + HOUR);
		await db.insert(sessionTable).values([
			{ id: 'session-now', customerId: 'cust-1', expiresAt },
			{ id: 'session-phone', customerId: 'cust-1', expiresAt }
		]);
		await seedOtherCustomer();
		await db.insert(sessionTable).values({ id: 'session-other', customerId: 'cust-2', expiresAt });

		const result = await change();

		expect(result).toEqual({ action: 'password', success: true });
		expect(await verifyPassword('brand new pass', (await credentials()).passwordHash)).toBe(true);
		expect(await verifyPassword(PASSWORD, (await credentials()).passwordHash)).toBe(false);
		const sessions = (await db.select().from(sessionTable)).map((s) => s.id).sort();
		expect(sessions).toEqual(['session-now', 'session-other']);
	});

	test('the current password must be right', async () => {
		const result = failure(await change({ currentPassword: 'wrong' }));

		expect(result.status).toBe(401);
		expect(result.data.error).toBe(m.errCurrentPasswordWrong());
		expect(await verifyPassword(PASSWORD, (await credentials()).passwordHash)).toBe(true);
		expect((await credentials()).failedAttempts).toBe(1);
	});

	test('repeated wrong passwords lock the account, also against the right one', async () => {
		for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await change({ currentPassword: 'wrong' });

		const locked = failure(await change());

		expect(locked.status).toBe(429);
		expect(await verifyPassword(PASSWORD, (await credentials()).passwordHash)).toBe(true);
	});

	test('a short, mismatching or missing new password is refused', async () => {
		const short = failure(await change({ newPassword: 'short', confirmPassword: 'short' }));
		const mismatch = failure(await change({ confirmPassword: 'something else' }));
		const missing = failure(await change({ newPassword: '' }));

		expect(short.data.error).toBe(m.errNewPasswordTooShort());
		expect(mismatch.data.error).toBe(m.errPasswordMismatch());
		expect(missing.data.error).toBe(m.errFieldsRequired());
		expect([short.status, mismatch.status, missing.status]).toEqual([400, 400, 400]);
		expect(await verifyPassword(PASSWORD, (await credentials()).passwordHash)).toBe(true);
		// Refusals before the password check do not count as a wrong password
		expect((await credentials()).failedAttempts).toBe(0);
	});

	test('a successful change clears earlier wrong attempts', async () => {
		await change({ currentPassword: 'wrong' });
		await change();

		expect((await credentials()).failedAttempts).toBe(0);
	});
});

describe('account email change', () => {
	const request = (overrides: Fields = {}) =>
		profile.actions.changeEmail!(
			event({ newEmail: 'New.Max@Example.com ', currentPassword: PASSWORD, ...overrides })
		);

	beforeEach(seedLogin);

	test('sends the confirmation to the new address, in lower case', async () => {
		const result = await request();

		expect(result).toEqual({ action: 'email', success: true });
		expect(sentChangeMails).toEqual([['cust-1', 'new.max@example.com', 'Max']]);
		// The address only changes once the link is opened
		expect((await customer()).email).toBe('max@example.com');
	});

	test('refuses wrong passwords, bad addresses, the same address and a taken address', async () => {
		await seedOtherCustomer();

		const wrong = failure(await request({ currentPassword: 'wrong' }));
		const invalid = failure(await request({ newEmail: 'not-an-email' }));
		const same = failure(await request({ newEmail: 'MAX@example.com' }));
		const taken = failure(await request({ newEmail: 'erika@example.com' }));
		const missing = failure(await request({ newEmail: '' }));

		expect(wrong.status).toBe(401);
		expect(wrong.data.error).toBe(m.errCurrentPasswordWrong());
		expect(invalid.data.error).toBe(m.errInvalidEmail());
		expect(same.data.error).toBe(m.errEmailSame());
		expect(taken.data.error).toBe(m.errEmailTaken());
		expect(missing.data.error).toBe(m.errFieldsRequired());
		expect(sentChangeMails).toEqual([]);
	});

	test('the password is checked before the form says an address is taken', async () => {
		await seedOtherCustomer();

		const result = failure(
			await request({ newEmail: 'erika@example.com', currentPassword: 'wrong' })
		);

		expect(result.data.error).toBe(m.errCurrentPasswordWrong());
	});

	test('wrong passwords count towards the lock', async () => {
		for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await request({ currentPassword: 'wrong' });

		const locked = failure(await request());

		expect(locked.status).toBe(429);
		expect(sentChangeMails).toEqual([]);
	});

	describe('confirming the link', () => {
		const seedLink = (token: string, overrides = {}) =>
			db.insert(tokenTable).values({
				token,
				customerId: 'cust-1',
				type: TokenType.EMAIL_CHANGE,
				metadata: 'new@example.com',
				expiresAt: new Date(Date.now() + HOUR),
				...overrides
			});
		const open = (token: string | null, userId: string | null = 'cust-1') =>
			confirmEmail.load(event({}, { userId, url: token ? `/?token=${token}` : '/' }));

		test('changes the email and works once', async () => {
			await seedLink('t1');

			expect(await open('t1')).toEqual({ status: 'success', newEmail: 'new@example.com' });
			expect((await customer()).email).toBe('new@example.com');
			expect(await open('t1')).toEqual({ status: 'already_used' });
		});

		test('refuses unknown, expired, revoked and missing links', async () => {
			await seedLink('expired', { expiresAt: new Date(Date.now() - HOUR) });
			await seedLink('revoked', { revokedAt: new Date() });
			await seedLink('wrong-type', { type: TokenType.PASSWORD_RESET });

			for (const token of ['unknown', 'expired', 'revoked', 'wrong-type', null]) {
				expect(await open(token)).toEqual({ status: 'invalid' });
			}
			expect((await customer()).email).toBe('max@example.com');
		});

		test('a link only works for the customer it was sent to', async () => {
			await seedOtherCustomer();
			await seedLink('t1');

			expect(await open('t1', 'cust-2')).toEqual({ status: 'invalid' });
			expect((await customer('cust-2')).email).toBe('erika@example.com');
			expect((await customer()).email).toBe('max@example.com');
		});

		test('an address registered in the meantime is not taken over', async () => {
			await seedOtherCustomer();
			await seedLink('t1', { metadata: 'erika@example.com' });

			expect(await open('t1')).toEqual({ status: 'email_taken' });
			expect((await customer()).email).toBe('max@example.com');
		});

		test('a visitor goes to the login', async () => {
			await seedLink('t1');

			const result = await thrown(() => open('t1', null));
			expect(result).toMatchObject({ status: 302, location: '/login' });
		});
	});
});

describe('account addresses', () => {
	const fields = {
		type: 'shipping',
		street: ' Neue Straße 5 ',
		city: 'Köln',
		state: 'NRW',
		country: 'DE',
		postalCode: '50667'
	};
	const add = (overrides: Fields = {}) =>
		addresses.actions.addAddress!(event({ ...fields, ...overrides }));
	const mine = async () =>
		(await db.select().from(addressTable).where(eq(addressTable.customerId, 'cust-1'))).sort(
			(a, b) => a.id.localeCompare(b.id)
		);

	test('parseAddressForm reports what is wrong', () => {
		expect(parseAddressForm(formData({ ...fields, type: 'home' }))).toEqual({
			ok: false,
			error: 'invalidType'
		});
		expect(parseAddressForm(formData({ ...fields, city: ' ' }))).toEqual({
			ok: false,
			error: 'requiredFields'
		});
		expect(parseAddressForm(formData({ ...fields, street: 'x'.repeat(201) }))).toEqual({
			ok: false,
			error: 'tooLong'
		});
		// The region may stay empty
		expect(parseAddressForm(formData({ ...fields, state: '' })).ok).toBe(true);
	});

	test('the page lists only the addresses of the signed-in customer', async () => {
		await seedOtherCustomer();

		const loaded = (await addresses.load(event())) as { addresses: { id: string }[] };

		expect(loaded.addresses.map((a) => a.id)).toEqual(['addr-1']);
	});

	test('adds a trimmed address to the customer', async () => {
		expect(await add()).toEqual({ success: true });

		const saved = (await mine()).find((a) => a.id !== 'addr-1')!;
		expect(saved).toMatchObject({ street: 'Neue Straße 5', isDefault: false, type: 'shipping' });
	});

	test('refuses a bad type or missing fields without saving', async () => {
		const type = failure(await add({ type: 'home' }));
		const city = failure(await add({ city: '' }));

		expect(type.data.error).toBe(m.errInvalidAddressType());
		expect(city.data.error).toBe(m.errRequiredFields());
		expect([type.status, city.status]).toEqual([400, 400]);
		expect(await mine()).toHaveLength(1);
	});

	test('a new default replaces the default of the same type only', async () => {
		await db.insert(addressTable).values({
			id: 'addr-bill',
			customerId: 'cust-1',
			type: 'billing',
			street: 'Rechnungsweg 1',
			city: 'Köln',
			state: '',
			country: 'DE',
			postalCode: '50667',
			isDefault: true
		});
		await db.update(addressTable).set({ isDefault: true }).where(eq(addressTable.id, 'addr-1'));

		await add({ isDefault: 'on' });

		const all = await mine();
		expect(all.find((a) => a.id === 'addr-1')!.isDefault).toBe(false);
		expect(all.find((a) => a.id === 'addr-bill')!.isDefault).toBe(true);
		expect(all.filter((a) => a.isDefault && a.type === 'shipping')).toHaveLength(1);
	});

	test('deletes an own address', async () => {
		expect(await addresses.actions.deleteAddress!(event({ id: 'addr-1' }))).toEqual({
			success: true
		});
		expect(await mine()).toHaveLength(0);
	});

	test('does not delete the address of another customer', async () => {
		await seedOtherCustomer();

		const result = failure(await addresses.actions.deleteAddress!(event({ id: 'addr-2' })));

		expect(result.status).toBe(404);
		expect(result.data.error).toBe(m.errAddressNotFound());
		expect(await addressRow('addr-2')).toBeDefined();
	});

	test('keeps an address that an order was placed with', async () => {
		await db.insert(orderTable).values(baseOrder());

		const result = failure(await addresses.actions.deleteAddress!(event({ id: 'addr-1' })));

		expect(result.status).toBe(409);
		expect(result.data.error).toBe(m.errAddressInUse());
		expect(await addressRow('addr-1')).toBeDefined();
	});

	test('a missing id is refused', async () => {
		const result = failure(await addresses.actions.deleteAddress!(event({})));
		expect(result.status).toBe(400);
	});

	describe('default address', () => {
		beforeEach(async () => {
			await db.insert(addressTable).values({
				id: 'addr-1b',
				customerId: 'cust-1',
				type: 'shipping',
				street: 'Zweite Straße 2',
				city: 'Köln',
				state: '',
				country: 'DE',
				postalCode: '50667'
			});
			await db.update(addressTable).set({ isDefault: true }).where(eq(addressTable.id, 'addr-1'));
		});

		test('moves the default to the chosen address', async () => {
			expect(await addresses.actions.setDefault!(event({ id: 'addr-1b' }))).toEqual({
				success: true
			});

			expect((await addressRow('addr-1b')).isDefault).toBe(true);
			expect((await addressRow('addr-1')).isDefault).toBe(false);
		});

		test('an address of someone else changes nothing, not even the own default', async () => {
			await seedOtherCustomer();

			const result = failure(await addresses.actions.setDefault!(event({ id: 'addr-2' })));

			expect(result.status).toBe(404);
			expect((await addressRow('addr-1')).isDefault).toBe(true);
			expect((await addressRow('addr-2')).isDefault).toBe(true);
		});

		test('the type comes from the address, not from the form', async () => {
			await db.insert(addressTable).values({
				id: 'addr-bill',
				customerId: 'cust-1',
				type: 'billing',
				street: 'Rechnungsweg 1',
				city: 'Köln',
				state: '',
				country: 'DE',
				postalCode: '50667',
				isDefault: true
			});

			await addresses.actions.setDefault!(event({ id: 'addr-1b', type: 'billing' }));

			expect((await addressRow('addr-bill')).isDefault).toBe(true);
			expect((await addressRow('addr-1b')).isDefault).toBe(true);
			expect((await addressRow('addr-1')).isDefault).toBe(false);
		});
	});

	test('a visitor is sent to the login', async () => {
		const result = await thrown(() => addresses.load(event({}, { userId: null })));
		expect(result).toMatchObject({ status: 302, location: '/login' });
	});
});

describe('account wishlist', () => {
	const wish = (productId: string, customerId = 'cust-1') =>
		db.insert(wishlistTable).values({ customerId, productId });

	test('lists the own items with product and producer', async () => {
		await seedOtherCustomer();
		await wish('cigar-1');
		await wish('rum-1', 'cust-2');

		const { items } = (await wishlist.load(event())) as {
			items: { productId: string; name: string; producerName: string }[];
		};

		expect(items).toEqual([
			expect.objectContaining({ productId: 'cigar-1', name: 'Siglo VI', producerName: 'Cohiba' })
		]);
	});

	test('removes only the own entry', async () => {
		await seedOtherCustomer();
		await wish('cigar-1');
		await wish('cigar-1', 'cust-2');

		await wishlist.actions.remove!(event({ productId: 'cigar-1' }));

		const left = await db.select().from(wishlistTable);
		expect(left.map((w) => w.customerId)).toEqual(['cust-2']);
	});

	test('puts an available product into the cart', async () => {
		const e = event({ productId: 'cigar-1' });

		expect(await wishlist.actions.addToCart!(e)).toEqual({ success: true });
		const cart = (e as unknown as { cookieWrites: { name: string; value: string }[] }).cookieWrites;
		expect(cart).toHaveLength(1);
		expect(JSON.parse(Buffer.from(cart[0].value, 'base64').toString())).toEqual([
			{ id: 'cigar-1', qty: 1 }
		]);
	});

	test('sold out and unknown products are refused and stay out of the cart', async () => {
		for (const productId of ['cigar-2', 'does-not-exist']) {
			const e = event({ productId });
			const result = failure(await wishlist.actions.addToCart!(e));

			expect(result.status).toBe(409);
			expect(result.data.error).toBe(m.errProductUnavailable());
			expect((e as unknown as { cookieWrites: unknown[] }).cookieWrites).toEqual([]);
		}
	});

	test('a visitor is sent to the login', async () => {
		const result = await thrown(() =>
			wishlist.actions.addToCart!(event({ productId: 'cigar-1' }, { userId: null }))
		);
		expect(result).toMatchObject({ status: 302, location: '/login' });
	});
});

describe('account orders', () => {
	beforeEach(async () => {
		await seedOtherCustomer();
		await db.insert(orderTable).values([
			baseOrder({
				id: 'order-old',
				orderNumber: 1,
				createdAt: new Date('2026-01-01T10:00:00Z')
			}),
			baseOrder({
				id: 'order-new',
				orderNumber: 2,
				createdAt: new Date('2026-02-01T10:00:00Z')
			}),
			baseOrder({
				id: 'order-other',
				orderNumber: 3,
				customerId: 'cust-2',
				shippingAddressId: 'addr-2',
				billingAddressId: 'addr-2'
			})
		]);
	});

	test('the list holds the own orders, newest first', async () => {
		const { orders: rows } = (await orders.load(event())) as { orders: { id: string }[] };

		expect(rows.map((o) => o.id)).toEqual(['order-new', 'order-old']);
	});

	test('the detail page shows an own order with its addresses', async () => {
		const { order } = (await orderDetail.load(event({}, { params: { id: 'order-new' } }))) as {
			order: { id: string; shippingAddress: { street: string } | null };
		};

		expect(order.id).toBe('order-new');
		expect(order.shippingAddress?.street).toBe('Weidengasse 25');
	});

	test('the order of another customer and an unknown order are a translated 404', async () => {
		for (const id of ['order-other', 'nope']) {
			const result = (await thrown(() => orderDetail.load(event({}, { params: { id } })))) as {
				status: number;
				body?: { message: string };
			};

			expect(result.status).toBe(404);
			expect(result.body?.message).toBe(m.errOrderNotFound());
		}
	});

	test('a visitor is sent to the login', async () => {
		const list = await thrown(() => orders.load(event({}, { userId: null })));
		const detail = await thrown(() =>
			orderDetail.load(event({}, { userId: null, params: { id: 'order-new' } }))
		);

		expect(list).toMatchObject({ status: 302, location: '/login' });
		expect(detail).toMatchObject({ status: 302, location: '/login' });
	});
});
