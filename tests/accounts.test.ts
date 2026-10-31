import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	authCredentialsTable,
	customerTable,
	sessionTable,
	tokenTable
} from '#lib/server/db/schema/index.js';
import {
	LOCK_MINUTES,
	MAX_FAILED_ATTEMPTS,
	authenticate,
	confirmEmail,
	parseRegistrationForm,
	registerCustomer,
	resetLinkStatus,
	resetPassword,
	type PasswordResetError,
	type RegistrationInput,
	type RegistrationResult
} from '#lib/server/accounts.js';
import {
	createSession,
	generateSessionToken,
	hashPassword,
	invalidateSession,
	validateSessionToken,
	verifyPassword
} from '#lib/server/auth.js';
import { ageOn } from '#lib/age.js';
import { TokenType } from '#lib/types.js';
import { resetDb, seedCustomer } from './fixtures.ts';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const PASSWORD = 'correct horse';

const credentials = async () =>
	(
		await db
			.select()
			.from(authCredentialsTable)
			.where(eq(authCredentialsTable.customerId, 'cust-1'))
	)[0];
const customers = () => db.select().from(customerTable);

async function seedLogin(isVerified = true) {
	await db.update(customerTable).set({ isVerified }).where(eq(customerTable.id, 'cust-1'));
	await db
		.insert(authCredentialsTable)
		.values({ customerId: 'cust-1', passwordHash: await hashPassword(PASSWORD) });
}

async function seedToken(token: string, type: TokenType, overrides = {}) {
	await db.insert(tokenTable).values({
		token,
		customerId: 'cust-1',
		type,
		expiresAt: new Date(Date.now() + HOUR),
		...overrides
	});
}

const registration = (overrides: Partial<RegistrationInput> = {}): RegistrationInput => ({
	email: 'eva@example.com',
	password: 'longenough',
	passwordConfirm: 'longenough',
	firstName: 'Eva',
	lastName: 'Muster',
	birthDate: '1990-05-05',
	gender: null,
	phone: null,
	marketingConsent: false,
	acceptTerms: true,
	language: 'de',
	...overrides
});

beforeEach(async () => {
	await resetDb();
	await seedCustomer();
});

describe('ageOn', () => {
	test('counts full years only', () => {
		const now = new Date(2026, 5, 15);
		expect(ageOn('2008-06-15', now)).toBe(18);
		expect(ageOn('2008-06-16', now)).toBe(17);
		expect(ageOn('2008-07-01', now)).toBe(17);
		expect(ageOn('1980-01-01', now)).toBe(46);
	});

	test('reads a date-only string as that calendar day', () => {
		// Midnight UTC would still be the day before in a time zone west of Greenwich
		expect(ageOn('2008-06-15', new Date(2026, 5, 15, 0, 30))).toBe(18);
		expect(ageOn('2008-06-15', new Date(2026, 5, 14, 23, 30))).toBe(17);
	});
});

