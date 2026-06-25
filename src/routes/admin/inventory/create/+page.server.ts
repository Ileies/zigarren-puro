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
import { asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { BeverageType, CigarStrength, FilterType, ProductType } from '$lib/types';

export const load: PageServerLoad = async () => {
	const producers = await db.query.producerTable.findMany({ orderBy: asc(producerTable.name) });
	return { producers };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const price = data.get('price') as string;
		const stock = parseInt(data.get('stock') as string, 10);
		const sku = (data.get('sku') as string)?.trim();
		const producerId = data.get('producerId') as string;
		const productType = data.get('productType') as ProductType;

		if (!name || !price || !sku || !producerId || isNaN(stock) || stock < 0 || !productType) {
			return { error: 'Ungültige Eingabe' };
		}

		const priceNum = parseFloat(price);
		if (isNaN(priceNum) || priceNum < 0) {
			return { error: 'Ungültiger Preis' };
		}

		try {
			const product = await db
				.insert(productTable)
				.values({
					name,
					description,
					price: priceNum,
					stock,
					sku,
					producerId,
					productType
				})
				.returning({ id: productTable.id });

			const productId = product[0].id;

			if (productType === 'cigar') {
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

				await db.insert(cigarDetailsTable).values({
					productId,
					lengthMm: parseFloat(lengthMm),
					ringGauge: parseFloat(ringGauge),
					strength,
					wrapperType,
					countryOfOrigin,
					agingTimeMonths
				});
			} else if (productType === 'cigarillo') {
				const lengthMm = data.get('lengthMm') as string;
				const ringGauge = data.get('ringGauge') as string;
				const filterType = data.get('filterType') as FilterType;
				const wrapperType = (data.get('wrapperType') as string)?.trim();

				if (!lengthMm || !ringGauge || !filterType || !wrapperType) {
					return { error: 'Zigarillo-Details unvollständig' };
				}

				await db.insert(cigarilloDetailsTable).values({
					productId,
					lengthMm: parseFloat(lengthMm),
					ringGauge: parseFloat(ringGauge),
					filterType,
					wrapperType
				});
			} else if (productType === 'beverage') {
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

				await db.insert(beverageDetailsTable).values({
					productId,
					volumeMl: parseFloat(volumeMl),
					alcoholPercentage: parseFloat(alcoholPercentage),
					type,
					countryOfOrigin,
					agingYears,
					tastingNotes
				});
			} else if (productType === 'tool') {
				const material = (data.get('material') as string)?.trim();
				const specifications = (data.get('specifications') as string)?.trim() || null;
				const brand = (data.get('brand') as string)?.trim();
				const careInstructions = (data.get('careInstructions') as string)?.trim() || null;

				if (!material || !brand) {
					return { error: 'Zubehör-Details unvollständig' };
				}

				await db.insert(toolDetailsTable).values({
					productId,
					material,
					specifications,
					brand,
					careInstructions
				});
			}

			redirect(303, `/admin/inventory/${productId}`);
		} catch (err) {
			if (err instanceof Error && err.message.includes('UNIQUE')) {
				return { error: 'Fehler beim Erstellen. Möglicherweise ist die SKU bereits vergeben.' };
			}
			return { error: 'Fehler beim Erstellen des Produkts' };
		}
	}
};
