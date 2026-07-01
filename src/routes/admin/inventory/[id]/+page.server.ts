import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import {
	productTable,
	producerTable,
	cigarDetailsTable,
	cigarilloDetailsTable,
	beverageDetailsTable,
	toolDetailsTable
} from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { BeverageType, CigarStrength, FilterType } from '$lib/types';
import { writeFile, unlink, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// adapter-node serves static files from build/client/ at runtime; in dev they live in static/
const PRODUCT_IMAGES_DIR = join(
	process.cwd(),
	process.env.NODE_ENV === 'production' ? 'client' : 'static',
	'product-images'
);
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

		const name = (data.get('name') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const price = data.get('price') as string;
		const stock = parseInt(data.get('stock') as string, 10);
		const sku = (data.get('sku') as string)?.trim();
		const producerId = data.get('producerId') as string;

		if (!name || !price || !sku || !producerId || isNaN(stock) || stock < 0) {
			return { error: 'Ungültige Eingabe' };
		}

		const priceNum = parseFloat(price);
		if (isNaN(priceNum) || priceNum < 0) {
			return { error: 'Ungültiger Preis' };
		}

		const product = await db.query.productTable.findFirst({
			where: eq(productTable.id, params.id),
			columns: { productType: true }
		});

		if (!product) error(404, 'Produkt nicht gefunden');

		const tagsRaw = (data.get('tags') as string)?.trim() || '';
		const tags = JSON.stringify(
			tagsRaw
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		);

		try {
			await db
				.update(productTable)
				.set({
					name,
					description,
					price: priceNum,
					stock,
					sku,
					producerId,
					tags,
					updatedAt: new Date()
				})
				.where(eq(productTable.id, params.id));
		} catch {
			return { error: 'Fehler beim Speichern. Möglicherweise ist die SKU bereits vergeben.' };
		}

		if (product.productType === 'cigar') {
			const lengthMm = data.get('lengthMm') as string;
			const ringGauge = data.get('ringGauge') as string;
			const strength = data.get('strength') as CigarStrength;
			const wrapperType = (data.get('wrapperType') as string)?.trim();
			const countryOfOrigin = (data.get('countryOfOrigin') as string)?.trim();
			const agingRaw = data.get('agingTimeMonths') as string;
			const agingTimeMonths = agingRaw ? parseInt(agingRaw, 10) : null;

			if (!lengthMm || !ringGauge || !strength || !wrapperType || !countryOfOrigin) {
				return { error: 'Zigarren-Details unvollständig' };
			}

			await db
				.insert(cigarDetailsTable)
				.values({
					productId: params.id,
					lengthMm: parseFloat(lengthMm),
					ringGauge: parseFloat(ringGauge),
					strength,
					wrapperType,
					countryOfOrigin,
					agingTimeMonths
				})
				.onConflictDoUpdate({
					target: cigarDetailsTable.productId,
					set: {
						lengthMm: parseFloat(lengthMm),
						ringGauge: parseFloat(ringGauge),
						strength,
						wrapperType,
						countryOfOrigin,
						agingTimeMonths
					}
				});
		} else if (product.productType === 'cigarillo') {
			const lengthMm = data.get('lengthMm') as string;
			const ringGauge = data.get('ringGauge') as string;
			const filterType = data.get('filterType') as FilterType;
			const wrapperType = (data.get('wrapperType') as string)?.trim();

			if (!lengthMm || !ringGauge || !filterType || !wrapperType) {
				return { error: 'Zigarillo-Details unvollständig' };
			}

			await db
				.insert(cigarilloDetailsTable)
				.values({
					productId: params.id,
					lengthMm: parseFloat(lengthMm),
					ringGauge: parseFloat(ringGauge),
					filterType,
					wrapperType
				})
				.onConflictDoUpdate({
					target: cigarilloDetailsTable.productId,
					set: {
						lengthMm: parseFloat(lengthMm),
						ringGauge: parseFloat(ringGauge),
						filterType,
						wrapperType
					}
				});
		} else if (product.productType === 'beverage') {
			const volumeMl = data.get('volumeMl') as string;
			const alcoholPercentage = data.get('alcoholPercentage') as string;
			const type = data.get('beverageType') as BeverageType;
			const countryOfOrigin = (data.get('countryOfOrigin') as string)?.trim();
			const agingRaw = data.get('agingYears') as string;
			const agingYears = agingRaw ? parseInt(agingRaw, 10) : null;
			const tastingNotes = (data.get('tastingNotes') as string)?.trim() || null;

			if (!volumeMl || !alcoholPercentage || !type || !countryOfOrigin) {
				return { error: 'Getränke-Details unvollständig' };
			}

			await db
				.insert(beverageDetailsTable)
				.values({
					productId: params.id,
					volumeMl: parseFloat(volumeMl),
					alcoholPercentage: parseFloat(alcoholPercentage),
					type,
					countryOfOrigin,
					agingYears,
					tastingNotes
				})
				.onConflictDoUpdate({
					target: beverageDetailsTable.productId,
					set: {
						volumeMl: parseFloat(volumeMl),
						alcoholPercentage: parseFloat(alcoholPercentage),
						type,
						countryOfOrigin,
						agingYears,
						tastingNotes
					}
				});
		} else if (product.productType === 'tool') {
			const material = (data.get('material') as string)?.trim();
			const specifications = (data.get('specifications') as string)?.trim() || null;
			const brand = (data.get('brand') as string)?.trim();
			const careInstructions = (data.get('careInstructions') as string)?.trim() || null;

			if (!material || !brand) {
				return { error: 'Zubehör-Details unvollständig' };
			}

			await db
				.insert(toolDetailsTable)
				.values({ productId: params.id, material, specifications, brand, careInstructions })
				.onConflictDoUpdate({
					target: toolDetailsTable.productId,
					set: { material, specifications, brand, careInstructions }
				});
		}

		return { success: true };
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
