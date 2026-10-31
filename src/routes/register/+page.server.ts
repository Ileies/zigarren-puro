import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { authCredentialsTable, customerTable } from '#lib/server/db/schema/index.js';
import * as auth from '#lib/server/auth.js';
import { Gender } from '#lib/types.js';
import { sendVerificationEmail } from '#lib/server/functions.js';
import * as m from '#lib/messages.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

function getAge(birthDate: Date): number {
	const today = new Date();
	const age = today.getFullYear() - birthDate.getFullYear();
	const notYetThisYear =
		today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
	return notYetThisYear ? age - 1 : age;
}

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();

		const email = data.get('email')?.toString().trim().toLowerCase() ?? '';
		const password = data.get('password')?.toString() ?? '';
		const passwordConfirm = data.get('passwordConfirm')?.toString() ?? '';
		const firstName = data.get('firstName')?.toString().trim() ?? '';
		const lastName = data.get('lastName')?.toString().trim() ?? '';
		const birthDateStr = data.get('birthDate')?.toString() ?? '';
		const gender = data.get('gender')?.toString() || null;
		const phone = data.get('phone')?.toString().trim() || null;
		const marketingConsent = data.get('marketingConsent') === 'on';
		const acceptTerms = data.get('acceptTerms') === 'on';

		const fields = { email, firstName, lastName, birthDate: birthDateStr, gender, phone };

		if (!email || !password || !firstName || !lastName || !birthDateStr) {
			return fail(400, { ...fields, error: m.errRequiredFields() });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { ...fields, error: m.errInvalidEmail() });
		}

		if (password.length < 8) {
			return fail(400, { ...fields, error: m.errPasswordTooShort() });
		}

		if (password !== passwordConfirm) {
			return fail(400, { ...fields, error: m.errPasswordMismatch() });
		}

		const birthDate = new Date(birthDateStr);
		if (isNaN(birthDate.getTime())) {
			return fail(400, { ...fields, error: m.errInvalidBirthDate() });
		}

		if (getAge(birthDate) < 18) {
			return fail(400, { ...fields, error: m.errRegisterUnderage() });
		}

		if (!acceptTerms) {
			return fail(400, { ...fields, error: m.errAcceptTerms() });
		}

		const [existing] = await db
			.select({ id: customerTable.id })
			.from(customerTable)
			.where(eq(customerTable.email, email));

		if (existing) {
			return fail(409, { ...fields, error: m.errEmailTaken() });
		}

		const passwordHash = await auth.hashPassword(password);

		const customer = db.transaction((tx) => {
			const [newCustomer] = tx
				.insert(customerTable)
				.values({
					email,
					firstName,
					lastName,
					birthDate: birthDateStr,
					gender: gender ? (gender as Gender) : undefined,
					phone,
					marketingConsent,
					preferredLanguage: event.request.headers.get('accept-language')?.split(',')[0] ?? 'de'
				})
				.returning({ id: customerTable.id })
				.all();

			tx.insert(authCredentialsTable)
				.values({
					customerId: newCustomer.id,
					passwordHash
				})
				.run();

			return newCustomer;
		});

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, customer.id);
		auth.setSessionTokenCookie(event, token, session.expiresAt);

		// Fire-and-forget - registration still succeeds if email fails
		sendVerificationEmail(customer.id, email, firstName).catch(console.error);

		redirect(302, '/verify-email');
	}
};
