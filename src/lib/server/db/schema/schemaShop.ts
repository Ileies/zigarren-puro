import { integer, sqliteTable, primaryKey, text, real, unique } from 'drizzle-orm/sqlite-core';
import { productTable } from './schemaProducts';
import { relations } from 'drizzle-orm';
import { authCredentialsTable, sessionTable, tokenTable } from './schemaAuth';
import type { Gender, OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from '$lib/types';

export const customerTable = sqliteTable('customers', {
	id: text('id')
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	email: text('email').notNull().unique(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	birthDate: text('birth_date').notNull(), // Important for age verification, stored as 'YYYY-MM-DD'
	gender: text('gender').$type<Gender>(),
	phone: text('phone'),
	preferredLanguage: text('preferred_language'),
	marketingConsent: integer('marketing_consent', { mode: 'boolean' }).default(false).notNull(),
	isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow().notNull(),
	metadata: text('metadata', { mode: 'json' }) // For any additional customer data
});

export type Customer = typeof customerTable.$inferSelect;

export const addressTable = sqliteTable('addresses', {
	id: text('id')
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	customerId: text('customer_id')
		.references(() => customerTable.id)
		.notNull(),
	type: text('type').notNull().$type<'shipping' | 'billing'>(),
	street: text('street').notNull(),
	city: text('city').notNull(),
	state: text('state').notNull(),
	country: text('country').notNull(),
	postalCode: text('postal_code').notNull(),
	isDefault: integer('is_default', { mode: 'boolean' }).default(false).notNull()
});

export const orderTable = sqliteTable('orders', {
	id: text('id')
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	customerId: text('customer_id')
		.references(() => customerTable.id)
		.notNull(),
	orderStatus: text('order_status').notNull().$type<OrderStatus>(),
	paymentStatus: text('payment_status').notNull().$type<PaymentStatus>(),
	paymentMethod: text('payment_method').notNull().$type<PaymentMethod>(),
	shippingMethod: text('shipping_method').notNull().$type<ShippingMethod>(),
	shippingAddressId: text('shipping_address_id')
		.references(() => addressTable.id)
		.notNull(),
	billingAddressId: text('billing_address_id')
		.references(() => addressTable.id)
		.notNull(),
	subtotalAmount: real('subtotal_amount').notNull(),
	shippingAmount: real('shipping_amount').notNull(),
	taxAmount: real('tax_amount').notNull(),
	totalAmount: real('total_amount').notNull(),
	notes: text('notes'),
	stripeSessionId: text('stripe_session_id'),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow().notNull(),
	placedAt: integer('placed_at', { mode: 'timestamp' }),
	cancelledAt: integer('cancelled_at', { mode: 'timestamp' })
});

export const orderItemTable = sqliteTable('order_items', {
	id: text('id')
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	orderId: text('order_id')
		.references(() => orderTable.id, { onDelete: 'cascade' })
		.notNull(),
	productId: text('product_id')
		.references(() => productTable.id)
		.notNull(),
	quantity: integer('quantity').notNull(),
	unitPrice: real('unit_price').notNull(),
	subtotal: real('subtotal').notNull(),
	metadata: text('metadata', { mode: 'json' }) // For storing product-specific details at time of order
});

export const productReviewTable = sqliteTable(
	'product_reviews',
	{
		id: text('id')
			.$defaultFn(() => crypto.randomUUID())
			.primaryKey(),
		productId: text('product_id')
			.references(() => productTable.id, { onDelete: 'cascade' })
			.notNull(),
		customerId: text('customer_id')
			.references(() => customerTable.id, { onDelete: 'cascade' })
			.notNull(),
		rating: integer('rating').notNull(), // 1-5
		title: text('title'),
		body: text('body'),
		createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull()
	},
	(table) => [unique('product_review_per_user').on(table.productId, table.customerId)]
);

export const wishlistTable = sqliteTable(
	'wishlists',
	{
		customerId: text('customer_id')
			.references(() => customerTable.id, { onDelete: 'cascade' })
			.notNull(),
		productId: text('product_id')
			.references(() => productTable.id, { onDelete: 'cascade' })
			.notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull()
	},
	(table) => [primaryKey({ columns: [table.customerId, table.productId] })]
);

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
