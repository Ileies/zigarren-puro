// Development seed: a small catalogue that covers the cases the storefront has to handle
// (single and box, low stock, sold out, long name, Cuban, spirit, accessory).
//
// The values are placeholders for development. They are NOT sourced product data and must never
// be shown to customers. Every row has a fixed id and a `SEED-` SKU, so running the script again
// changes nothing, and the rows are easy to find and delete.
//
//   bun run db:seed
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

const NOTE = 'Entwicklungsdaten, kein echtes Sortiment.';

const producers = [
	{ id: 'seed-producer-cuba', name: 'Seed Habana', country: 'Kuba', description: NOTE },
	{
		id: 'seed-producer-do',
		name: 'Seed Santiago',
		country: 'Dominikanische Republik',
		description: NOTE
	},
	{ id: 'seed-producer-scot', name: 'Seed Highland', country: 'Schottland', description: NOTE },
	{ id: 'seed-producer-de', name: 'Seed Werkstatt', country: 'Deutschland', description: NOTE }
];

type SeedProduct = typeof productTable.$inferInsert & { id: string };

function product(
	id: string,
	producerId: string,
	productType: ProductType,
	name: string,
	price: number,
	stock: number
): SeedProduct {
	return {
		id: `seed-${id}`,
		producerId,
		productType,
		name,
		price,
		stock,
		sku: `SEED-${id.toUpperCase()}`,
		description: NOTE
	};
}

const products: SeedProduct[] = [
	product('cigar-cuban-single', 'seed-producer-cuba', ProductType.CIGAR, 'Seed Robusto', 38, 24),
	product(
		'cigar-cuban-box',
		'seed-producer-cuba',
		ProductType.CIGAR,
		'Seed Robusto, Kiste mit 25',
		890,
		2
	),
	product('cigar-soldout', 'seed-producer-cuba', ProductType.CIGAR, 'Seed Churchill', 52, 0),
	product(
		'cigar-longname',
		'seed-producer-do',
		ProductType.CIGAR,
		'Seed Gran Reserva Especial Edicion Limitada Double Corona Maduro Aniversario',
		74,
		9
	),
	product('cigar-mild', 'seed-producer-do', ProductType.CIGAR, 'Seed Petit Corona', 14.5, 60),
	product('cigarillo-regular', 'seed-producer-do', ProductType.CIGARILLO, 'Seed Mini', 6.9, 40),
	product(
		'cigarillo-charcoal',
		'seed-producer-do',
		ProductType.CIGARILLO,
		'Seed Mini Filter',
		7.4,
		0
	),
	product('rum', 'seed-producer-cuba', ProductType.BEVERAGE, 'Seed Rum 7 Jahre', 34.9, 12),
	product('whiskey', 'seed-producer-scot', ProductType.BEVERAGE, 'Seed Single Malt 12', 59, 6),
	product('cognac', 'seed-producer-scot', ProductType.BEVERAGE, 'Seed Cognac VSOP', 68, 1),
	product('tool-cutter', 'seed-producer-de', ProductType.TOOL, 'Seed Zigarrenschneider', 29, 15),
	product('tool-humidor', 'seed-producer-de', ProductType.TOOL, 'Seed Humidor, 50 Zigarren', 189, 4)
];

const cigarDetails = [
	{
		id: 'cigar-cuban-single',
		lengthMm: 124,
		ringGauge: 50,
		strength: CigarStrength.FULL,
		country: 'Kuba'
	},
	{
		id: 'cigar-cuban-box',
		lengthMm: 124,
		ringGauge: 50,
		strength: CigarStrength.FULL,
		country: 'Kuba'
	},
	{
		id: 'cigar-soldout',
		lengthMm: 178,
		ringGauge: 47,
		strength: CigarStrength.MEDIUM,
		country: 'Kuba'
	},
	{
		id: 'cigar-longname',
		lengthMm: 190,
		ringGauge: 52,
		strength: CigarStrength.FULL,
		country: 'Dominikanische Republik'
	},
	{
		id: 'cigar-mild',
		lengthMm: 129,
		ringGauge: 42,
		strength: CigarStrength.MILD,
		country: 'Dominikanische Republik'
	}
];

export function seed() {
	const inserted = { producers: 0, products: 0, details: 0 };

	// bun:sqlite transactions are synchronous, so everything inside uses .all() and no await
	db.transaction((tx) => {
		inserted.producers = tx
			.insert(producerTable)
			.values(producers)
			.onConflictDoNothing()
			.returning()
			.all().length;
		inserted.products = tx
			.insert(productTable)
			.values(products)
			.onConflictDoNothing()
			.returning()
			.all().length;

		const details = [
			tx
				.insert(cigarDetailsTable)
				.values(
					cigarDetails.map((d) => ({
						productId: `seed-${d.id}`,
						lengthMm: d.lengthMm,
						ringGauge: d.ringGauge,
						strength: d.strength,
						wrapperType: 'Seed',
						countryOfOrigin: d.country
					}))
				)
				.onConflictDoNothing()
				.returning()
				.all(),
			tx
				.insert(cigarilloDetailsTable)
				.values([
					{
						productId: 'seed-cigarillo-regular',
						lengthMm: 85,
						ringGauge: 20,
						filterType: FilterType.NONE,
						wrapperType: 'Seed'
					},
					{
						productId: 'seed-cigarillo-charcoal',
						lengthMm: 85,
						ringGauge: 20,
						filterType: FilterType.CHARCOAL,
						wrapperType: 'Seed'
					}
				])
				.onConflictDoNothing()
				.returning()
				.all(),
			tx
				.insert(beverageDetailsTable)
				.values([
					{
						productId: 'seed-rum',
						volumeMl: 700,
						alcoholPercentage: 40,
						type: BeverageType.RUM,
						countryOfOrigin: 'Kuba',
						agingYears: 7
					},
					{
						productId: 'seed-whiskey',
						volumeMl: 700,
						alcoholPercentage: 43,
						type: BeverageType.WHISKEY,
						countryOfOrigin: 'Schottland',
						agingYears: 12
					},
					{
						productId: 'seed-cognac',
						volumeMl: 700,
						alcoholPercentage: 40,
						type: BeverageType.COGNAC,
						countryOfOrigin: 'Frankreich'
					}
				])
				.onConflictDoNothing()
				.returning()
				.all(),
			tx
				.insert(toolDetailsTable)
				.values([
					{ productId: 'seed-tool-cutter', material: 'Edelstahl', brand: 'Seed Werkstatt' },
					{ productId: 'seed-tool-humidor', material: 'Zedernholz', brand: 'Seed Werkstatt' }
				])
				.onConflictDoNothing()
				.returning()
				.all()
		];
		inserted.details = details.reduce((sum, rows) => sum + rows.length, 0);
	});

	return inserted;
}

if (import.meta.main) {
	if (process.env.NODE_ENV === 'production') {
		console.error('Refusing to seed development data with NODE_ENV=production.');
		process.exit(1);
	}
	console.log(`Seeding ${process.env.DATABASE_PATH ?? './local.db'}`);
	console.log(seed());
}
