import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { productTable, producerTable } from '#lib/server/db/schema/index.js';
import { parseProductForm, updateProduct } from '#lib/server/productForm.js';
import { deleteProduct } from '#lib/server/catalogue.js';
import { MAX_PRODUCT_IMAGE_BYTES, removeImage, replaceImage } from '#lib/server/uploads.js';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

const IMAGE_FOLDER = 'product-images';

export const load: PageServerLoad = async ({ params }) => {
	const [product, producers] = await Promise.all([
		db.query.productTable.findFirst({
			where: eq(productTable.id, params.id),
			with: {
				producer: true,
				cigarDetails: true,
				cigarilloDetails: true,
				beverageDetails: true,
				toolDetails: true
			}
		}),
		db.query.producerTable.findMany({ orderBy: asc(producerTable.name) })
	]);

	if (!product) error(404, 'Produkt nicht gefunden');

	return { product, producers };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();

		const product = await db.query.productTable.findFirst({
			where: eq(productTable.id, params.id),
			columns: { productType: true }
		});
		if (!product) error(404, 'Produkt nicht gefunden');

		const input = parseProductForm(data, product.productType);
		if (!input.ok) return { error: input.error };

		const saved = updateProduct(params.id, input.value);
		return saved.ok ? { success: true } : { error: saved.error };
	},

	uploadImage: async ({ request, params }) => {
		const data = await request.formData();

		const product = await db.query.productTable.findFirst({
			where: eq(productTable.id, params.id),
			columns: { id: true }
		});
		if (!product) error(404, 'Produkt nicht gefunden');

		const result = await replaceImage({
			folder: IMAGE_FOLDER,
			name: product.id,
			file: data.get('image'),
			maxBytes: MAX_PRODUCT_IMAGE_BYTES,
			save: (url) => {
				db.update(productTable)
					.set({ imageUrl: url, updatedAt: new Date() })
					.where(eq(productTable.id, params.id))
					.run();
			}
		});
		if (!result.ok) return { error: result.error };

		return { imageSuccess: true };
	},

	removeImage: async ({ params }) => {
		const product = await db.query.productTable.findFirst({
			where: eq(productTable.id, params.id),
			columns: { imageUrl: true }
		});
		if (!product) error(404, 'Produkt nicht gefunden');

		await db
			.update(productTable)
			.set({ imageUrl: null, updatedAt: new Date() })
			.where(eq(productTable.id, params.id));
		await removeImage(IMAGE_FOLDER, product.imageUrl);

		return { imageRemoved: true };
	},

	delete: async ({ params }) => {
		const result = deleteProduct(params.id);
		if (!result.ok) return { error: result.error };

		await removeImage(IMAGE_FOLDER, result.imageUrl);
		redirect(303, '/admin/inventory');
	}
};
