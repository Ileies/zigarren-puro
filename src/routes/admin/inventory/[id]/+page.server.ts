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

		try {
			await db
				.update(productTable)
				.set({ name, description, price, stock, sku, producerId, updatedAt: new Date() })
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
				.values({ productId: params.id, lengthMm, ringGauge, strength, wrapperType, countryOfOrigin, agingTimeMonths })
				.onConflictDoUpdate({
					target: cigarDetailsTable.productId,
					set: { lengthMm, ringGauge, strength, wrapperType, countryOfOrigin, agingTimeMonths }
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
				.values({ productId: params.id, lengthMm, ringGauge, filterType, wrapperType })
				.onConflictDoUpdate({
					target: cigarilloDetailsTable.productId,
					set: { lengthMm, ringGauge, filterType, wrapperType }
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
				.values({ productId: params.id, volumeMl, alcoholPercentage, type, countryOfOrigin, agingYears, tastingNotes })
				.onConflictDoUpdate({
					target: beverageDetailsTable.productId,
					set: { volumeMl, alcoholPercentage, type, countryOfOrigin, agingYears, tastingNotes }
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

	delete: async ({ params }) => {
		await db.delete(productTable).where(eq(productTable.id, params.id));
		redirect(303, '/admin/inventory');
	}
};
