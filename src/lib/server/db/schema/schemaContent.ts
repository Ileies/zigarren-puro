import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const siteContentTable = sqliteTable('site_content', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});
