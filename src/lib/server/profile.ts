import { and, eq, gt, isNull, ne } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	authCredentialsTable,
	customerTable,
	sessionTable,
	tokenTable
} from '#lib/server/db/schema/index.js';
import { hashPassword } from '#lib/server/auth.js';
import { checkPassword, MIN_PASSWORD_LENGTH, type LoginError } from '#lib/server/accounts.js';
import { Gender, TokenType } from '#lib/types.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 40;

// The routes turn these codes into messages in the visitor's language.

// ─── Profile ─────────────────────────────────────────────────────────────────

export type ProfileError = { code: 'nameRequired' } | { code: 'invalidRequest' };

export type ProfileInput = {
	firstName: string;
	lastName: string;
	phone: string | null;
	gender: Gender | null;
	marketingConsent: boolean;
};

export function parseProfileForm(
	data: FormData
): { ok: true; value: ProfileInput } | { ok: false; error: ProfileError } {
	const firstName = data.get('firstName')?.toString().trim() ?? '';
	const lastName = data.get('lastName')?.toString().trim() ?? '';
	const phone = data.get('phone')?.toString().trim() ?? '';
	const gender = data.get('gender')?.toString() ?? '';

	if (!firstName || !lastName) return { ok: false, error: { code: 'nameRequired' } };
	if (
		firstName.length > MAX_NAME_LENGTH ||
		lastName.length > MAX_NAME_LENGTH ||
		phone.length > MAX_PHONE_LENGTH ||
		(gender && !Object.values(Gender).includes(gender as Gender))
	) {
		return { ok: false, error: { code: 'invalidRequest' } };
	}

	return {
		ok: true,
		value: {
			firstName,
			lastName,
			phone: phone || null,
			gender: (gender as Gender) || null,
			marketingConsent: data.get('marketingConsent') === 'on'
		}
	};
}

/** Saves the profile. Choosing "no answer" for the title clears it. */
export async function updateProfile(customerId: string, input: ProfileInput, now = new Date()) {
	await db
		.update(customerTable)
		.set({ ...input, updatedAt: now })
		.where(eq(customerTable.id, customerId));
}

// ─── Password ────────────────────────────────────────────────────────────────

export type PasswordChangeError =
	| { code: 'fieldsRequired' }
	| { code: 'passwordTooShort' }
	| { code: 'passwordMismatch' }
	| { code: 'currentPasswordWrong' }
	| { code: 'locked'; minutes: number };

/** A failed password check as the two answers a signed-in customer can get. */
const lockedOrWrong = (
	error: LoginError
): { code: 'locked'; minutes: number } | { code: 'currentPasswordWrong' } =>
	error.code === 'locked' ? error : { code: 'currentPasswordWrong' };

/**
 * Changes the password of a signed-in customer. The current password counts towards the login
 * lock. Every other session is closed, the one the customer is using stays.
 */
export async function changePassword(
	customerId: string,
	input: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
		keepSessionId?: string;
	},
	now: Date = new Date()
): Promise<{ ok: true } | { ok: false; error: PasswordChangeError }> {
	const { currentPassword, newPassword, confirmPassword, keepSessionId } = input;

	if (!currentPassword || !newPassword || !confirmPassword) {
		return { ok: false, error: { code: 'fieldsRequired' } };
	}
	if (newPassword.length < MIN_PASSWORD_LENGTH) {
		return { ok: false, error: { code: 'passwordTooShort' } };
	}
	if (newPassword !== confirmPassword) return { ok: false, error: { code: 'passwordMismatch' } };

	const check = await checkPassword(customerId, currentPassword, now);
	if (!check.ok) return { ok: false, error: lockedOrWrong(check.error) };

	const passwordHash = await hashPassword(newPassword);
	db.transaction((tx) => {
		tx.update(authCredentialsTable)
			.set({ passwordHash, updatedAt: now })
			.where(eq(authCredentialsTable.customerId, customerId))
			.run();
		tx.delete(sessionTable)
			.where(
				and(
					eq(sessionTable.customerId, customerId),
					keepSessionId ? ne(sessionTable.id, keepSessionId) : undefined
				)
			)
			.run();
	});
	return { ok: true };
}

