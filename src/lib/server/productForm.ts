import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	beverageDetailsTable,
	cigarDetailsTable,
	cigarilloDetailsTable,
	producerTable,
	productTable,
	toolDetailsTable
} from '#lib/server/db/schema/index.js';
import { BeverageType, CigarStrength, FilterType, ProductType } from '#lib/types.js';

/** What the admin product forms send. Staff see these messages, so they stay German. */
type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Insert<T extends { $inferInsert: unknown }> = Omit<T['$inferInsert'], 'productId'>;

export type ProductDetails =
	| { type: ProductType.CIGAR; values: Insert<typeof cigarDetailsTable> }
	| { type: ProductType.CIGARILLO; values: Insert<typeof cigarilloDetailsTable> }
	| { type: ProductType.BEVERAGE; values: Insert<typeof beverageDetailsTable> }
	| { type: ProductType.TOOL; values: Insert<typeof toolDetailsTable> };

export type ProductInput = {
	name: string;
	description: string | null;
	price: number;
	stock: number;
	sku: string;
	producerId: string;
	/** JSON array. Only set when the form has a tags field. */
	tags?: string;
	details: ProductDetails;
};

const text = (data: FormData, key: string) => data.get(key)?.toString().trim() ?? '';

/** A whole number from a form field, or `null` for an empty one. `NaN` marks invalid input. */
function wholeNumber(raw: string): number | null {
	if (raw === '') return null;
	return /^\d+$/.test(raw) ? Number(raw) : NaN;
}

/** A positive or zero decimal number from a form field. `NaN` marks invalid input. */
function decimal(raw: string): number {
	if (raw === '' || !/^\d+([.,]\d+)?$/.test(raw)) return NaN;
	return Number(raw.replace(',', '.'));
}

function isOneOf<T extends string>(values: Record<string, T>, value: string): value is T {
	return (Object.values(values) as string[]).includes(value);
}

const invalid = (error: string): { ok: false; error: string } => ({ ok: false, error });

function parseDetails(data: FormData, productType: ProductType): Parsed<ProductDetails> {
	switch (productType) {
		case ProductType.CIGAR: {
			const lengthMm = decimal(text(data, 'lengthMm'));
			const ringGauge = decimal(text(data, 'ringGauge'));
			const strength = text(data, 'strength');
			const wrapperType = text(data, 'wrapperType');
			const countryOfOrigin = text(data, 'countryOfOrigin');
			const agingTimeMonths = wholeNumber(text(data, 'agingTimeMonths'));

			if (!wrapperType || !countryOfOrigin || !strength || isNaN(lengthMm) || isNaN(ringGauge)) {
				return invalid('Zigarren-Details unvollständig');
			}
			if (!isOneOf(CigarStrength, strength)) return invalid('Ungültige Stärke');
			if (lengthMm <= 0 || ringGauge <= 0 || (agingTimeMonths !== null && isNaN(agingTimeMonths))) {
				return invalid('Ungültige Maße oder Reifezeit');
			}
			return {
				ok: true,
				value: {
					type: ProductType.CIGAR,
					values: { lengthMm, ringGauge, strength, wrapperType, countryOfOrigin, agingTimeMonths }
				}
			};
		}
		case ProductType.CIGARILLO: {
			const lengthMm = decimal(text(data, 'lengthMm'));
			const ringGauge = decimal(text(data, 'ringGauge'));
			const filterType = text(data, 'filterType');
			const wrapperType = text(data, 'wrapperType');

			if (!wrapperType || !filterType || isNaN(lengthMm) || isNaN(ringGauge)) {
				return invalid('Zigarillo-Details unvollständig');
			}
			if (!isOneOf(FilterType, filterType)) return invalid('Ungültiger Filter');
			if (lengthMm <= 0 || ringGauge <= 0) return invalid('Ungültige Maße');
			return {
				ok: true,
				value: {
					type: ProductType.CIGARILLO,
					values: { lengthMm, ringGauge, filterType, wrapperType }
				}
			};
		}
		case ProductType.BEVERAGE: {
			const volumeMl = decimal(text(data, 'volumeMl'));
			const alcoholPercentage = decimal(text(data, 'alcoholPercentage'));
			const type = text(data, 'beverageType');
			const countryOfOrigin = text(data, 'countryOfOrigin');
			const agingYears = wholeNumber(text(data, 'agingYears'));
			const tastingNotes = text(data, 'tastingNotes') || null;

			if (!type || !countryOfOrigin || isNaN(volumeMl) || isNaN(alcoholPercentage)) {
				return invalid('Getränke-Details unvollständig');
			}
			if (!isOneOf(BeverageType, type)) return invalid('Ungültige Getränkeart');
			if (volumeMl <= 0 || alcoholPercentage > 100 || (agingYears !== null && isNaN(agingYears))) {
				return invalid('Ungültige Menge, Alkoholgehalt oder Reifezeit');
			}
			return {
				ok: true,
				value: {
					type: ProductType.BEVERAGE,
					values: { volumeMl, alcoholPercentage, type, countryOfOrigin, agingYears, tastingNotes }
				}
			};
		}
		case ProductType.TOOL: {
			const material = text(data, 'material');
			const brand = text(data, 'brand');
			if (!material || !brand) return invalid('Zubehör-Details unvollständig');
			return {
				ok: true,
				value: {
					type: ProductType.TOOL,
					values: {
						material,
						brand,
						specifications: text(data, 'specifications') || null,
						careInstructions: text(data, 'careInstructions') || null
					}
				}
			};
		}
	}
}

