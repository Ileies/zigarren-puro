import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { productTable, producerTable } from '#lib/server/db/schema/index.js';
import { parseProductForm, updateProduct } from '#lib/server/productForm.js';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { writeFile, unlink, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const PRODUCT_IMAGES_DIR = join(process.cwd(), 'data', 'uploads', 'product-images');
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

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
		const file = data.get('image') as File;

		if (!file || file.size === 0) return { error: 'Keine Datei ausgewählt' };
		if (!ALLOWED_MIME.includes(file.type)) return { error: 'Nur JPG, PNG und WebP sind erlaubt' };
		if (file.size > MAX_SIZE) return { error: 'Datei zu groß (max. 5 MB)' };

		const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
		const filename = `${params.id}.${ext}`;

		await mkdir(PRODUCT_IMAGES_DIR, { recursive: true });

		// Remove any existing image for this product (different extension)
		try {
			const existing = await readdir(PRODUCT_IMAGES_DIR);
			for (const f of existing) {
				if (f.startsWith(params.id + '.') && f !== filename) {
					await unlink(join(PRODUCT_IMAGES_DIR, f));
				}
			}
		} catch {
			/* file may not exist */
		}

		await writeFile(join(PRODUCT_IMAGES_DIR, filename), Buffer.from(await file.arrayBuffer()));
		await db
			.update(productTable)
			.set({ imageUrl: `/product-images/${filename}`, updatedAt: new Date() })
			.where(eq(productTable.id, params.id));

		return { imageSuccess: true };
	},

	removeImage: async ({ params }) => {
		const product = await db.query.productTable.findFirst({
			where: eq(productTable.id, params.id),
			columns: { imageUrl: true }
		});

		if (product?.imageUrl) {
			const filename = product.imageUrl.split('/').pop();
			if (filename) {
				try {
					await unlink(join(PRODUCT_IMAGES_DIR, filename));
				} catch {
					/* file may not exist */
				}
			}
		}

		await db
			.update(productTable)
			.set({ imageUrl: null, updatedAt: new Date() })
			.where(eq(productTable.id, params.id));

		return { imageRemoved: true };
	},

	delete: async ({ params }) => {
		await db.delete(productTable).where(eq(productTable.id, params.id));
		redirect(303, '/admin/inventory');
	}
};
