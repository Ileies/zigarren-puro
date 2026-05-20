import { boolean, date, decimal, integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { productTable } from './schemaProducts';
import { relations } from 'drizzle-orm';
import { authCredentialsTable, sessionTable, tokenTable } from './schemaAuth';
import type { Gender, OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from '$lib/types';

export const customerTable = pgTable('customers', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: varchar('email').notNull().unique(),
	firstName: varchar('first_name').notNull(),
	lastName: varchar('last_name').notNull(),
	birthDate: date('birth_date').notNull(), // Important for age verification
	gender: varchar('gender').$type<Gender>(),
	phone: varchar('phone'),
	preferredLanguage: varchar('preferred_language'),
	marketingConsent: boolean('marketing_consent').default(false).notNull(),
	isVerified: boolean('is_verified').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	metadata: jsonb('metadata') // For any additional customer data
});

export type Customer = typeof customerTable.$inferSelect;

export const addressTable = pgTable('addresses', {
	id: uuid('id').defaultRandom().primaryKey(),
	customerId: uuid('customer_id').references(() => customerTable.id).notNull(),
	type: varchar('type').notNull().$type<'shipping' | 'billing'>(),
	street: varchar('street').notNull(),
	city: varchar('city').notNull(),
	state: varchar('state').notNull(),
	country: varchar('country').notNull(),
	postalCode: varchar('postal_code').notNull(),
	isDefault: boolean('is_default').default(false).notNull()
});

export const orderTable = pgTable('orders', {
	id: uuid('id').defaultRandom().primaryKey(),
	customerId: uuid('customer_id').references(() => customerTable.id).notNull(),
	orderStatus: varchar('order_status').notNull().$type<OrderStatus>(),
	paymentStatus: varchar('payment_status').notNull().$type<PaymentStatus>(),
	paymentMethod: varchar('payment_method').notNull().$type<PaymentMethod>(),
	shippingMethod: varchar('shipping_method').notNull().$type<ShippingMethod>(),
	shippingAddressId: uuid('shipping_address_id').references(() => addressTable.id).notNull(),
	billingAddressId: uuid('billing_address_id').references(() => addressTable.id).notNull(),
	subtotalAmount: decimal('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
	shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).notNull(),
	taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
	totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	placedAt: timestamp('placed_at'),  // When the order was actually placed/paid
	cancelledAt: timestamp('cancelled_at')
});

export const orderItemTable = pgTable('order_items', {
	id: uuid('id').defaultRandom().primaryKey(),
	orderId: uuid('order_id').references(() => orderTable.id, { onDelete: 'cascade' }).notNull(),
	productId: uuid('product_id').references(() => productTable.id).notNull(),
	quantity: integer('quantity').notNull(),
	unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
	subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
	metadata: jsonb('metadata')  // For storing product-specific details at time of order
});

export const productReviewTable = pgTable('product_reviews', {
	id: uuid('id').defaultRandom().primaryKey(),
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).notNull(),
	customerId: uuid('customer_id').references(() => customerTable.id, { onDelete: 'cascade' }).notNull(),
	rating: integer('rating').notNull(), // 1–5
	title: varchar('title'),
	body: text('body'),
	createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
	unique('product_review_per_user').on(table.productId, table.customerId)
]);

export const wishlistTable = pgTable('wishlists', {
	customerId: uuid('customer_id').references(() => customerTable.id, { onDelete: 'cascade' }).notNull(),
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
	primaryKey({ columns: [table.customerId, table.productId] })
]);

export const customerRelations = relations(customerTable, ({ one, many }) => ({
	orders: many(orderTable),
	addresses: many(addressTable),
	wishlists: many(wishlistTable),
	authCredentials: one(authCredentialsTable, {
		fields: [customerTable.id],
		references: [authCredentialsTable.customerId]
	}),
	sessions: many(sessionTable),
	tokens: many(tokenTable)
}));

export const addressRelations = relations(addressTable, ({ one }) => ({
	customer: one(customerTable, {
		fields: [addressTable.customerId],
		references: [customerTable.id]
	})
}));

export const orderRelations = relations(orderTable, ({ one, many }) => ({
	customer: one(customerTable, {
		fields: [orderTable.customerId],
		references: [customerTable.id]
	}),
	shippingAddress: one(addressTable, {
		fields: [orderTable.shippingAddressId],
		references: [addressTable.id]
	}),
	billingAddress: one(addressTable, {
		fields: [orderTable.billingAddressId],
		references: [addressTable.id]
	}),
	items: many(orderItemTable)
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
	order: one(orderTable, {
		fields: [orderItemTable.orderId],
		references: [orderTable.id]
	}),
	product: one(productTable, {
		fields: [orderItemTable.productId],
		references: [productTable.id]
	})
}));

export const wishlistRelations = relations(wishlistTable, ({ one }) => ({
	customer: one(customerTable, {
		fields: [wishlistTable.customerId],
		references: [customerTable.id]
	}),
	product: one(productTable, {
		fields: [wishlistTable.productId],
		references: [productTable.id]
	})
}));

export const productReviewRelations = relations(productReviewTable, ({ one }) => ({
	customer: one(customerTable, {
		fields: [productReviewTable.customerId],
		references: [customerTable.id]
	}),
	product: one(productTable, {
		fields: [productReviewTable.productId],
		references: [productTable.id]
	})
}));
