import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { customerTable } from './schemaShop';
import { relations } from 'drizzle-orm';
import type { TokenType } from '$lib/types';

export const authCredentialsTable = sqliteTable('auth_credentials', {
	customerId: text('customer_id')
		.references(() => customerTable.id, { onDelete: 'cascade' })
		.primaryKey(),
	passwordHash: text('password_hash').notNull(),
	failedAttempts: integer('failed_attempts').default(0).notNull(),
	lockedUntil: integer('locked_until', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow().notNull()
});

export const sessionTable = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	customerId: text('customer_id')
		.references(() => customerTable.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull()
});

// One-time tokens for newsletter unsubscribe, password reset, email verification, etc.
export const tokenTable = sqliteTable('tokens', {
	token: text('token').notNull().primaryKey(),
	customerId: text('customer_id')
		.references(() => customerTable.id, { onDelete: 'cascade' })
		.notNull(),
	type: text('type').notNull().$type<TokenType>(),
	metadata: text('metadata'), // JSON string for additional data (e.g. new email for EMAIL_CHANGE)
	usedAt: integer('used_at', { mode: 'timestamp' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
	revokedAt: integer('revoked_at', { mode: 'timestamp' })
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
