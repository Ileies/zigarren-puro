import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { addToCart } from '$lib/server/cart';
import {
	productTable,
	producerTable,
	cigarDetailsTable,
	cigarilloDetailsTable,
	beverageDetailsTable,
	toolDetailsTable
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { ProductType } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const [product] = await db
		.select({
			id: productTable.id,
			name: productTable.name,
			description: productTable.description,
			price: productTable.price,
			stock: productTable.stock,
			sku: productTable.sku,
			productType: productTable.productType,
			createdAt: productTable.createdAt,
			producerName: producerTable.name,
			producerCountry: producerTable.country,
			producerDescription: producerTable.description
		})
		.from(productTable)
		.leftJoin(producerTable, eq(productTable.producerId, producerTable.id))
		.where(eq(productTable.id, params.id));

	if (!product) error(404, 'Produkt nicht gefunden');

	let details = null;
	if (product.productType === ProductType.CIGAR) {
		const [d] = await db.select().from(cigarDetailsTable).where(eq(cigarDetailsTable.productId, params.id));
		details = d ?? null;
	} else if (product.productType === ProductType.CIGARILLO) {
		const [d] = await db.select().from(cigarilloDetailsTable).where(eq(cigarilloDetailsTable.productId, params.id));
		details = d ?? null;
	} else if (product.productType === ProductType.BEVERAGE) {
		const [d] = await db.select().from(beverageDetailsTable).where(eq(beverageDetailsTable.productId, params.id));
		details = d ?? null;
	} else if (product.productType === ProductType.TOOL) {
		const [d] = await db.select().from(toolDetailsTable).where(eq(toolDetailsTable.productId, params.id));
		details = d ?? null;
	}

	return { product, details };
};

export const actions: Actions = {
	addToCart: async ({ cookies, params }) => {
		addToCart(cookies, params.id);
		return { success: true };
	}
};
