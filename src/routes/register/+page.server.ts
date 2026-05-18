import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '$lib/server/db';
import { authCredentialsTable, customerTable } from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { Gender } from '$lib/types';
import { sendVerificationEmail } from '$lib/server/functions';

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
			return fail(400, { ...fields, error: 'Bitte füllen Sie alle Pflichtfelder aus.' });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { ...fields, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' });
		}

		if (password.length < 8) {
			return fail(400, {
				...fields,
				error: 'Das Passwort muss mindestens 8 Zeichen lang sein.'
			});
		}

		if (password !== passwordConfirm) {
			return fail(400, { ...fields, error: 'Die Passwörter stimmen nicht überein.' });
		}

		const birthDate = new Date(birthDateStr);
		if (isNaN(birthDate.getTime())) {
			return fail(400, { ...fields, error: 'Ungültiges Geburtsdatum.' });
		}

		if (getAge(birthDate) < 18) {
			return fail(400, {
				...fields,
				error: 'Sie müssen mindestens 18 Jahre alt sein, um sich zu registrieren.'
			});
		}

		if (!acceptTerms) {
			return fail(400, {
				...fields,
				error: 'Bitte akzeptieren Sie die AGB und Datenschutzerklärung.'
			});
		}

		const [existing] = await db
			.select({ id: customerTable.id })
			.from(customerTable)
			.where(eq(customerTable.email, email));

		if (existing) {
			return fail(409, { ...fields, error: 'Diese E-Mail-Adresse ist bereits registriert.' });
		}

		const passwordHash = await auth.hashPassword(password);

		const customer = await db.transaction(async (tx) => {
			const [newCustomer] = await tx
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
				.returning({ id: customerTable.id });

			await tx.insert(authCredentialsTable).values({
				customerId: newCustomer.id,
				passwordHash
			});

			return newCustomer;
		});

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, customer.id);
		auth.setSessionTokenCookie(event, token, session.expiresAt);

		// Fire-and-forget — registration still succeeds if email fails
		sendVerificationEmail(customer.id, email, firstName).catch(console.error);

		redirect(302, '/verify-email');
	}
};
