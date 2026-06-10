import { defineConfig } from 'drizzle-kit';

const dbPath = process.env.DATABASE_PATH ?? './local.db';

export default defineConfig({
	schema: './src/lib/server/db/schema',
	dialect: 'sqlite',
	dbCredentials: { url: dbPath },
	verbose: true,
	strict: true
});
