import type { Actions, PageServerLoad } from './$types';
import { and, eq, gt, isNull } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { tokenTable, customerTable } from '#lib/server/db/schema/index.js';
import { TokenType } from '#lib/types.js';
import { unsubscribeSubscriber, withdrawSubscription } from '#lib/server/newsletter.js';

async function processToken(
	token: string
): Promise<'success' | 'already_unsubscribed' | 'invalid'> {
	const [result] = await db
		.select({
			token: tokenTable.token,
			usedAt: tokenTable.usedAt,
			customerId: tokenTable.customerId,
			email: customerTable.email
		})
		.from(tokenTable)
		.innerJoin(customerTable, eq(tokenTable.customerId, customerTable.id))
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.NEWSLETTER_UNSUBSCRIBE),
				gt(tokenTable.expiresAt, new Date()),
				isNull(tokenTable.revokedAt)
			)
		);

	// not a customer token: it may belong to a newsletter subscriber without an account
	if (!result) return unsubscribeSubscriber(token);
	if (result.usedAt) return 'already_unsubscribed';

	db.transaction((tx) => {
		tx.update(customerTable)
			.set({ marketingConsent: false, updatedAt: new Date() })
			.where(eq(customerTable.id, result.customerId))
			.run();
		tx.update(tokenTable).set({ usedAt: new Date() }).where(eq(tokenTable.token, token)).run();
	});
	withdrawSubscription(result.email);

	return 'success';
}

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) return { status: 'notoken' as const };
	const status = await processToken(token);
	return { status };
};

// RFC 8058 one-click unsubscribe: email clients POST with List-Unsubscribe=One-Click
export const actions: Actions = {
	default: async ({ url }) => {
		const token = url.searchParams.get('token');
		if (!token) return { status: 'notoken' as const };
		const status = await processToken(token);
		return { status };
	}
};
