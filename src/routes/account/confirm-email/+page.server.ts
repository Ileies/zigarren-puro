import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { and, eq, gt, isNull } from 'drizzle-orm';
import db from '$lib/server/db';
import { tokenTable, customerTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) redirect(302, '/login');

	const token = url.searchParams.get('token');
	if (!token) return { status: 'invalid' as const };

	const [row] = await db
		.select({
			token: tokenTable.token,
			usedAt: tokenTable.usedAt,
			revokedAt: tokenTable.revokedAt,
			customerId: tokenTable.customerId,
			metadata: tokenTable.metadata
		})
		.from(tokenTable)
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.EMAIL_CHANGE),
				gt(tokenTable.expiresAt, new Date()),
				isNull(tokenTable.revokedAt)
			)
		);

	if (!row) return { status: 'invalid' as const };
	if (row.usedAt) return { status: 'already_used' as const };
	if (row.customerId !== locals.user.id) return { status: 'invalid' as const };

	const newEmail = row.metadata;
	if (!newEmail) return { status: 'invalid' as const };

	const [existing] = await db
		.select({ id: customerTable.id })
		.from(customerTable)
		.where(eq(customerTable.email, newEmail));

	if (existing) return { status: 'email_taken' as const };

	await db.transaction(async (tx) => {
		await tx
			.update(customerTable)
			.set({ email: newEmail, updatedAt: new Date() })
			.where(eq(customerTable.id, row.customerId));
		await tx
			.update(tokenTable)
			.set({ usedAt: new Date() })
			.where(eq(tokenTable.token, token));
	});

	return { status: 'success' as const, newEmail };
};
