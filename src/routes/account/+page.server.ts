import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { customerTable } from '#lib/server/db/schema/index.js';
import {
	changePassword,
	parseProfileForm,
	requestEmailChange,
	updateProfile,
	type EmailChangeError,
	type PasswordChangeError,
	type ProfileError
} from '#lib/server/profile.js';
import { sendEmailChangeConfirmation } from '#lib/server/functions.js';
import { withdrawSubscription } from '#lib/server/newsletter.js';
import * as m from '#lib/messages.js';

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

const profileError = (error: ProfileError) => ({
	status: 400,
	message: error.code === 'nameRequired' ? m.errNameRequired() : m.errInvalidRequest()
});

const passwordError = (error: PasswordChangeError) => {
	switch (error.code) {
		case 'fieldsRequired':
			return { status: 400, message: m.errFieldsRequired() };
		case 'passwordTooShort':
			return { status: 400, message: m.errNewPasswordTooShort() };
		case 'passwordMismatch':
			return { status: 400, message: m.errPasswordMismatch() };
		case 'locked':
			return { status: 429, message: m.errAccountLocked({ minutes: error.minutes }) };
		case 'currentPasswordWrong':
			return { status: 401, message: m.errCurrentPasswordWrong() };
	}
};

const emailError = (error: EmailChangeError) => {
	switch (error.code) {
		case 'fieldsRequired':
			return { status: 400, message: m.errFieldsRequired() };
		case 'invalidEmail':
			return { status: 400, message: m.errInvalidEmail() };
		case 'emailSame':
			return { status: 400, message: m.errEmailSame() };
		case 'emailTaken':
			return { status: 400, message: m.errEmailTaken() };
		case 'locked':
			return { status: 429, message: m.errAccountLocked({ minutes: error.minutes }) };
		case 'currentPasswordWrong':
			return { status: 401, message: m.errCurrentPasswordWrong() };
	}
};

export const actions: Actions = {
	updateProfile: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const input = parseProfileForm(await request.formData());
		if (!input.ok) {
			const { status, message } = profileError(input.error);
			return fail(status, { action: 'profile', error: message });
		}

		await updateProfile(locals.user.id, input.value);

		if (!input.value.marketingConsent) {
			const [customer] = await db
				.select({ email: customerTable.email })
				.from(customerTable)
				.where(eq(customerTable.id, locals.user.id));
			if (customer) withdrawSubscription(customer.email);
		}

		return { action: 'profile', success: true };
	},

	changePassword: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const result = await changePassword(locals.user.id, {
			currentPassword: data.get('currentPassword')?.toString() ?? '',
			newPassword: data.get('newPassword')?.toString() ?? '',
			confirmPassword: data.get('confirmPassword')?.toString() ?? '',
			keepSessionId: locals.session?.id
		});
		if (!result.ok) {
			const { status, message } = passwordError(result.error);
			return fail(status, { action: 'password', error: message });
		}

		return { action: 'password', success: true };
	},

	changeEmail: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const result = await requestEmailChange(
			locals.user.id,
			data.get('newEmail')?.toString(),
			data.get('currentPassword')?.toString()
		);
		if (!result.ok) {
			const { status, message } = emailError(result.error);
			return fail(status, { action: 'email', error: message });
		}

		await sendEmailChangeConfirmation(locals.user.id, result.newEmail, result.firstName);

		return { action: 'email', success: true };
	}
};
