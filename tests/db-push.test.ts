import { test, expect } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import db from '#lib/server/db/index.js';
import { orderTable } from '#lib/server/db/schema/index.js';
import { pushDatabaseSchema } from '../scripts/db-push.ts';
import { baseOrder, resetDb, seedCustomer } from './fixtures.ts';

test('schema push upgrades a legacy database without losing orders and is repeatable', async () => {
	await resetDb();
	await seedCustomer();
	await db.insert(orderTable).values(baseOrder({ id: 'legacy' }));
	const directory = mkdtempSync(join(tmpdir(), 'zigarren-push-'));
	const path = join(directory, 'legacy.db');
	const sqlite = new Database(process.env.DATABASE_PATH!);
	try {
		sqlite.query('VACUUM INTO ?').run(path);
	} finally {
		sqlite.close();
	}
	const legacy = new Database(path);
	try {
		legacy.exec('DROP INDEX orders_order_number_unique');
		legacy.exec('ALTER TABLE orders DROP COLUMN order_number');
		for (const column of ['product_name', 'sku', 'vat_rate']) {
			legacy.exec(`ALTER TABLE order_items DROP COLUMN ${column}`);
		}
		legacy.exec('DROP TABLE newsletter_subscribers');
		await pushDatabaseSchema(path, true);
		expect(() => legacy.query('SELECT order_number FROM orders').all()).toThrow();

		await pushDatabaseSchema(path);
		expect(legacy.query('SELECT id, order_number, total_amount FROM orders').all()).toEqual([
			{ id: 'legacy', order_number: null, total_amount: 45.99 }
		]);
		expect(legacy.query('SELECT product_name, sku, vat_rate FROM order_items').all()).toEqual([]);
		expect(legacy.query('SELECT * FROM newsletter_subscribers').all()).toEqual([]);
		await pushDatabaseSchema(path);
		expect(legacy.query('SELECT count(*) AS total FROM orders').get()).toEqual({ total: 1 });
	} finally {
		legacy.close();
		rmSync(directory, { recursive: true });
	}
});
