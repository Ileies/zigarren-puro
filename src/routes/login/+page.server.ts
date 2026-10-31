import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as auth from '#lib/server/auth.js';
import { authenticate, type LoginError } from '#lib/server/accounts.js';
import * as m from '#lib/messages.js';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(302, '/');
	return { passwordReset: url.searchParams.get('reset') === '1' };
};

function errorResponse(error: LoginError) {
	switch (error.code) {
		case 'credentialsRequired':
			return { status: 400, message: m.errCredentialsRequired() };
		case 'locked':
			return { status: 429, message: m.errAccountLocked({ minutes: error.minutes }) };
		case 'invalidCredentials':
			return { status: 401, message: m.errInvalidCredentials() };
	}
}

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase();

		const result = await authenticate(email, data.get('password')?.toString());
		if (!result.ok) {
			const { status, message } = errorResponse(result.error);
			return fail(status, { email, error: message });
		}

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, result.customer.id);
		auth.setSessionTokenCookie(event, token, session.expiresAt);

		redirect(302, result.customer.isVerified ? '/' : '/verify-email');
	}
};
