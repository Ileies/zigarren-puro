import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as auth from '#lib/server/auth.js';
import {
	parseRegistrationForm,
	registerCustomer,
	type RegistrationError
} from '#lib/server/accounts.js';
import { sendVerificationEmail } from '#lib/server/functions.js';
import * as m from '#lib/messages.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

function errorResponse(error: RegistrationError) {
	switch (error.code) {
		case 'requiredFields':
			return { status: 400, message: m.errRequiredFields() };
		case 'invalidEmail':
			return { status: 400, message: m.errInvalidEmail() };
		case 'passwordTooShort':
			return { status: 400, message: m.errPasswordTooShort() };
		case 'passwordMismatch':
			return { status: 400, message: m.errPasswordMismatch() };
		case 'invalidBirthDate':
			return { status: 400, message: m.errInvalidBirthDate() };
		case 'underage':
			return { status: 400, message: m.errRegisterUnderage() };
		case 'acceptTerms':
			return { status: 400, message: m.errAcceptTerms() };
		case 'emailTaken':
			return { status: 409, message: m.errEmailTaken() };
	}
}

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const language = event.request.headers.get('accept-language')?.split(',')[0] ?? 'de';
		const input = parseRegistrationForm(data, language);

		const result = await registerCustomer(input);
		if (!result.ok) {
			const { email, firstName, lastName, birthDate, gender, phone } = input;
			const { status, message } = errorResponse(result.error);
			return fail(status, { email, firstName, lastName, birthDate, gender, phone, error: message });
		}

		const { customer } = result;
		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, customer.id);
		auth.setSessionTokenCookie(event, token, session.expiresAt);

		// Fire-and-forget - registration still succeeds if email fails
		sendVerificationEmail(customer.id, customer.email, customer.firstName).catch(console.error);

		redirect(302, '/verify-email');
	}
};
