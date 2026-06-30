import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { and, eq, gt, isNull } from 'drizzle-orm';
import db from '$lib/server/db';
import { tokenTable, customerTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';
import { sendVerificationEmail } from '$lib/server/functions';

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	if (locals.user?.id) {
		const [customer] = await db
			.select({ isVerified: customerTable.isVerified })
			.from(customerTable)
			.where(eq(customerTable.id, locals.user.id));
		if (customer?.isVerified) redirect(302, '/');
	}

	const token = url.searchParams.get('token');
	if (!token) {
		if (!locals.user) redirect(302, '/login');
		return { status: 'pending' as const };
	}

	const [row] = await db
		.select({ token: tokenTable.token, usedAt: tokenTable.usedAt, customerId: tokenTable.customerId })
		.from(tokenTable)
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.EMAIL_VERIFICATION),
				gt(tokenTable.expiresAt, new Date()),
				isNull(tokenTable.revokedAt)
			)
		);

	if (!row) return { status: 'invalid' as const };
	if (row.usedAt) return { status: 'already_verified' as const };

	db.transaction((tx) => {
		tx.update(customerTable)
			.set({ isVerified: true, updatedAt: new Date() })
			.where(eq(customerTable.id, row.customerId))
			.run();
		tx.update(tokenTable)
			.set({ usedAt: new Date() })
			.where(eq(tokenTable.token, token))
			.run();
	});

	cookies.set('show_welcome', '1', {
		path: '/',
		httpOnly: false,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return { status: 'success' as const };
};

export const actions: Actions = {
	resend: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		const [customer] = await db
			.select({
				id: customerTable.id,
				email: customerTable.email,
				firstName: customerTable.firstName,
				isVerified: customerTable.isVerified
			})
			.from(customerTable)
			.where(eq(customerTable.id, locals.user.id));

		if (!customer || customer.isVerified) redirect(302, '/');

		await sendVerificationEmail(customer.id, customer.email, customer.firstName);

		return { resent: true };
	}
};
