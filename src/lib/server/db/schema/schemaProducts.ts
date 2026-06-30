import { integer, sqliteTable, primaryKey, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import type { BeverageType, CigarStrength, FilterType, ProductType } from '$lib/types';

export const producerTable = sqliteTable('producers', {
	id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	country: text('country').notNull(),
	contactInfo: text('contact_info'),
	imageUrl: text('image_url'),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull()
});

export const productTable = sqliteTable('products', {
	id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
	producerId: text('producer_id').references(() => producerTable.id, { onDelete: 'cascade' }).notNull(),
	name: text('name').notNull(),
	description: text('description'),
	imageUrl: text('image_url'),
	price: real('price').notNull(),
	stock: integer('stock').notNull().default(0),
	sku: text('sku').notNull().unique(),
	productType: text('product_type').notNull().$type<ProductType>(),
	tags: text('tags').default('[]').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow().notNull()
});

export const cigarDetailsTable = sqliteTable('cigar_details', {
	productId: text('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	lengthMm: real('length_mm').notNull(),
	ringGauge: real('ring_gauge').notNull(),
	strength: text('strength').notNull().$type<CigarStrength>(),
	wrapperType: text('wrapper_type').notNull(),
	countryOfOrigin: text('country_of_origin').notNull(),
	agingTimeMonths: integer('aging_time_months')
});

export const cigarilloDetailsTable = sqliteTable('cigarillo_details', {
	productId: text('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	lengthMm: real('length_mm').notNull(),
	ringGauge: real('ring_gauge').notNull(),
	filterType: text('filter_type').notNull().$type<FilterType>(),
	wrapperType: text('wrapper_type').notNull()
});

export const beverageDetailsTable = sqliteTable('beverage_details', {
	productId: text('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	volumeMl: real('volume_ml').notNull(),
	alcoholPercentage: real('alcohol_percentage').notNull(),
	type: text('type').notNull().$type<BeverageType>(),
	countryOfOrigin: text('country_of_origin').notNull(),
	agingYears: integer('aging_years'),
	tastingNotes: text('tasting_notes')
});

export const toolDetailsTable = sqliteTable('tool_details', {
	productId: text('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	material: text('material').notNull(),
	specifications: text('specifications'),
	brand: text('brand').notNull(),
	careInstructions: text('care_instructions')
});

export const producerRelations = relations(producerTable, ({ many }) => ({
	products: many(productTable)
}));

export const productRelations = relations(productTable, ({ one }) => ({
	producer: one(producerTable, {
		fields: [productTable.producerId],
		references: [producerTable.id]
	}),
	cigarDetails: one(cigarDetailsTable, {
		fields: [productTable.id],
		references: [cigarDetailsTable.productId]
	}),
	cigarilloDetails: one(cigarilloDetailsTable, {
		fields: [productTable.id],
		references: [cigarilloDetailsTable.productId]
	}),
	beverageDetails: one(beverageDetailsTable, {
		fields: [productTable.id],
		references: [beverageDetailsTable.productId]
	}),
	toolDetails: one(toolDetailsTable, {
		fields: [productTable.id],
		references: [toolDetailsTable.productId]
	})
}));

export const cigarDetailsRelations = relations(cigarDetailsTable, ({ one }) => ({
	product: one(productTable, {
		fields: [cigarDetailsTable.productId],
		references: [productTable.id]
	})
}));

export const cigarilloDetailsRelations = relations(cigarilloDetailsTable, ({ one }) => ({
	product: one(productTable, {
		fields: [cigarilloDetailsTable.productId],
		references: [productTable.id]
	})
}));

export const beverageDetailsRelations = relations(beverageDetailsTable, ({ one }) => ({
	product: one(productTable, {
		fields: [beverageDetailsTable.productId],
		references: [productTable.id]
	})
}));

export const toolDetailsRelations = relations(toolDetailsTable, ({ one }) => ({
	product: one(productTable, {
		fields: [toolDetailsTable.productId],
		references: [productTable.id]
	})
}));