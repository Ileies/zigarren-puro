import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { producerTable } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const producers = await db.query.producerTable.findMany({ orderBy: asc(producerTable.name) });
	return { producers };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const country = (data.get('country') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const contactInfo = (data.get('contactInfo') as string)?.trim() || null;

		if (!name || !country) {
			return { error: 'Name und Herkunftsland sind Pflichtfelder.' };
		}

		await db.insert(producerTable).values({ name, country, description, contactInfo });
		return { success: 'Hersteller erstellt.' };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = (data.get('name') as string)?.trim();
		const country = (data.get('country') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const contactInfo = (data.get('contactInfo') as string)?.trim() || null;

		if (!id || !name || !country) {
			return { error: 'Name und Herkunftsland sind Pflichtfelder.' };
		}

		await db.update(producerTable).set({ name, country, description, contactInfo }).where(eq(producerTable.id, id));
		return { success: 'Hersteller aktualisiert.' };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return { error: 'Fehlende ID.' };
		}

		try {
			await db.delete(producerTable).where(eq(producerTable.id, id));
		} catch {
			return { error: 'Hersteller konnte nicht gelöscht werden. Möglicherweise sind noch Produkte zugeordnet.' };
		}

		return { success: 'Hersteller gelöscht.' };
	}
};
