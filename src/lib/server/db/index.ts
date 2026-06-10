import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { DATABASE_PATH } from '$env/static/private';

const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite, { schema });

export default db;
