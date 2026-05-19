import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import db from '$lib/server/db';
import { addressTable } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const addresses = await db
		.select()
		.from(addressTable)
		.where(eq(addressTable.customerId, locals.user.id));

	return { addresses };
};

export const actions: Actions = {
	addAddress: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const type = data.get('type')?.toString();
		const street = data.get('street')?.toString().trim() ?? '';
		const city = data.get('city')?.toString().trim() ?? '';
		const state = data.get('state')?.toString().trim() ?? '';
		const country = data.get('country')?.toString().trim() ?? '';
		const postalCode = data.get('postalCode')?.toString().trim() ?? '';
		const isDefault = data.get('isDefault') === 'on';

		if (!type || !['shipping', 'billing'].includes(type)) {
			return fail(400, { error: 'Ungültiger Adresstyp.' });
		}
		if (!street || !city || !country || !postalCode) {
			return fail(400, { error: 'Bitte füllen Sie alle Pflichtfelder aus.' });
		}

		if (isDefault) {
			await db
				.update(addressTable)
				.set({ isDefault: false })
				.where(
					and(
						eq(addressTable.customerId, locals.user.id),
						eq(addressTable.type, type as 'shipping' | 'billing')
					)
				);
		}

		await db.insert(addressTable).values({
			customerId: locals.user.id,
			type: type as 'shipping' | 'billing',
			street,
			city,
			state,
			country,
			postalCode,
			isDefault
		});

		return { success: true };
	},

	deleteAddress: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { error: 'Ungültige Anfrage.' });

		await db
			.delete(addressTable)
			.where(and(eq(addressTable.id, id), eq(addressTable.customerId, locals.user.id)));

		return { success: true };
	},

	setDefault: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id')?.toString();
		const type = data.get('type')?.toString() as 'shipping' | 'billing';

		if (!id || !type) return fail(400, { error: 'Ungültige Anfrage.' });

		await db
			.update(addressTable)
			.set({ isDefault: false })
			.where(
				and(eq(addressTable.customerId, locals.user.id), eq(addressTable.type, type))
			);

		await db
			.update(addressTable)
			.set({ isDefault: true })
			.where(and(eq(addressTable.id, id), eq(addressTable.customerId, locals.user.id)));

		return { success: true };
	}
};
