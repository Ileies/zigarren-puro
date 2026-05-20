import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { customerTable } from './schemaShop';
import { relations } from 'drizzle-orm';
import type { TokenType } from '$lib/types';

export const authCredentialsTable = pgTable('auth_credentials', {
	customerId: uuid('customer_id')
		.references(() => customerTable.id, { onDelete: 'cascade' })
		.primaryKey(),
	passwordHash: text('password_hash').notNull(),
	failedAttempts: integer('failed_attempts').default(0).notNull(),
	lockedUntil: timestamp('locked_until'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sessionTable = pgTable('sessions', {
	id: text('id').primaryKey(),
	customerId: uuid('customer_id')
		.references(() => customerTable.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// One-time tokens for newsletter unsubscribe, password reset, email verification, etc.
export const tokenTable = pgTable('tokens', {
	token: text('token').notNull().primaryKey(),
	customerId: uuid('customer_id')
		.references(() => customerTable.id, { onDelete: 'cascade' })
		.notNull(),
	type: text('type').notNull().$type<TokenType>(),
	metadata: text('metadata'), // JSON string for additional data (e.g. new email for EMAIL_CHANGE)
	usedAt: timestamp('used_at'),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	revokedAt: timestamp('revoked_at')
});

export const authCredentialsRelations = relations(authCredentialsTable, ({ one }) => ({
	customer: one(customerTable, {
		fields: [authCredentialsTable.customerId],
		references: [customerTable.id]
	})
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
	customer: one(customerTable, {
		fields: [sessionTable.customerId],
		references: [customerTable.id]
	})
}));

export const tokenRelations = relations(tokenTable, ({ one }) => ({
	customer: one(customerTable, {
		fields: [tokenTable.customerId],
		references: [customerTable.id]
	})
}));
