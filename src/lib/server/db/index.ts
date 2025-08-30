import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';
import { DATABASE_URL } from '$env/static/private';

const db = drizzle(DATABASE_URL, { schema });

export default db;