describe('authenticate', () => {
	beforeEach(seedLogin);

	test('needs an email and a password', async () => {
		for (const [email, password] of [
			['', PASSWORD],
			['max@example.com', ''],
			[undefined, undefined]
		]) {
			expect(await authenticate(email, password)).toEqual({
				ok: false,
				error: { code: 'credentialsRequired' }
			});
		}
	});

	test('signs in with the right password, whatever the case of the email', async () => {
		const result = await authenticate('  Max@Example.COM ', PASSWORD);
		expect(result).toEqual({ ok: true, customer: { id: 'cust-1', isVerified: true } });
	});

	test('reports an unverified customer', async () => {
		await db.update(customerTable).set({ isVerified: false });
		const result = await authenticate('max@example.com', PASSWORD);
		expect(result).toMatchObject({ ok: true, customer: { isVerified: false } });
	});

	test('gives the same answer for a wrong password, an unknown email and no login', async () => {
		const invalid = { ok: false, error: { code: 'invalidCredentials' } } as const;
		expect(await authenticate('max@example.com', 'wrong')).toEqual(invalid);
		expect(await authenticate('nobody@example.com', PASSWORD)).toEqual(invalid);
		await db.delete(authCredentialsTable);
		expect(await authenticate('max@example.com', PASSWORD)).toEqual(invalid);
	});

	test('locks the account after five wrong passwords, even for the right one', async () => {
		const now = new Date('2026-11-01T10:00:00Z');
		for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
			expect(await authenticate('max@example.com', 'wrong', now)).toMatchObject({ ok: false });
		}
		expect((await credentials()).lockedUntil).toEqual(
			new Date(now.getTime() + LOCK_MINUTES * MINUTE)
		);

		const later = new Date(now.getTime() + 5 * MINUTE + 1);
		expect(await authenticate('max@example.com', PASSWORD, later)).toEqual({
			ok: false,
			error: { code: 'locked', minutes: LOCK_MINUTES - 5 }
		});
	});

	test('four wrong passwords do not lock, and a right one clears the count', async () => {
		for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) await authenticate('max@example.com', 'x');
		expect((await credentials()).failedAttempts).toBe(MAX_FAILED_ATTEMPTS - 1);
		expect((await credentials()).lockedUntil).toBeNull();

		expect(await authenticate('max@example.com', PASSWORD)).toMatchObject({ ok: true });
		expect((await credentials()).failedAttempts).toBe(0);
	});

	test('after the lock has run out the count starts again', async () => {
		const now = new Date('2026-11-01T10:00:00Z');
		for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await authenticate('max@example.com', 'x', now);

		const after = new Date(now.getTime() + LOCK_MINUTES * MINUTE + 1);
		await authenticate('max@example.com', 'x', after);
		const row = await credentials();
		expect(row.failedAttempts).toBe(1);
		expect(row.lockedUntil).toBeNull();
		expect(await authenticate('max@example.com', PASSWORD, after)).toMatchObject({ ok: true });
	});
});

describe('registerCustomer', () => {
	test('creates the customer and a login that works', async () => {
		const result = await registerCustomer(
			registration({
				email: 'eva@example.com',
				phone: '0221 123',
				marketingConsent: true,
				language: 'en'
			})
		);
		if (!result.ok) throw new Error(result.error.code);
		expect(result.customer).toMatchObject({ email: 'eva@example.com', firstName: 'Eva' });

		const [saved] = await db
			.select()
			.from(customerTable)
			.where(eq(customerTable.id, result.customer.id));
		expect(saved).toMatchObject({
			email: 'eva@example.com',
			birthDate: '1990-05-05',
			phone: '0221 123',
			marketingConsent: true,
			preferredLanguage: 'en',
			isVerified: false
		});

		const [login] = await db
			.select()
			.from(authCredentialsTable)
			.where(eq(authCredentialsTable.customerId, result.customer.id));
		expect(login.passwordHash).not.toContain('longenough');
		expect(await verifyPassword('longenough', login.passwordHash)).toBe(true);
		expect(await authenticate('eva@example.com', 'longenough')).toMatchObject({ ok: true });
	});

	test('accepts someone who turns 18 today and refuses the day before', async () => {
		const now = new Date(2026, 10, 1, 12);
		expect(await registerCustomer(registration({ birthDate: '2008-11-01' }), now)).toMatchObject({
			ok: true
		});
		expect(
			await registerCustomer(
				registration({ email: 'kid@example.com', birthDate: '2008-11-02' }),
				now
			)
		).toEqual({ ok: false, error: { code: 'underage' } });
	});

	describe('refusals save nothing', () => {
		const refused = async (
			overrides: Partial<RegistrationInput>,
			code: Extract<RegistrationResult, { ok: false }>['error']['code']
		) => {
			const result = await registerCustomer(registration(overrides));
			expect(result).toEqual({ ok: false, error: { code } });
			expect(await customers()).toHaveLength(1);
			expect(await db.select().from(authCredentialsTable)).toHaveLength(0);
		};

		test('missing fields', async () => {
			for (const field of ['email', 'password', 'firstName', 'lastName', 'birthDate'] as const) {
				await refused({ [field]: '' }, 'requiredFields');
			}
		});

		test('an email that is not one', async () => {
			await refused({ email: 'not-an-email' }, 'invalidEmail');
			await refused({ email: 'a b@example.com' }, 'invalidEmail');
		});

		test('a short password or one that is not repeated', async () => {
			await refused({ password: 'short', passwordConfirm: 'short' }, 'passwordTooShort');
			await refused({ passwordConfirm: 'different1' }, 'passwordMismatch');
		});

		test('a birth date that is not a date, a minor and a missing consent', async () => {
			await refused({ birthDate: 'yesterday' }, 'invalidBirthDate');
			await refused(
				{ birthDate: new Date(Date.now() - 10 * 365 * DAY).toISOString().slice(0, 10) },
				'underage'
			);
			await refused({ birthDate: '2999-01-01' }, 'underage');
			await refused({ acceptTerms: false }, 'acceptTerms');
		});

		test('an email that is taken', async () => {
			await refused({ email: 'max@example.com' }, 'emailTaken');
		});
	});
});

