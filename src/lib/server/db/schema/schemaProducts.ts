import { decimal, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { BeverageType, CigarStrength, FilterType, ProductType } from '$lib/types';

export const producerTable = pgTable('producers', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name').notNull(),
	description: text('description'),
	country: varchar('country').notNull(),
	contactInfo: text('contact_info'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const productTable = pgTable('products', {
	id: uuid('id').defaultRandom().primaryKey(),
	producerId: uuid('producer_id').references(() => producerTable.id, { onDelete: 'cascade' }).notNull(),
	name: varchar('name').notNull(),
	description: text('description'),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	stock: integer('stock').notNull().default(0),
	sku: varchar('sku').notNull().unique(),
	productType: varchar('product_type').notNull().$type<ProductType>(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const categoryTable = pgTable('product_categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name').notNull(),
	description: text('description')
});

export const categoryMappingTable = pgTable('product_category_mappings', {
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).notNull(),
	categoryId: uuid('category_id').references(() => categoryTable.id, { onDelete: 'cascade' }).notNull()
}, (table) => [
	primaryKey({ columns: [table.productId, table.categoryId] })
]);

export const cigarDetailsTable = pgTable('cigar_details', {
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	lengthMm: decimal('length_mm').notNull(),
	ringGauge: decimal('ring_gauge').notNull(),
	strength: varchar('strength').notNull().$type<CigarStrength>(),
	wrapperType: varchar('wrapper_type').notNull(),
	countryOfOrigin: varchar('country_of_origin').notNull(),
	agingTimeMonths: integer('aging_time_months')
});

export const cigarilloDetailsTable = pgTable('cigarillo_details', {
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	lengthMm: decimal('length_mm').notNull(),
	ringGauge: decimal('ring_gauge').notNull(),
	filterType: varchar('filter_type').notNull().$type<FilterType>(),
	wrapperType: varchar('wrapper_type').notNull()
});

export const beverageDetailsTable = pgTable('beverage_details', {
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	volumeMl: decimal('volume_ml').notNull(),
	alcoholPercentage: decimal('alcohol_percentage', { precision: 4, scale: 2 }).notNull(),
	type: varchar('type').notNull().$type<BeverageType>(),
	countryOfOrigin: varchar('country_of_origin').notNull(),
	agingYears: integer('aging_years'),
	tastingNotes: text('tasting_notes')
});

export const toolDetailsTable = pgTable('tool_details', {
	productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }).primaryKey(),
	material: varchar('material').notNull(),
	specifications: text('specifications'),
	brand: varchar('brand').notNull(),
	careInstructions: text('care_instructions')
});

export const producerRelations = relations(producerTable, ({ many }) => ({
	products: many(productTable)
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
	producer: one(producerTable, {
		fields: [productTable.producerId],
		references: [producerTable.id]
	}),
	categories: many(categoryMappingTable),
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

export const categoryRelations = relations(categoryTable, ({ many }) => ({
	products: many(categoryMappingTable)
}));

export const categoryMappingRelations = relations(categoryMappingTable, ({ one }) => ({
	product: one(productTable, {
		fields: [categoryMappingTable.productId],
		references: [productTable.id]
	}),
	category: one(categoryTable, {
		fields: [categoryMappingTable.categoryId],
		references: [categoryTable.id]
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