import { beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { customerTable, newsletterSubscriberTable } from '#lib/server/db/schema/index.js';
import {
	CONFIRM_TTL_MS,
	RESEND_COOLDOWN_MS,
	confirmSubscription,
	previewConfirmation,
	requestSubscription,
	unsubscribeSubscriber,
	withdrawSubscription
} from '#lib/server/newsletter.js';
import { NewsletterStatus } from '#lib/types.js';
import { resetDb, seedCustomer } from './fixtures.ts';

const subscriber = (email: string) =>
	db
		.select()
		.from(newsletterSubscriberTable)
		.where(eq(newsletterSubscriberTable.email, email))
		.get();

const consent = (id: string) =>
	db
		.select({ marketingConsent: customerTable.marketingConsent })
		.from(customerTable)
		.where(eq(customerTable.id, id))
		.get()?.marketingConsent;

function subscribeAndConfirm(email: string) {
	const outcome = requestSubscription(email, 'de');
	if (outcome.action !== 'send') throw new Error('expected a confirmation mail');
	confirmSubscription(outcome.confirmToken);
	return outcome;
}

beforeEach(async () => {
	await resetDb();
});

describe('newsletter double opt-in', () => {
	test('a new address stays pending and gets a lowercase confirmation token', () => {
		const outcome = requestSubscription('  Gast@Example.COM ', 'en');
		expect(outcome.action).toBe('send');

		const row = subscriber('gast@example.com');
		expect(row?.status).toBe(NewsletterStatus.PENDING);
		expect(row?.language).toBe('en');
		expect(row?.confirmedAt).toBeNull();
		expect(row?.confirmToken).toBe(outcome.action === 'send' ? outcome.confirmToken : null);
	});

	test('a repeated request inside the cooldown sends nothing', () => {
		const now = new Date();
		requestSubscription('gast@example.com', 'de', now);
		const again = requestSubscription(
			'gast@example.com',
			'de',
			new Date(now.getTime() + RESEND_COOLDOWN_MS - 1000)
		);
		expect(again.action).toBe('none');
	});

	test('after the cooldown a pending address gets a fresh token and the old one stops working', () => {
		const now = new Date();
		const first = requestSubscription('gast@example.com', 'de', now);
		const later = new Date(now.getTime() + RESEND_COOLDOWN_MS + 1000);
		const second = requestSubscription('gast@example.com', 'de', later);

		expect(first.action === 'send' && second.action === 'send').toBe(true);
		if (first.action !== 'send' || second.action !== 'send') return;
		expect(second.confirmToken).not.toBe(first.confirmToken);
		expect(second.unsubscribeToken).toBe(first.unsubscribeToken);
		expect(confirmSubscription(first.confirmToken, later).state).toBe('invalid');
		expect(confirmSubscription(second.confirmToken, later).state).toBe('confirmed');
	});

	test('opening the link only previews, the button confirms and records consent', () => {
		const outcome = requestSubscription('gast@example.com', 'de');
		if (outcome.action !== 'send') throw new Error('expected a confirmation mail');

		expect(previewConfirmation(outcome.confirmToken)).toBe('ready');
		expect(subscriber('gast@example.com')?.status).toBe(NewsletterStatus.PENDING);

		const result = confirmSubscription(outcome.confirmToken);
		expect(result).toEqual({
			state: 'confirmed',
			email: 'gast@example.com',
			unsubscribeToken: outcome.unsubscribeToken
		});
		const row = subscriber('gast@example.com');
		expect(row?.status).toBe(NewsletterStatus.CONFIRMED);
		expect(row?.confirmedAt).toBeInstanceOf(Date);
		expect(row?.confirmToken).toBeNull();

		// the link is single use
		expect(confirmSubscription(outcome.confirmToken).state).toBe('invalid');
		expect(previewConfirmation(outcome.confirmToken)).toBe('invalid');
	});

	test('an expired or unknown token confirms nothing', () => {
		const now = new Date();
		const outcome = requestSubscription('gast@example.com', 'de', now);
		if (outcome.action !== 'send') throw new Error('expected a confirmation mail');
		const expired = new Date(now.getTime() + CONFIRM_TTL_MS + 1000);

		expect(previewConfirmation(outcome.confirmToken, expired)).toBe('invalid');
		expect(confirmSubscription(outcome.confirmToken, expired).state).toBe('invalid');
		expect(confirmSubscription('nope').state).toBe('invalid');
		expect(subscriber('gast@example.com')?.status).toBe(NewsletterStatus.PENDING);
	});

	test('a confirmed address is not asked again', () => {
		subscribeAndConfirm('gast@example.com');
		expect(requestSubscription('gast@example.com', 'de').action).toBe('none');
		expect(subscriber('gast@example.com')?.status).toBe(NewsletterStatus.CONFIRMED);
	});

	test('confirming turns on the consent flag of a matching customer, case-insensitive', async () => {
		await seedCustomer();
		expect(consent('cust-1')).toBe(false);
		subscribeAndConfirm('MAX@example.com');
		expect(consent('cust-1')).toBe(true);
	});
});

describe('newsletter unsubscribe', () => {
	test('the subscriber link unsubscribes once and is idempotent', async () => {
		await seedCustomer();
		const { unsubscribeToken } = subscribeAndConfirm('max@example.com');

		expect(unsubscribeSubscriber(unsubscribeToken)).toBe('success');
		const row = subscriber('max@example.com');
		expect(row?.status).toBe(NewsletterStatus.UNSUBSCRIBED);
		expect(row?.unsubscribedAt).toBeInstanceOf(Date);
		expect(consent('cust-1')).toBe(false);

		expect(unsubscribeSubscriber(unsubscribeToken)).toBe('already_unsubscribed');
		expect(unsubscribeSubscriber('nope')).toBe('invalid');
	});

	test('signing up again after an unsubscribe needs a new confirmation', () => {
		const { unsubscribeToken } = subscribeAndConfirm('gast@example.com');
		unsubscribeSubscriber(unsubscribeToken);

		const outcome = requestSubscription('gast@example.com', 'de');
		expect(outcome.action).toBe('send');
		const row = subscriber('gast@example.com');
		expect(row?.status).toBe(NewsletterStatus.PENDING);
		expect(row?.confirmedAt).toBeNull();
	});

	test('withdrawing consent in the account unsubscribes a matching subscriber', () => {
		subscribeAndConfirm('gast@example.com');
		withdrawSubscription('Gast@example.com');
		expect(subscriber('gast@example.com')?.status).toBe(NewsletterStatus.UNSUBSCRIBED);
		// nothing to withdraw for an unknown address
		expect(() => withdrawSubscription('niemand@example.com')).not.toThrow();
	});
});
