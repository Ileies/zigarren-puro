import { error, fail, redirect } from '@sveltejs/kit';
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
	wishlistTable,
	productReviewTable,
	customerTable
} from '$lib/server/db/schema';
import { and, avg, count, desc, eq, sql } from 'drizzle-orm';
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
		const [d] = await db
			.select()
			.from(cigarDetailsTable)
			.where(eq(cigarDetailsTable.productId, params.id));
		details = d ?? null;
	} else if (product.productType === ProductType.CIGARILLO) {
		const [d] = await db
			.select()
			.from(cigarilloDetailsTable)
			.where(eq(cigarilloDetailsTable.productId, params.id));
		details = d ?? null;
	} else if (product.productType === ProductType.BEVERAGE) {
		const [d] = await db
			.select()
			.from(beverageDetailsTable)
			.where(eq(beverageDetailsTable.productId, params.id));
		details = d ?? null;
	} else if (product.productType === ProductType.TOOL) {
		const [d] = await db
			.select()
			.from(toolDetailsTable)
			.where(eq(toolDetailsTable.productId, params.id));
		details = d ?? null;
	}

	let isWishlisted = false;
	if (locals.user) {
		const [wish] = await db
			.select()
			.from(wishlistTable)
			.where(
				and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, params.id))
			);
		isWishlisted = !!wish;
	}

	const reviews = await db
		.select({
			id: productReviewTable.id,
			rating: productReviewTable.rating,
			title: productReviewTable.title,
			body: productReviewTable.body,
			createdAt: productReviewTable.createdAt,
			customerId: productReviewTable.customerId,
			reviewerName: sql<string>`${customerTable.firstName} || ' ' || LEFT(${customerTable.lastName}, 1) || '.'`
		})
		.from(productReviewTable)
		.leftJoin(customerTable, eq(productReviewTable.customerId, customerTable.id))
		.where(eq(productReviewTable.productId, params.id))
		.orderBy(desc(productReviewTable.createdAt));

	const [{ avgRating, reviewCount }] = await db
		.select({
			avgRating: avg(productReviewTable.rating),
			reviewCount: count()
		})
		.from(productReviewTable)
		.where(eq(productReviewTable.productId, params.id));

	const userReview = locals.user
		? (reviews.find((r) => r.customerId === locals.user!.id) ?? null)
		: null;

	return {
		product,
		details,
		isWishlisted,
		reviews,
		avgRating: avgRating ? parseFloat(avgRating) : null,
		reviewCount: reviewCount ?? 0,
		userReview
	};
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
			.where(
				and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, params.id))
			);

		if (existing) {
			await db
				.delete(wishlistTable)
				.where(
					and(eq(wishlistTable.customerId, locals.user.id), eq(wishlistTable.productId, params.id))
				);
			return { wishlisted: false };
		} else {
			await db.insert(wishlistTable).values({ customerId: locals.user.id, productId: params.id });
			return { wishlisted: true };
		}
	},

	submitReview: async ({ locals, params, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const rating = parseInt(data.get('rating') as string);
		const title = (data.get('title') as string)?.trim() || null;
		const body = (data.get('body') as string)?.trim() || null;

		if (!rating || rating < 1 || rating > 5) {
			return fail(400, {
				reviewError: 'Bitte wählen Sie eine Bewertung zwischen 1 und 5 Sternen.'
			});
		}

		await db
			.insert(productReviewTable)
			.values({ productId: params.id, customerId: locals.user.id, rating, title, body })
			.onConflictDoUpdate({
				target: [productReviewTable.productId, productReviewTable.customerId],
				set: { rating, title, body }
			});

		return { reviewSuccess: true };
	},

	deleteReview: async ({ locals, params }) => {
		if (!locals.user) redirect(302, '/login');

		await db
			.delete(productReviewTable)
			.where(
				and(
					eq(productReviewTable.productId, params.id),
					eq(productReviewTable.customerId, locals.user.id)
				)
			);

		return { reviewDeleted: true };
	}
};
