import { sql, type AnyColumn } from 'drizzle-orm';

/**
 * `column like %text%` where `%`, `_` and `\` in the text match themselves. SQLite has no ILIKE,
 * and LIKE is case-insensitive for ASCII only, which is acceptable here.
 */
export function likeContains(column: AnyColumn, text: string) {
	const pattern = `%${text.replace(/[\\%_]/g, '\\$&')}%`;
	return sql`${column} like ${pattern} escape '\\'`;
}
