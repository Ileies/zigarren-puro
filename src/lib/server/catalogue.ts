import { count, eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	beverageDetailsTable,
	cigarDetailsTable,
	cigarilloDetailsTable,
	orderItemTable,
	producerTable,
	productReviewTable,
	productTable,
	toolDetailsTable,
	wishlistTable
} from '#lib/server/db/schema/index.js';

// The admin is German-only on purpose (staff), so the messages here are German.

export type ProducerInput = {
	name: string;
	country: string;
	description: string | null;
	contactInfo: string | null;
};

const text = (data: FormData, key: string) => data.get(key)?.toString().trim() ?? '';

export function parseProducerForm(
	data: FormData
): { ok: true; value: ProducerInput } | { ok: false; error: string } {
	const name = text(data, 'name');
	const country = text(data, 'country');
	const description = text(data, 'description');
	const contactInfo = text(data, 'contactInfo');

	if (!name || !country) return { ok: false, error: 'Name und Herkunftsland sind Pflichtfelder.' };
	if (name.length > 200 || country.length > 100) {
		return { ok: false, error: 'Name oder Herkunftsland sind zu lang.' };
	}
	if (description.length > 5000 || contactInfo.length > 1000) {
		return { ok: false, error: 'Beschreibung oder Kontaktdaten sind zu lang.' };
	}

	return {
		ok: true,
		value: { name, country, description: description || null, contactInfo: contactInfo || null }
	};
}

export function createProducer(input: ProducerInput) {
	db.insert(producerTable).values(input).run();
}

/** Returns false when there is no producer with this id. */
export function updateProducer(id: string, input: ProducerInput) {
	const updated = db
		.update(producerTable)
		.set(input)
		.where(eq(producerTable.id, id))
		.returning({ id: producerTable.id })
		.all();
	return updated.length > 0;
}

export type DeleteResult = { ok: true; imageUrl: string | null } | { ok: false; error: string };

/**
 * Deletes a producer that has no products. SQLite does not enforce the foreign keys here, so
 * deleting a producer with products would leave products without a producer.
 */
export function deleteProducer(id: string): DeleteResult {
	return db.transaction((tx) => {
		const [producer] = tx
			.select({ imageUrl: producerTable.imageUrl })
			.from(producerTable)
			.where(eq(producerTable.id, id))
			.all();
		if (!producer) return { ok: false, error: 'Hersteller nicht gefunden.' };

		const [{ products }] = tx
			.select({ products: count() })
			.from(productTable)
			.where(eq(productTable.producerId, id))
			.all();
		if (products > 0) {
			return {
				ok: false,
				error: `Hersteller hat noch ${products} Produkt${products === 1 ? '' : 'e'}. Zuerst die Produkte löschen oder einem anderen Hersteller zuordnen.`
			};
		}

		tx.delete(producerTable).where(eq(producerTable.id, id)).run();
		return { ok: true, imageUrl: producer.imageUrl };
	});
}

/**
 * Deletes a product together with its details, wishlist entries and reviews. A product that was
 * ordered stays, because old orders point to it. Set its stock to 0 to take it out of sale.
 */
export function deleteProduct(id: string): DeleteResult {
	return db.transaction((tx) => {
		const [product] = tx
			.select({ imageUrl: productTable.imageUrl })
			.from(productTable)
			.where(eq(productTable.id, id))
			.all();
		if (!product) return { ok: false, error: 'Produkt nicht gefunden.' };

		const [{ orders }] = tx
			.select({ orders: count() })
			.from(orderItemTable)
			.where(eq(orderItemTable.productId, id))
			.all();
		if (orders > 0) {
			return {
				ok: false,
				error:
					'Das Produkt wurde bereits bestellt und kann nicht gelöscht werden. Setzen Sie den Bestand auf 0.'
			};
		}

		tx.delete(wishlistTable).where(eq(wishlistTable.productId, id)).run();
		tx.delete(productReviewTable).where(eq(productReviewTable.productId, id)).run();
		tx.delete(cigarDetailsTable).where(eq(cigarDetailsTable.productId, id)).run();
		tx.delete(cigarilloDetailsTable).where(eq(cigarilloDetailsTable.productId, id)).run();
		tx.delete(beverageDetailsTable).where(eq(beverageDetailsTable.productId, id)).run();
		tx.delete(toolDetailsTable).where(eq(toolDetailsTable.productId, id)).run();
		tx.delete(productTable).where(eq(productTable.id, id)).run();
		return { ok: true, imageUrl: product.imageUrl };
	});
}
