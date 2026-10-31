import { and, eq, ne, sql } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { customerTable, newsletterSubscriberTable } from '#lib/server/db/schema/index.js';
import { NewsletterStatus } from '#lib/types.js';

export const CONFIRM_TTL_MS = 1000 * 60 * 60 * 48;
export const RESEND_COOLDOWN_MS = 1000 * 60 * 10;

function generateToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(24));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export type SubscribeOutcome =
	| { action: 'send'; email: string; confirmToken: string; unsubscribeToken: string }
	| { action: 'none' };

/**
 * Starts (or restarts) a double opt-in. The caller sends the confirmation mail when the outcome is
 * `send`. Confirmed addresses and repeated requests inside the cooldown yield `none`, so the form
 * can answer the same way every time and does not reveal who is subscribed.
 */
export function requestSubscription(
	rawEmail: string,
	language: string | null,
	now = new Date()
): SubscribeOutcome {
	const email = normalizeEmail(rawEmail);

	return db.transaction((tx): SubscribeOutcome => {
		const existing = tx
			.select()
			.from(newsletterSubscriberTable)
			.where(eq(newsletterSubscriberTable.email, email))
			.get();

		if (existing?.status === NewsletterStatus.CONFIRMED) return { action: 'none' as const };

		if (
			existing?.status === NewsletterStatus.PENDING &&
			now.getTime() - existing.requestedAt.getTime() < RESEND_COOLDOWN_MS
		) {
			return { action: 'none' as const };
		}

		const confirmToken = generateToken();
		const confirmExpiresAt = new Date(now.getTime() + CONFIRM_TTL_MS);

		if (existing) {
			// pending past the cooldown, or unsubscribed and signing up again: new consent is needed
			tx.update(newsletterSubscriberTable)
				.set({
					status: NewsletterStatus.PENDING,
					language,
					confirmToken,
					confirmExpiresAt,
					requestedAt: now,
					confirmedAt: null
				})
				.where(eq(newsletterSubscriberTable.id, existing.id))
				.run();
			return {
				action: 'send' as const,
				email,
				confirmToken,
				unsubscribeToken: existing.unsubscribeToken
			};
		}

		const unsubscribeToken = generateToken();
		tx.insert(newsletterSubscriberTable)
			.values({
				email,
				status: NewsletterStatus.PENDING,
				language,
				confirmToken,
				confirmExpiresAt,
				unsubscribeToken,
				requestedAt: now
			})
			.run();
		return { action: 'send' as const, email, confirmToken, unsubscribeToken };
	});
}

/** Read-only check, so mail scanners that open the link do not confirm anything. */
export function previewConfirmation(token: string, now = new Date()): 'ready' | 'invalid' {
	const row = db
		.select()
		.from(newsletterSubscriberTable)
		.where(eq(newsletterSubscriberTable.confirmToken, token))
		.get();
	if (!row || row.status !== NewsletterStatus.PENDING) return 'invalid';
	if (!row.confirmExpiresAt || row.confirmExpiresAt <= now) return 'invalid';
	return 'ready';
}

export type ConfirmResult =
	| { state: 'confirmed'; email: string; unsubscribeToken: string }
	| { state: 'invalid' };

export function confirmSubscription(token: string, now = new Date()): ConfirmResult {
	return db.transaction((tx): ConfirmResult => {
		const row = tx
			.select()
			.from(newsletterSubscriberTable)
			.where(eq(newsletterSubscriberTable.confirmToken, token))
			.get();
		if (!row || row.status !== NewsletterStatus.PENDING) return { state: 'invalid' };
		if (!row.confirmExpiresAt || row.confirmExpiresAt <= now) return { state: 'invalid' };

		tx.update(newsletterSubscriberTable)
			.set({
				status: NewsletterStatus.CONFIRMED,
				confirmedAt: now,
				unsubscribedAt: null,
				confirmToken: null,
				confirmExpiresAt: null
			})
			.where(eq(newsletterSubscriberTable.id, row.id))
			.run();
		setCustomerConsent(tx, row.email, true, now);
		return { state: 'confirmed', email: row.email, unsubscribeToken: row.unsubscribeToken };
	});
}

export type UnsubscribeState = 'success' | 'already_unsubscribed' | 'invalid';

/** Unsubscribe link for subscribers. Idempotent and never expires. */
export function unsubscribeSubscriber(token: string, now = new Date()): UnsubscribeState {
	return db.transaction((tx): UnsubscribeState => {
		const row = tx
			.select()
			.from(newsletterSubscriberTable)
			.where(eq(newsletterSubscriberTable.unsubscribeToken, token))
			.get();
		if (!row) return 'invalid';
		if (row.status === NewsletterStatus.UNSUBSCRIBED) return 'already_unsubscribed';

		tx.update(newsletterSubscriberTable)
			.set({
				status: NewsletterStatus.UNSUBSCRIBED,
				unsubscribedAt: now,
				confirmToken: null,
				confirmExpiresAt: null
			})
			.where(eq(newsletterSubscriberTable.id, row.id))
			.run();
		setCustomerConsent(tx, row.email, false, now);
		return 'success';
	});
}

/** Keeps the subscriber list in line when an account holder withdraws consent in the account. */
export function withdrawSubscription(rawEmail: string, now = new Date()): void {
	db.update(newsletterSubscriberTable)
		.set({
			status: NewsletterStatus.UNSUBSCRIBED,
			unsubscribedAt: now,
			confirmToken: null,
			confirmExpiresAt: null
		})
		.where(
			and(
				eq(newsletterSubscriberTable.email, normalizeEmail(rawEmail)),
				ne(newsletterSubscriberTable.status, NewsletterStatus.UNSUBSCRIBED)
			)
		)
		.run();
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// The registration checkbox and the account page keep their own flag, so both stay consistent.
function setCustomerConsent(tx: Tx, email: string, consent: boolean, now: Date) {
	tx.update(customerTable)
		.set({ marketingConsent: consent, updatedAt: now })
		.where(sql`lower(${customerTable.email}) = ${email}`)
		.run();
}
