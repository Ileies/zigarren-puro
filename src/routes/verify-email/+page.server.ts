import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { customerTable } from '#lib/server/db/schema/index.js';
import { confirmEmail } from '#lib/server/accounts.js';
import { sendVerificationEmail } from '#lib/server/functions.js';

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

	const status = await confirmEmail(token);

	if (status === 'success') {
		cookies.set('show_welcome', '1', {
			path: '/',
			httpOnly: false,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
	}

	return { status };
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
