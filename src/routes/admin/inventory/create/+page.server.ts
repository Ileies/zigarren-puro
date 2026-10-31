import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { producerTable } from '#lib/server/db/schema/index.js';
import { createProduct, parseProductForm } from '#lib/server/productForm.js';
import { asc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { ProductType } from '#lib/types.js';

export const load: PageServerLoad = async () => {
	const producers = await db.query.producerTable.findMany({ orderBy: asc(producerTable.name) });
	return { producers };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		const productType = data.get('productType')?.toString() ?? '';
		if (!(Object.values(ProductType) as string[]).includes(productType)) {
			return { error: 'Ungültige Eingabe' };
		}

		const input = parseProductForm(data, productType as ProductType);
		if (!input.ok) return { error: input.error };

		const created = createProduct(input.value);
		if (!created.ok) return { error: created.error };

		redirect(303, `/admin/inventory/${created.value.id}`);
	}
};
