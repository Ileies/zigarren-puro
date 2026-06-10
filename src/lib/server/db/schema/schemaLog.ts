import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { LogLevel } from '$lib/types';

export const logTable = sqliteTable('logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	type: text('type').notNull().$type<LogLevel>(),
	message: text('message').notNull(),
	createdAt: integer('timestamp', { mode: 'timestamp' }).notNull().defaultNow(),
	data: text('data', { mode: 'json' })
});
