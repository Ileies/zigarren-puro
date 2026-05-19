import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '$lib/server/db';
import { authCredentialsTable, customerTable } from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import type { Gender } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [customer] = await db
		.select({
			id: customerTable.id,
			email: customerTable.email,
			firstName: customerTable.firstName,
			lastName: customerTable.lastName,
			phone: customerTable.phone,
			gender: customerTable.gender,
			birthDate: customerTable.birthDate,
			marketingConsent: customerTable.marketingConsent
		})
		.from(customerTable)
		.where(eq(customerTable.id, locals.user.id));

	return { customer };
};

export const actions: Actions = {
	updateProfile: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const firstName = data.get('firstName')?.toString().trim() ?? '';
		const lastName = data.get('lastName')?.toString().trim() ?? '';
		const phone = data.get('phone')?.toString().trim() || null;
		const gender = (data.get('gender')?.toString() || null) as Gender | null;
		const marketingConsent = data.get('marketingConsent') === 'on';

		if (!firstName || !lastName) {
			return fail(400, { action: 'profile', error: 'Vor- und Nachname sind erforderlich.' });
		}

		await db
			.update(customerTable)
			.set({ firstName, lastName, phone, gender: gender ?? undefined, marketingConsent, updatedAt: new Date() })
			.where(eq(customerTable.id, locals.user.id));

		return { action: 'profile', success: true };
	},

	changePassword: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString() ?? '';
		const newPassword = data.get('newPassword')?.toString() ?? '';
		const confirmPassword = data.get('confirmPassword')?.toString() ?? '';

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { action: 'password', error: 'Alle Felder sind erforderlich.' });
		}

		if (newPassword.length < 8) {
			return fail(400, {
				action: 'password',
				error: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { action: 'password', error: 'Die Passwörter stimmen nicht überein.' });
		}

		const [credentials] = await db
			.select()
			.from(authCredentialsTable)
			.where(eq(authCredentialsTable.customerId, locals.user.id));

		const valid = await auth.verifyPassword(currentPassword, credentials.passwordHash);
		if (!valid) {
			return fail(401, { action: 'password', error: 'Das aktuelle Passwort ist falsch.' });
		}

		const passwordHash = await auth.hashPassword(newPassword);
		await db
			.update(authCredentialsTable)
			.set({ passwordHash, updatedAt: new Date() })
			.where(eq(authCredentialsTable.customerId, locals.user.id));

		return { action: 'password', success: true };
	}
};
