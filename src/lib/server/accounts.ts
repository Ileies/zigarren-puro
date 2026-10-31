import { and, eq, gt, isNull } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	authCredentialsTable,
	customerTable,
	sessionTable,
	tokenTable
} from '#lib/server/db/schema/index.js';
import { hashPassword, verifyPassword } from '#lib/server/auth.js';
import { ageOn, MINIMUM_AGE } from '#lib/age.js';
import { Gender, TokenType } from '#lib/types.js';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
export const MIN_PASSWORD_LENGTH = 8;

const MINUTE_MS = 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normaliseEmail = (email: string | null | undefined) => email?.trim().toLowerCase() ?? '';

// ─── Login ───────────────────────────────────────────────────────────────────

/** Why a login was refused. The route turns the code into a message in the visitor's language. */
export type LoginError =
	| { code: 'credentialsRequired' }
	| { code: 'invalidCredentials' }
	| { code: 'locked'; minutes: number };

export type LoginResult =
	| { ok: true; customer: { id: string; isVerified: boolean } }
	| { ok: false; error: LoginError };

/**
 * Checks an email and password. After `MAX_FAILED_ATTEMPTS` wrong passwords the account is
 * locked for `LOCK_MINUTES`, and a locked account refuses even the right password. Once the lock
 * has run out the counter starts again, so the next typo does not lock the account at once.
 * Unknown emails and wrong passwords give the same answer.
 */
export async function authenticate(
	email: string | null | undefined,
	password: string | null | undefined,
	now: Date = new Date()
): Promise<LoginResult> {
	const address = normaliseEmail(email);
	if (!address || !password) return { ok: false, error: { code: 'credentialsRequired' } };

	const [customer] = await db
		.select({ id: customerTable.id, isVerified: customerTable.isVerified })
		.from(customerTable)
		.where(eq(customerTable.email, address));
	if (!customer) return { ok: false, error: { code: 'invalidCredentials' } };

	const check = await checkPassword(customer.id, password, now);
	if (!check.ok) return { ok: false, error: check.error };
	return { ok: true, customer };
}

/**
 * Checks the password of a known customer and keeps the failed-attempt counter and the lock.
 * Login uses it, and so does every action that asks a signed-in customer for the current
 * password, so a stolen session cannot be used to guess the password without limit.
 */
export async function checkPassword(
	customerId: string,
	password: string,
	now: Date = new Date()
): Promise<{ ok: true } | { ok: false; error: LoginError }> {
	const invalid = { ok: false, error: { code: 'invalidCredentials' } } as const;

	const [credentials] = await db
		.select()
		.from(authCredentialsTable)
		.where(eq(authCredentialsTable.customerId, customerId));
	if (!credentials) return invalid;

	const lockActive = credentials.lockedUntil !== null && credentials.lockedUntil > now;
	if (lockActive) {
		const minutes = Math.ceil((credentials.lockedUntil!.getTime() - now.getTime()) / MINUTE_MS);
		return { ok: false, error: { code: 'locked', minutes } };
	}

	if (!(await verifyPassword(password, credentials.passwordHash))) {
		const lockRanOut = credentials.lockedUntil !== null;
		const attempts = (lockRanOut ? 0 : credentials.failedAttempts) + 1;
		const lockedUntil =
			attempts >= MAX_FAILED_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * MINUTE_MS) : null;
		await db
			.update(authCredentialsTable)
			.set({ failedAttempts: attempts, lockedUntil, updatedAt: now })
			.where(eq(authCredentialsTable.customerId, customerId));
		return invalid;
	}

	await db
		.update(authCredentialsTable)
		.set({ failedAttempts: 0, lockedUntil: null, updatedAt: now })
		.where(eq(authCredentialsTable.customerId, customerId));
	return { ok: true };
}

// ─── Registration ────────────────────────────────────────────────────────────

export type RegistrationInput = {
	email: string;
	password: string;
	passwordConfirm: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	gender: string | null;
	phone: string | null;
	marketingConsent: boolean;
	acceptTerms: boolean;
	language: string;
};

export type RegistrationError =
	| { code: 'requiredFields' }
	| { code: 'invalidEmail' }
	| { code: 'passwordTooShort' }
	| { code: 'passwordMismatch' }
	| { code: 'invalidBirthDate' }
	| { code: 'underage' }
	| { code: 'acceptTerms' }
	| { code: 'emailTaken' };

export type RegistrationResult =
	| { ok: true; customer: { id: string; email: string; firstName: string } }
	| { ok: false; error: RegistrationError };

export function parseRegistrationForm(data: FormData, language: string): RegistrationInput {
	const text = (key: string) => data.get(key)?.toString().trim() ?? '';
	return {
		email: normaliseEmail(data.get('email')?.toString()),
		password: data.get('password')?.toString() ?? '',
		passwordConfirm: data.get('passwordConfirm')?.toString() ?? '',
		firstName: text('firstName'),
		lastName: text('lastName'),
		birthDate: data.get('birthDate')?.toString() ?? '',
		gender: data.get('gender')?.toString() || null,
		phone: text('phone') || null,
		marketingConsent: data.get('marketingConsent') === 'on',
		acceptTerms: data.get('acceptTerms') === 'on',
		language
	};
}

