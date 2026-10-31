import { expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { databaseFailure } from '#lib/server/db/errors.js';

function probe(path: string) {
	return Bun.spawnSync(
		[
			process.execPath,
			'-e',
			`
		import { checkDatabase } from './src/lib/server/db/index.ts';
		import { databaseFailure, databaseDiagnostic } from './src/lib/server/db/errors.ts';
		try { checkDatabase(); console.log('HEALTHY'); }
		catch (error) {
			console.error(databaseFailure(error), databaseDiagnostic(error), String(error));
			process.exit(1);
		}
	`
		],
		{ env: { ...process.env, DATABASE_PATH: path } }
	);
}

test('first startup creates directories and a complete schema and preserves existing content', () => {
	const directory = mkdtempSync(join(tmpdir(), 'zigarren-health-'));
	const path = join(directory, 'nested', 'new.db');
	try {
		expect(probe(path).exitCode).toBe(0);
		const sqlite = new Database(path);
		try {
			expect(sqlite.query('SELECT * FROM orders').all()).toEqual([]);
			sqlite.exec("INSERT INTO site_content VALUES ('test', 'preserved')");
			expect(probe(path).exitCode).toBe(0);
			expect(sqlite.query('SELECT value FROM site_content').get()).toEqual({ value: 'preserved' });
		} finally {
			sqlite.close();
		}
	} finally {
		rmSync(directory, { recursive: true });
	}
});

test('empty existing files are initialized; missing tables and columns are diagnosed without changing data', () => {
	const directory = mkdtempSync(join(tmpdir(), 'zigarren-schema-'));
	const path = join(directory, 'empty.db');
	writeFileSync(path, '');
	try {
		expect(probe(path).exitCode).toBe(0);
		const sqlite = new Database(path);
		try {
			sqlite.exec('DROP TABLE site_content');
			let result = probe(path);
			expect(result.exitCode).toBe(1);
			expect(result.stderr.toString()).toContain('bun run db:push');
			expect(result.stderr.toString()).toContain('no such table: site_content');
			sqlite.exec('CREATE TABLE site_content (key TEXT PRIMARY KEY)');
			result = probe(path);
			expect(result.exitCode).toBe(1);
			expect(result.stderr.toString()).toContain('no such column');
		} finally {
			sqlite.close();
		}
	} finally {
		rmSync(directory, { recursive: true });
	}
});

test('unreachable paths do not fail at module import and report an actionable diagnostic', () => {
	const directory = mkdtempSync(join(tmpdir(), 'zigarren-unreachable-'));
	try {
		const result = probe(directory);
		expect(result.exitCode).toBe(1);
		expect(result.stderr.toString()).toContain('Check DATABASE_PATH');
	} finally {
		rmSync(directory, { recursive: true });
	}
});

test('database classification follows wrapped causes and handles cycles', () => {
	const cause = Object.assign(new Error('no such table: orders'), { code: 'SQLITE_ERROR' });
	const wrapped = new Error('Query failed', { cause });
	expect(databaseFailure(wrapped)).toBe('schema');
	expect(databaseFailure(Object.assign(new Error('locked'), { code: 'SQLITE_BUSY' }))).toBe(
		'unavailable'
	);
	expect(databaseFailure(new Error('other failure'))).toBeNull();
	const cycle = { cause: {} };
	cycle.cause = cycle;
	expect(databaseFailure(cycle)).toBeNull();
});