describe('parseRegistrationForm', () => {
	test('trims, lowercases the email and reads the checkboxes', () => {
		const data = new FormData();
		data.set('email', '  Eva@Example.com ');
		data.set('firstName', ' Eva ');
		data.set('phone', '   ');
		data.set('gender', '');
		data.set('acceptTerms', 'on');
		const parsed = parseRegistrationForm(data, 'en-US');
		expect(parsed).toMatchObject({
			email: 'eva@example.com',
			firstName: 'Eva',
			phone: null,
			gender: null,
			acceptTerms: true,
			marketingConsent: false,
			language: 'en-US',
			password: ''
		});
	});
});

describe('password reset', () => {
	beforeEach(seedLogin);

	test('the link status says what is wrong with the link', async () => {
		await seedToken('good', TokenType.PASSWORD_RESET);
		await seedToken('used', TokenType.PASSWORD_RESET, { usedAt: new Date() });
		await seedToken('old', TokenType.PASSWORD_RESET, { expiresAt: new Date(Date.now() - MINUTE) });
		await seedToken('revoked', TokenType.PASSWORD_RESET, { revokedAt: new Date() });
		await seedToken('other', TokenType.EMAIL_VERIFICATION);

		expect(await resetLinkStatus(null)).toBe('missing');
		expect(await resetLinkStatus('good')).toBe('valid');
		expect(await resetLinkStatus('used')).toBe('used');
		for (const token of ['old', 'revoked', 'other', 'unknown']) {
			expect(await resetLinkStatus(token)).toBe('invalid');
		}
	});

	test('sets the new password, unlocks the account and signs every device out', async () => {
		await seedToken('good', TokenType.PASSWORD_RESET);
		await db
			.update(authCredentialsTable)
			.set({ failedAttempts: 5, lockedUntil: new Date(Date.now() + HOUR) });
		await createSession(generateSessionToken(), 'cust-1');

		expect(await resetPassword('good', 'brand new pw', 'brand new pw')).toEqual({ ok: true });

		const row = await credentials();
		expect(await verifyPassword('brand new pw', row.passwordHash)).toBe(true);
		expect(row).toMatchObject({ failedAttempts: 0, lockedUntil: null });
		expect(await db.select().from(sessionTable)).toHaveLength(0);
		expect(await resetLinkStatus('good')).toBe('used');
		expect(await authenticate('max@example.com', PASSWORD)).toMatchObject({ ok: false });
		expect(await authenticate('max@example.com', 'brand new pw')).toMatchObject({ ok: true });
	});

	test('a link works only once', async () => {
		await seedToken('good', TokenType.PASSWORD_RESET);
		await resetPassword('good', 'brand new pw', 'brand new pw');
		expect(await resetPassword('good', 'another one!', 'another one!')).toEqual({
			ok: false,
			error: { code: 'linkInvalid' }
		});
		expect(await verifyPassword('brand new pw', (await credentials()).passwordHash)).toBe(true);
	});

	test('refusals leave the password and the link alone', async () => {
		await seedToken('good', TokenType.PASSWORD_RESET);
		await seedToken('old', TokenType.PASSWORD_RESET, { expiresAt: new Date(Date.now() - MINUTE) });
		const cases: [string | undefined, string, string, PasswordResetError['code']][] = [
			[undefined, 'brand new pw', 'brand new pw', 'fieldsRequired'],
			['good', '', '', 'fieldsRequired'],
			['good', 'short', 'short', 'passwordTooShort'],
			['good', 'brand new pw', 'something else', 'passwordMismatch'],
			['old', 'brand new pw', 'brand new pw', 'linkInvalid'],
			['unknown', 'brand new pw', 'brand new pw', 'linkInvalid']
		];
		for (const [token, password, confirm, code] of cases) {
			expect(await resetPassword(token, password, confirm)).toEqual({ ok: false, error: { code } });
		}
		expect(await verifyPassword(PASSWORD, (await credentials()).passwordHash)).toBe(true);
		expect(await resetLinkStatus('good')).toBe('valid');
	});
});

