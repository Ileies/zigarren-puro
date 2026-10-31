import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resetLinkStatus, resetPassword, type PasswordResetError } from '#lib/server/accounts.js';
import * as m from '#lib/messages.js';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user) redirect(302, '/');

	const token = url.searchParams.get('token');
	const status = await resetLinkStatus(token);
	return status === 'valid' ? { status, token: token! } : { status };
};

function errorMessage(error: PasswordResetError) {
	switch (error.code) {
		case 'fieldsRequired':
			return m.errFieldsRequired();
		case 'passwordTooShort':
			return m.errPasswordTooShort();
		case 'passwordMismatch':
			return m.errPasswordMismatch();
		case 'linkInvalid':
			return m.errLinkInvalid();
	}
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const result = await resetPassword(
			data.get('token')?.toString(),
			data.get('password')?.toString(),
			data.get('confirmPassword')?.toString()
		);
		if (!result.ok) return fail(400, { error: errorMessage(result.error) });

		redirect(302, '/login?reset=1');
	}
};
