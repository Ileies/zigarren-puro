import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { and, eq, gt, isNull } from 'drizzle-orm';
import db from '$lib/server/db';
import { tokenTable, authCredentialsTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';
import { hashPassword } from '$lib/server/auth';

async function resolveToken(token: string) {
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
				gt(tokenTable.expiresAt, new Date()),
				isNull(tokenTable.revokedAt)
			)
		);
	return row ?? null;
}

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user) redirect(302, '/');

	const token = url.searchParams.get('token');
	if (!token) return { status: 'missing' as const };

	const row = await resolveToken(token);
	if (!row) return { status: 'invalid' as const };
	if (row.usedAt) return { status: 'used' as const };

	return { status: 'valid' as const, token };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const token = data.get('token')?.toString();
		const password = data.get('password')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!token || !password || !confirmPassword) {
			return fail(400, { error: 'Alle Felder sind erforderlich.' });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Die Passwörter stimmen nicht überein.' });
		}

		const row = await resolveToken(token);
		if (!row || row.usedAt) {
			return fail(400, { error: 'Dieser Link ist ungültig oder abgelaufen.' });
		}

		const passwordHash = await hashPassword(password);

		db.transaction((tx) => {
			tx.update(authCredentialsTable)
				.set({ passwordHash, failedAttempts: 0, lockedUntil: null, updatedAt: new Date() })
				.where(eq(authCredentialsTable.customerId, row.customerId))
				.run();
			tx.update(tokenTable).set({ usedAt: new Date() }).where(eq(tokenTable.token, token)).run();
		});

		redirect(302, '/login?reset=1');
	}
};