/** Creates the customer and the login in one transaction. Nothing is saved when a check fails. */
export async function registerCustomer(
	input: RegistrationInput,
	now: Date = new Date()
): Promise<RegistrationResult> {
	const refuse = (error: RegistrationError): RegistrationResult => ({ ok: false, error });
	const { email, password, firstName, lastName, birthDate } = input;

	if (!email || !password || !firstName || !lastName || !birthDate) {
		return refuse({ code: 'requiredFields' });
	}
	if (!EMAIL_PATTERN.test(email)) return refuse({ code: 'invalidEmail' });
	if (password.length < MIN_PASSWORD_LENGTH) return refuse({ code: 'passwordTooShort' });
	if (password !== input.passwordConfirm) return refuse({ code: 'passwordMismatch' });
	if (isNaN(new Date(birthDate).getTime())) return refuse({ code: 'invalidBirthDate' });
	if (ageOn(birthDate, now) < MINIMUM_AGE) return refuse({ code: 'underage' });
	if (!input.acceptTerms) return refuse({ code: 'acceptTerms' });

	const [existing] = await db
		.select({ id: customerTable.id })
		.from(customerTable)
		.where(eq(customerTable.email, email));
	if (existing) return refuse({ code: 'emailTaken' });

	const passwordHash = await hashPassword(password);

	try {
		const customer = db.transaction((tx) => {
			const created = tx
				.insert(customerTable)
				.values({
					email,
					firstName,
					lastName,
					birthDate,
					gender: input.gender ? (input.gender as Gender) : undefined,
					phone: input.phone,
					marketingConsent: input.marketingConsent,
					preferredLanguage: input.language
				})
				.returning({ id: customerTable.id })
				.get();
			tx.insert(authCredentialsTable).values({ customerId: created.id, passwordHash }).run();
			return created;
		});
		return { ok: true, customer: { id: customer.id, email, firstName } };
	} catch (err) {
		// Someone registered the same email between the check and the insert
		if (err instanceof Error && err.message.includes('UNIQUE')) {
			return refuse({ code: 'emailTaken' });
		}
		throw err;
	}
}

// ─── Password reset ──────────────────────────────────────────────────────────

export type ResetLinkStatus = 'missing' | 'invalid' | 'used' | 'valid';

export type PasswordResetError =
	| { code: 'fieldsRequired' }
	| { code: 'passwordTooShort' }
	| { code: 'passwordMismatch' }
	| { code: 'linkInvalid' };

async function findResetToken(token: string, now: Date) {
	const [row] = await db
		.select({
			token: tokenTable.token,
			customerId: tokenTable.customerId,
			usedAt: tokenTable.usedAt
		})
		.from(tokenTable)
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.PASSWORD_RESET),
				gt(tokenTable.expiresAt, now),
				isNull(tokenTable.revokedAt)
			)
		);
	return row ?? null;
}

/** What the reset page shows for the link the customer opened. */
export async function resetLinkStatus(
	token: string | null,
	now: Date = new Date()
): Promise<ResetLinkStatus> {
	if (!token) return 'missing';
	const row = await findResetToken(token, now);
	if (!row) return 'invalid';
	return row.usedAt ? 'used' : 'valid';
}

/**
 * Sets a new password with a reset link, which works once. The failed-login counter is cleared
 * and every open session is closed, so whoever knew the old password is signed out.
 */
export async function resetPassword(
	token: string | null | undefined,
	password: string | null | undefined,
	confirmPassword: string | null | undefined,
	now: Date = new Date()
): Promise<{ ok: true } | { ok: false; error: PasswordResetError }> {
	const refuse = (error: PasswordResetError) => ({ ok: false, error }) as const;

	if (!token || !password || !confirmPassword) return refuse({ code: 'fieldsRequired' });
	if (password.length < MIN_PASSWORD_LENGTH) return refuse({ code: 'passwordTooShort' });
	if (password !== confirmPassword) return refuse({ code: 'passwordMismatch' });

	const row = await findResetToken(token, now);
	if (!row || row.usedAt) return refuse({ code: 'linkInvalid' });

	const passwordHash = await hashPassword(password);

	db.transaction((tx) => {
		const claimed = tx
			.update(tokenTable)
			.set({ usedAt: now })
			.where(and(eq(tokenTable.token, token), isNull(tokenTable.usedAt)))
			.returning({ token: tokenTable.token })
			.all();
		// A second request with the same link, sent at the same time, finds the token used
		if (claimed.length === 0) return;
		tx.update(authCredentialsTable)
			.set({ passwordHash, failedAttempts: 0, lockedUntil: null, updatedAt: now })
			.where(eq(authCredentialsTable.customerId, row.customerId))
			.run();
		tx.delete(sessionTable).where(eq(sessionTable.customerId, row.customerId)).run();
	});
	return { ok: true };
}

// ─── Email verification ──────────────────────────────────────────────────────

export type VerificationStatus = 'invalid' | 'already_verified' | 'success';

/** Confirms the email behind a verification link. The link works once. */
export async function confirmEmail(
	token: string,
	now: Date = new Date()
): Promise<VerificationStatus> {
	const [row] = await db
		.select({ usedAt: tokenTable.usedAt, customerId: tokenTable.customerId })
		.from(tokenTable)
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.EMAIL_VERIFICATION),
				gt(tokenTable.expiresAt, now),
				isNull(tokenTable.revokedAt)
			)
		);
	if (!row) return 'invalid';
	if (row.usedAt) return 'already_verified';

	db.transaction((tx) => {
		tx.update(customerTable)
			.set({ isVerified: true, updatedAt: now })
			.where(eq(customerTable.id, row.customerId))
			.run();
		tx.update(tokenTable).set({ usedAt: now }).where(eq(tokenTable.token, token)).run();
	});
	return 'success';
}
