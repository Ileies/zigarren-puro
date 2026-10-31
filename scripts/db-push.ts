import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { pushSQLiteSchema } from 'drizzle-kit/api';
import * as schema from '#lib/server/db/schema/index.js';

// Drizzle Kit's CLI requires a separate SQLite driver. Use the same Bun driver as the app.
export async function pushDatabaseSchema(path: string, dryRun = false) {
	const sqlite = new Database(path);
	try {
		// The API is typed for libSQL, but supports Bun's SQLite adapter at runtime.
		const plan = await pushSQLiteSchema(schema, drizzle(sqlite) as never);
		for (const statement of plan.statementsToExecute) console.log(statement);
		for (const warning of plan.warnings) console.warn(warning);
		if (plan.hasDataLoss) {
			throw new Error('Schema push refused: review the proposed data loss manually.');
		}
		if (dryRun) return;

		sqlite.transaction(() => {
			for (const statement of plan.statementsToExecute) sqlite.exec(statement);
		})();
		console.log(plan.statementsToExecute.length ? 'Schema updated.' : 'Schema is up to date.');
	} finally {
		sqlite.close();
	}
}

if (import.meta.main) {
	await pushDatabaseSchema(
		process.env.DATABASE_PATH ?? './local.db',
		process.argv.includes('--dry-run')
	);
}