// ─── Email change ────────────────────────────────────────────────────────────

export type EmailChangeError =
	| { code: 'fieldsRequired' }
	| { code: 'invalidEmail' }
	| { code: 'emailSame' }
	| { code: 'emailTaken' }
	| { code: 'currentPasswordWrong' }
	| { code: 'locked'; minutes: number };

/**
 * Checks a request to change the email. On success the caller sends the confirmation mail to the
 * new address, which also revokes the links sent earlier.
 */
export async function requestEmailChange(
	customerId: string,
	newEmailInput: string | null | undefined,
	currentPassword: string | null | undefined,
	now: Date = new Date()
): Promise<
	{ ok: true; newEmail: string; firstName: string } | { ok: false; error: EmailChangeError }
> {
	const refuse = (error: EmailChangeError) => ({ ok: false, error }) as const;

	const newEmail = newEmailInput?.trim().toLowerCase() ?? '';
	if (!newEmail || !currentPassword) return refuse({ code: 'fieldsRequired' });
	if (!EMAIL_PATTERN.test(newEmail)) return refuse({ code: 'invalidEmail' });

	const [customer] = await db
		.select({ email: customerTable.email, firstName: customerTable.firstName })
		.from(customerTable)
		.where(eq(customerTable.id, customerId));
	if (!customer) return refuse({ code: 'fieldsRequired' });

	// The password comes before the "taken" answer, so the form does not reveal registered emails
	const check = await checkPassword(customerId, currentPassword, now);
	if (!check.ok) return refuse(lockedOrWrong(check.error));

	if (newEmail === customer.email) return refuse({ code: 'emailSame' });

	const [existing] = await db
		.select({ id: customerTable.id })
		.from(customerTable)
		.where(eq(customerTable.email, newEmail));
	if (existing) return refuse({ code: 'emailTaken' });

	return { ok: true, newEmail, firstName: customer.firstName };
}

export type EmailChangeStatus = 'invalid' | 'already_used' | 'email_taken' | 'success';

/** Applies a confirmed email change. The link works once and only for the customer it was sent to. */
export async function confirmEmailChange(
	customerId: string,
	token: string | null | undefined,
	now: Date = new Date()
): Promise<
	{ status: Exclude<EmailChangeStatus, 'success'> } | { status: 'success'; newEmail: string }
> {
	if (!token) return { status: 'invalid' };

	const [row] = await db
		.select({
			usedAt: tokenTable.usedAt,
			customerId: tokenTable.customerId,
			metadata: tokenTable.metadata
		})
		.from(tokenTable)
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.EMAIL_CHANGE),
				gt(tokenTable.expiresAt, now),
				isNull(tokenTable.revokedAt)
			)
		);

	if (!row || row.customerId !== customerId || !row.metadata) return { status: 'invalid' };
	if (row.usedAt) return { status: 'already_used' };

	const newEmail = row.metadata;
	const [existing] = await db
		.select({ id: customerTable.id })
		.from(customerTable)
		.where(eq(customerTable.email, newEmail));
	if (existing) return { status: 'email_taken' };

	try {
		const claimed = db.transaction((tx) => {
			const claim = tx
				.update(tokenTable)
				.set({ usedAt: now })
				.where(and(eq(tokenTable.token, token), isNull(tokenTable.usedAt)))
				.returning({ token: tokenTable.token })
				.all();
			// The same link opened twice at the same moment
			if (claim.length === 0) return false;
			tx.update(customerTable)
				.set({ email: newEmail, updatedAt: now })
				.where(eq(customerTable.id, customerId))
				.run();
			return true;
		});
		return claimed ? { status: 'success', newEmail } : { status: 'already_used' };
	} catch (error) {
		// Someone registered this address between the check and the update
		if (String(error).includes('UNIQUE')) return { status: 'email_taken' };
		throw error;
	}
}
