import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { productTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const product = await db.query.productTable.findFirst({
		where: eq(productTable.id, params.id),
		with: {
			producer: true,
			cigarDetails: true,
			cigarilloDetails: true,
			beverageDetails: true,
			toolDetails: true
		}
	});

	if (!product) error(404, 'Produkt nicht gefunden');

	return { product };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		const name = (data.get('name') as string).trim();
		const description = (data.get('description') as string).trim() || null;
		const price = data.get('price') as string;
		const stock = parseInt(data.get('stock') as string, 10);

		if (!name || !price || isNaN(stock) || stock < 0) {
			return { error: 'Ungültige Eingabe' };
		}

		await db
			.update(productTable)
			.set({ name, description, price, stock, updatedAt: new Date() })
			.where(eq(productTable.id, params.id));

		return { success: true };
	},

	delete: async ({ params }) => {
		await db.delete(productTable).where(eq(productTable.id, params.id));
		redirect(303, '/admin/inventory');
	}
};
