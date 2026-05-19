import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { addToCart } from '$lib/server/cart';
import {
	productTable,
	producerTable,
	cigarDetailsTable,
	cigarilloDetailsTable,
	beverageDetailsTable,
	toolDetailsTable,
	wishlistTable
} from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { ProductType } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
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

	let isWishlisted = false;
	if (locals.user) {
		const [wish] = await db
			.select()
			.from(wishlistTable)
			.where(and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, params.id)));
		isWishlisted = !!wish;
	}

	return { product, details, isWishlisted };
};

export const actions: Actions = {
	addToCart: async ({ cookies, params }) => {
		addToCart(cookies, params.id);
		return { success: true };
	},

	toggleWishlist: async ({ locals, params }) => {
		if (!locals.user) redirect(302, '/login');

		const [existing] = await db
			.select()
			.from(wishlistTable)
			.where(and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, params.id)));

		if (existing) {
			await db
				.delete(wishlistTable)
				.where(and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, params.id)));
			return { wishlisted: false };
		} else {
			await db.insert(wishlistTable).values({ customerId: locals.user.id, productId: params.id });
			return { wishlisted: true };
		}
	}
};
