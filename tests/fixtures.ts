import db from '#lib/server/db/index.js';
import {
	addressTable,
	beverageDetailsTable,
	cigarDetailsTable,
	cigarilloDetailsTable,
	customerTable,
	orderItemTable,
	orderTable,
	producerTable,
	productReviewTable,
	productTable,
	toolDetailsTable
} from '#lib/server/db/schema/index.js';
import { ProductType } from '#lib/types.js';

export async function resetDb() {
	await db.delete(productReviewTable);
	await db.delete(orderItemTable);
	await db.delete(orderTable);
	await db.delete(addressTable);
	await db.delete(customerTable);
	await db.delete(cigarDetailsTable);
	await db.delete(cigarilloDetailsTable);
	await db.delete(beverageDetailsTable);
	await db.delete(toolDetailsTable);
	await db.delete(productTable);
	await db.delete(producerTable);
}

export async function seedCatalogue() {
	await db.insert(producerTable).values({ id: 'prod-1', name: 'Cohiba', country: 'Kuba' });
	await db.insert(productTable).values([
		{
			id: 'cigar-1',
			producerId: 'prod-1',
			name: 'Siglo VI',
			description: 'Kräftig und würzig',
			price: 40,
			stock: 5,
			sku: 'SKU-1',
			productType: ProductType.CIGAR
		},
		{
			id: 'cigar-2',
			producerId: 'prod-1',
			name: '100% Natural_Box',
			price: 90,
			stock: 0,
			sku: 'SKU-2',
			productType: ProductType.CIGAR
		},
		{
			id: 'rum-1',
			producerId: 'prod-1',
			name: 'Reserva Rum',
			price: 55,
			stock: 3,
			sku: 'SKU-3',
			productType: ProductType.BEVERAGE
		}
	]);
}

export async function seedCustomer() {
	await db.insert(customerTable).values({
		id: 'cust-1',
		email: 'max@example.com',
		firstName: 'Max',
		lastName: 'Meier',
		birthDate: '1980-01-01'
	});
	await db.insert(addressTable).values([
		{
			id: 'addr-1',
			customerId: 'cust-1',
			type: 'shipping',
			street: 'Weidengasse 25',
			city: 'Köln',
			state: 'NRW',
			country: 'DE',
			postalCode: '50668'
		}
	]);
}

export function baseOrder(overrides: Partial<typeof orderTable.$inferInsert> = {}) {
	return {
		customerId: 'cust-1',
		orderStatus: 'pending',
		paymentStatus: 'pending',
		paymentMethod: 'credit_card',
		shippingMethod: 'standard',
		shippingAddressId: 'addr-1',
		billingAddressId: 'addr-1',
		subtotalAmount: 40,
		shippingAmount: 5.99,
		taxAmount: 0,
		totalAmount: 45.99,
		...overrides
	} as typeof orderTable.$inferInsert;
}

export function cartCookies(items: { id: string; qty: number }[]) {
	const raw = Buffer.from(JSON.stringify(items)).toString('base64');
	return { get: (name: string) => (name === 'cart' ? raw : undefined) } as never;
}
