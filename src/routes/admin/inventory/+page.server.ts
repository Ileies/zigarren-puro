import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { productTable, producerTable } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const products = await db
		.select({
			id: productTable.id,
			name: productTable.name,
			sku: productTable.sku,
			price: productTable.price,
			stock: productTable.stock,
			productType: productTable.productType,
			producerName: producerTable.name
		})
		.from(productTable)
		.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
		.orderBy(asc(productTable.name));

	return { products };
};

export const actions: Actions = {
	updateStock: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const stock = parseInt(data.get('stock') as string, 10);

		if (!id || isNaN(stock) || stock < 0) {
			return { error: 'Ungültige Eingabe' };
		}

		await db.update(productTable).set({ stock, updatedAt: new Date() }).where(eq(productTable.id, id));

		return { success: true };
	}
};
