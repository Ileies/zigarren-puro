import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import type { LogLevel } from '$lib/types';

export const logTable = pgTable('logs', {
	id: serial().primaryKey(),
	type: text('type').notNull().$type<LogLevel>(),
	message: text('message').notNull(),
	createdAt: timestamp('timestamp').notNull().defaultNow(),
	data: jsonb('data')
});
