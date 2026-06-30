import type { Actions, PageServerLoad } from './$types';
import { and, eq, gt, isNull } from 'drizzle-orm';
import db from '$lib/server/db';
import { tokenTable, customerTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';

async function processToken(token: string): Promise<'success' | 'already_unsubscribed' | 'invalid'> {
	const [result] = await db
		.select({
			token: tokenTable.token,
			usedAt: tokenTable.usedAt,
			customerId: tokenTable.customerId,
			marketingConsent: customerTable.marketingConsent
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

	if (!result) return 'invalid';
	if (result.usedAt) return 'already_unsubscribed';

	db.transaction((tx) => {
		tx.update(customerTable)
			.set({ marketingConsent: false, updatedAt: new Date() })
			.where(eq(customerTable.id, result.customerId))
			.run();
		tx.update(tokenTable)
			.set({ usedAt: new Date() })
			.where(eq(tokenTable.token, token))
			.run();
	});

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
