import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { addressTable } from '#lib/server/db/schema/index.js';
import {
	addAddress,
	deleteAddress,
	parseAddressForm,
	setDefaultAddress,
	type AddressFormError
} from '#lib/server/addresses.js';
import * as m from '#lib/messages.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const addresses = await db
		.select()
		.from(addressTable)
		.where(eq(addressTable.customerId, locals.user.id));

	return { addresses };
};

const formError = (error: AddressFormError) =>
	error === 'invalidType'
		? m.errInvalidAddressType()
		: error === 'requiredFields'
			? m.errRequiredFields()
			: m.errInvalidRequest();

export const actions: Actions = {
	addAddress: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const input = parseAddressForm(await request.formData());
		if (!input.ok) return fail(400, { error: formError(input.error) });

		addAddress(locals.user.id, input.value);
		return { success: true };
	},

	deleteAddress: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: m.errInvalidRequest() });

		const result = deleteAddress(locals.user.id, id);
		if (result === 'inUse') return fail(409, { error: m.errAddressInUse() });
		if (result === 'notFound') return fail(404, { error: m.errAddressNotFound() });

		return { success: true };
	},

	setDefault: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: m.errInvalidRequest() });

		if (setDefaultAddress(locals.user.id, id) === 'notFound') {
			return fail(404, { error: m.errAddressNotFound() });
		}

		return { success: true };
	}
};
