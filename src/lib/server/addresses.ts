import { and, eq, or } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import { addressTable, orderTable } from '#lib/server/db/schema/index.js';

// The routes turn these codes into messages in the visitor's language.

export type AddressType = 'shipping' | 'billing';

export type AddressInput = {
	type: AddressType;
	street: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	isDefault: boolean;
};

export type AddressFormError = 'invalidType' | 'requiredFields' | 'tooLong';

const MAX_FIELD_LENGTH = 200;

export function parseAddressForm(
	data: FormData
): { ok: true; value: AddressInput } | { ok: false; error: AddressFormError } {
	const field = (key: string) => data.get(key)?.toString().trim() ?? '';
	const type = field('type');

	if (type !== 'shipping' && type !== 'billing') return { ok: false, error: 'invalidType' };

	const value: AddressInput = {
		type,
		street: field('street'),
		city: field('city'),
		state: field('state'),
		country: field('country'),
		postalCode: field('postalCode'),
		isDefault: data.get('isDefault') === 'on'
	};

	if (!value.street || !value.city || !value.country || !value.postalCode) {
		return { ok: false, error: 'requiredFields' };
	}
	if (Object.values(value).some((v) => typeof v === 'string' && v.length > MAX_FIELD_LENGTH)) {
		return { ok: false, error: 'tooLong' };
	}
	return { ok: true, value };
}

/** Saves an address. A new default replaces the earlier default of the same type. */
export function addAddress(customerId: string, input: AddressInput) {
	db.transaction((tx) => {
		if (input.isDefault) {
			tx.update(addressTable)
				.set({ isDefault: false })
				.where(and(eq(addressTable.customerId, customerId), eq(addressTable.type, input.type)))
				.run();
		}
		tx.insert(addressTable)
			.values({ ...input, customerId })
			.run();
	});
}

/**
 * Deletes an address of this customer. An address that an order was placed with stays, because the
 * order shows it. Orders point to the address and do not keep a copy.
 */
export function deleteAddress(customerId: string, id: string): 'deleted' | 'notFound' | 'inUse' {
	return db.transaction((tx) => {
		const [address] = tx
			.select({ id: addressTable.id })
			.from(addressTable)
			.where(and(eq(addressTable.id, id), eq(addressTable.customerId, customerId)))
			.all();
		if (!address) return 'notFound';

		const [order] = tx
			.select({ id: orderTable.id })
			.from(orderTable)
			.where(or(eq(orderTable.shippingAddressId, id), eq(orderTable.billingAddressId, id)))
			.limit(1)
			.all();
		if (order) return 'inUse';

		tx.delete(addressTable).where(eq(addressTable.id, id)).run();
		return 'deleted';
	});
}

/** Makes an address of this customer the default of its type. Someone else's id changes nothing. */
export function setDefaultAddress(customerId: string, id: string): 'ok' | 'notFound' {
	return db.transaction((tx) => {
		const [address] = tx
			.select({ type: addressTable.type })
			.from(addressTable)
			.where(and(eq(addressTable.id, id), eq(addressTable.customerId, customerId)))
			.all();
		if (!address) return 'notFound';

		tx.update(addressTable)
			.set({ isDefault: false })
			.where(and(eq(addressTable.customerId, customerId), eq(addressTable.type, address.type)))
			.run();
		tx.update(addressTable).set({ isDefault: true }).where(eq(addressTable.id, id)).run();
		return 'ok';
	});
}
