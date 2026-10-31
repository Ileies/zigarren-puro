import { generateSQLiteDrizzleJson, generateSQLiteMigration } from 'drizzle-kit/api';
import * as schema from '#lib/server/db/schema/index.js';

// Bundle the current schema with the server so first startup needs no CLI or schema push.
const empty = await generateSQLiteDrizzleJson({});
const current = await generateSQLiteDrizzleJson(schema);
const statements = await generateSQLiteMigration(empty, current);
await Bun.write(
	new URL('../src/lib/server/db/bootstrap.json', import.meta.url),
	JSON.stringify(statements, null, '\t') + '\n'
);