/**
 * Reads and validates a whole product form, the product fields and the details of its type,
 * before anything is written.
 */
export function parseProductForm(data: FormData, productType: ProductType): Parsed<ProductInput> {
	const name = text(data, 'name');
	const sku = text(data, 'sku');
	const producerId = text(data, 'producerId');
	const priceRaw = text(data, 'price');
	const stock = wholeNumber(text(data, 'stock'));

	if (!name || !sku || !producerId || !priceRaw || stock === null || isNaN(stock)) {
		return invalid('Ungültige Eingabe');
	}
	const price = decimal(priceRaw);
	if (isNaN(price)) return invalid('Ungültiger Preis');

	const details = parseDetails(data, productType);
	if (!details.ok) return details;

	const tags = data.has('tags')
		? JSON.stringify(
				text(data, 'tags')
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean)
			)
		: undefined;

	return {
		ok: true,
		value: {
			name,
			description: text(data, 'description') || null,
			price,
			stock,
			sku,
			producerId,
			tags,
			details: details.value
		}
	};
}

function writeDetails(tx: Tx, productId: string, details: ProductDetails) {
	switch (details.type) {
		case ProductType.CIGAR:
			tx.insert(cigarDetailsTable)
				.values({ productId, ...details.values })
				.onConflictDoUpdate({ target: cigarDetailsTable.productId, set: details.values })
				.run();
			break;
		case ProductType.CIGARILLO:
			tx.insert(cigarilloDetailsTable)
				.values({ productId, ...details.values })
				.onConflictDoUpdate({ target: cigarilloDetailsTable.productId, set: details.values })
				.run();
			break;
		case ProductType.BEVERAGE:
			tx.insert(beverageDetailsTable)
				.values({ productId, ...details.values })
				.onConflictDoUpdate({ target: beverageDetailsTable.productId, set: details.values })
				.run();
			break;
		case ProductType.TOOL:
			tx.insert(toolDetailsTable)
				.values({ productId, ...details.values })
				.onConflictDoUpdate({ target: toolDetailsTable.productId, set: details.values })
				.run();
			break;
	}
}

function producerExists(tx: Tx, producerId: string) {
	return !!tx
		.select({ id: producerTable.id })
		.from(producerTable)
		.where(eq(producerTable.id, producerId))
		.get();
}

/** Turns a failed write into the message the admin sees. Unknown errors are not swallowed. */
function writeFailure(err: unknown, taken: string): { ok: false; error: string } {
	if (err instanceof Error && err.message.includes('UNIQUE')) return invalid(taken);
	throw err;
}

/** Creates a product and its details together. Nothing is saved if either part fails. */
export function createProduct(input: ProductInput): Parsed<{ id: string }> {
	const { details, tags, ...fields } = input;
	try {
		return db.transaction((tx) => {
			if (!producerExists(tx, input.producerId)) return invalid('Hersteller nicht gefunden');
			const { id } = tx
				.insert(productTable)
				.values({ ...fields, ...(tags ? { tags } : {}), productType: details.type })
				.returning({ id: productTable.id })
				.get();
			writeDetails(tx, id, details);
			return { ok: true, value: { id } } as const;
		});
	} catch (err) {
		return writeFailure(err, 'Fehler beim Erstellen. Möglicherweise ist die SKU bereits vergeben.');
	}
}

/**
 * Saves the product fields and the details of its type together. Nothing is saved if either part
 * fails. The type of a product never changes, so the details of the form must match it.
 */
export function updateProduct(id: string, input: ProductInput): Parsed<null> {
	const { details, tags, ...fields } = input;
	try {
		return db.transaction((tx) => {
			const product = tx
				.select({ productType: productTable.productType })
				.from(productTable)
				.where(eq(productTable.id, id))
				.get();
			if (!product) return invalid('Produkt nicht gefunden');
			if (product.productType !== details.type) return invalid('Ungültiger Produkttyp');
			if (!producerExists(tx, input.producerId)) return invalid('Hersteller nicht gefunden');

			tx.update(productTable)
				.set({ ...fields, ...(tags ? { tags } : {}), updatedAt: new Date() })
				.where(eq(productTable.id, id))
				.run();
			writeDetails(tx, id, details);
			return { ok: true, value: null } as const;
		});
	} catch (err) {
		return writeFailure(err, 'Fehler beim Speichern. Möglicherweise ist die SKU bereits vergeben.');
	}
}
