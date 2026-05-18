import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '$lib/server/db';
import { authCredentialsTable, customerTable } from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { email, error: 'E-Mail und Passwort sind erforderlich.' });
		}

		const [customer] = await db
			.select({ id: customerTable.id })
			.from(customerTable)
			.where(eq(customerTable.email, email));

		if (!customer) {
			return fail(401, { email, error: 'E-Mail oder Passwort ist falsch.' });
		}

		const [credentials] = await db
			.select()
			.from(authCredentialsTable)
			.where(eq(authCredentialsTable.customerId, customer.id));

		if (!credentials) {
			return fail(401, { email, error: 'E-Mail oder Passwort ist falsch.' });
		}

		if (credentials.lockedUntil && credentials.lockedUntil > new Date()) {
			const minutes = Math.ceil((credentials.lockedUntil.getTime() - Date.now()) / 60000);
			return fail(429, {
				email,
				error: `Konto gesperrt. Bitte warten Sie noch ${minutes} Minute(n).`
			});
		}

		const valid = await auth.verifyPassword(password, credentials.passwordHash);

		if (!valid) {
			const attempts = credentials.failedAttempts + 1;
			const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
			await db
				.update(authCredentialsTable)
				.set({ failedAttempts: attempts, lockedUntil, updatedAt: new Date() })
				.where(eq(authCredentialsTable.customerId, customer.id));
			return fail(401, { email, error: 'E-Mail oder Passwort ist falsch.' });
		}

		await db
			.update(authCredentialsTable)
			.set({ failedAttempts: 0, lockedUntil: null, updatedAt: new Date() })
			.where(eq(authCredentialsTable.customerId, customer.id));

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, customer.id);
		auth.setSessionTokenCookie(event, token, session.expiresAt);

		redirect(302, '/');
	}
};
