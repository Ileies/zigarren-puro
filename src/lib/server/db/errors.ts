export type DatabaseFailure = 'schema' | 'unavailable';

export function databaseFailure(error: unknown): DatabaseFailure | null {
	const seen = new Set<unknown>();
	while (error && typeof error === 'object' && !seen.has(error)) {
		seen.add(error);
		const {
			message = '',
			code = '',
			cause
		} = error as {
			message?: string;
			code?: string;
			cause?: unknown;
		};
		if (/no such (table|column)|has no column named|database schema/i.test(message))
			return 'schema';
		if (String(code).startsWith('SQLITE_') || code === 'DB_UNAVAILABLE') return 'unavailable';
		error = cause;
	}
	return null;
}

export function databaseDiagnostic(error: unknown) {
	return databaseFailure(error) === 'schema'
		? 'Database schema is incomplete or outdated. Back up the database and run bun run db:push.'
		: 'Database is unreachable. Check DATABASE_PATH, directory permissions, disk space and SQLite file integrity.';
}