describe('confirmEmail', () => {
	beforeEach(async () => {
		await db.update(customerTable).set({ isVerified: false });
	});

	test('verifies the customer once', async () => {
		await seedToken('good', TokenType.EMAIL_VERIFICATION);
		expect(await confirmEmail('good')).toBe('success');
		expect((await customers())[0].isVerified).toBe(true);
		expect(await confirmEmail('good')).toBe('already_verified');
	});

	test('rejects unknown, expired, revoked and wrong-type tokens', async () => {
		await seedToken('old', TokenType.EMAIL_VERIFICATION, {
			expiresAt: new Date(Date.now() - MINUTE)
		});
		await seedToken('revoked', TokenType.EMAIL_VERIFICATION, { revokedAt: new Date() });
		await seedToken('reset', TokenType.PASSWORD_RESET);
		for (const token of ['unknown', 'old', 'revoked', 'reset']) {
			expect(await confirmEmail(token)).toBe('invalid');
		}
		expect((await customers())[0].isVerified).toBe(false);
	});
});

describe('sessions', () => {
	test('passwords are salted and checked in full', async () => {
		const [a, b] = [await hashPassword('secret'), await hashPassword('secret')];
		expect(a).not.toBe(b);
		expect(await verifyPassword('secret', a)).toBe(true);
		expect(await verifyPassword('Secret', a)).toBe(false);
	});

	test('a new session identifies the customer for 30 days', async () => {
		const token = generateSessionToken();
		expect(token).toMatch(/^[0-9a-f]{40}$/);
		const created = await createSession(token, 'cust-1');
		expect(created.expiresAt.getTime() - Date.now()).toBeGreaterThan(29 * DAY);

		const { user, session } = await validateSessionToken(token);
		expect(user).toEqual({
			id: 'cust-1',
			email: 'max@example.com',
			firstName: 'Max',
			lastName: 'Meier'
		});
		expect(session?.id).toBe(token);
	});

	test('unknown and expired sessions identify nobody', async () => {
		expect(await validateSessionToken('unknown')).toEqual({ session: null, user: null });
		await db.insert(sessionTable).values({
			id: 'expired',
			customerId: 'cust-1',
			expiresAt: new Date(Date.now() - MINUTE)
		});
		expect(await validateSessionToken('expired')).toEqual({ session: null, user: null });
	});

	test('a session in its last 15 days is extended, a younger one is not', async () => {
		const soon = new Date(Date.now() + 10 * DAY);
		const later = new Date(Date.now() + 25 * DAY);
		await db.insert(sessionTable).values([
			{ id: 'soon', customerId: 'cust-1', expiresAt: soon },
			{ id: 'later', customerId: 'cust-1', expiresAt: later }
		]);

		await validateSessionToken('soon');
		await validateSessionToken('later');

		const stored = async (id: string) =>
			(await db.select().from(sessionTable).where(eq(sessionTable.id, id)))[0].expiresAt;
		expect((await stored('soon')).getTime() - Date.now()).toBeGreaterThan(29 * DAY);
		expect((await stored('later')).getTime()).toBe(later.getTime());
	});

	test('invalidating a session ends it', async () => {
		const token = generateSessionToken();
		await createSession(token, 'cust-1');
		await invalidateSession(token);
		expect(await validateSessionToken(token)).toEqual({ session: null, user: null });
	});
});
