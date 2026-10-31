import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Every test run gets its own SQLite file. This must run before `#lib/server/db` is imported.
process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'zigarren-test-')), 'test.db');

const { Database } = await import('bun:sqlite');
const { drizzle } = await import('drizzle-orm/bun-sqlite');
const { pushSQLiteSchema } = await import('drizzle-kit/api');
const schema = await import('../src/lib/server/db/schema/index.ts');

const sqlite = new Database(process.env.DATABASE_PATH);
const { apply } = await pushSQLiteSchema(schema, drizzle(sqlite) as never);
await apply();
sqlite.close();
