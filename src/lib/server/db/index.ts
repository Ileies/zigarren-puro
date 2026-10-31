import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { is } from 'drizzle-orm';
import { SQLiteTable, getTableConfig } from 'drizzle-orm/sqlite-core';
import * as schema from '#lib/server/db/schema/index.js';
import statements from '#lib/server/db/bootstrap.json';

export const databasePath = process.env.DATABASE_PATH ?? './local.db';
let connection: Database | undefined;
let checkedVersion: number | undefined;

function connect() {
	if (connection) return connection;
	if (databasePath !== ':memory:') mkdirSync(dirname(resolve(databasePath)), { recursive: true });
	const opened = new Database(databasePath, { create: true });
	try {
		opened.transaction(() => {
			const tables = opened
				.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
				.all();
			if (tables.length === 0) {
				for (const statement of statements) opened.exec(statement);
				console.info('[Database] Created schema', { path: databasePath });
			}
		})();
		connection = opened;
		return opened;
	} catch (error) {
		opened.close();
		throw error;
	}
}

// Open lazily so filesystem failures reach the request error boundary.
const sqlite = new Proxy({} as Database, {
	get(_target, property) {
		const db = connect();
		const value = Reflect.get(db, property, db);
		return typeof value === 'function' ? value.bind(db) : value;
	}
});
const db = drizzle({ client: sqlite, schema });

export function checkDatabase() {
	const sqlite = connect();
	if (databasePath !== ':memory:' && !existsSync(databasePath)) {
		throw Object.assign(new Error('Database file no longer exists'), { code: 'DB_UNAVAILABLE' });
	}
	const { schema_version: version } = sqlite.query('PRAGMA schema_version').get() as {
		schema_version: number;
	};
	if (version === checkedVersion) return;
	for (const table of Object.values(schema)) {
		if (!is(table, SQLiteTable)) continue;
		const { name, columns } = getTableConfig(table);
		const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
		sqlite
			.query(
				`SELECT ${columns.map((column) => `${quote(name)}.${quote(column.name)}`).join(', ')} FROM ${quote(name)} LIMIT 0`
			)
			.all();
	}
	checkedVersion = version;
}

export default db;
