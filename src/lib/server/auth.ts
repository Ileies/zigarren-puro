import type { RequestEvent } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import db from '$lib/server/db';
import { sessionTable, customerTable } from '$lib/server/db/schema';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const hash = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [salt, hash] = stored.split(':');
	const hashBuffer = Buffer.from(hash, 'hex');
	const derived = (await scryptAsync(password, salt, 64)) as Buffer;
	return timingSafeEqual(hashBuffer, derived);
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(token: string, customerId: string) {
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
	await db.insert(sessionTable).values({ id: token, customerId, expiresAt });
	return { id: token, customerId, expiresAt };
}

export async function validateSessionToken(token: string) {
	const [result] = await db
		.select({
			user: {
				id: customerTable.id,
				email: customerTable.email,
				firstName: customerTable.firstName,
				lastName: customerTable.lastName
			},
			session: {
				id: sessionTable.id,
				customerId: sessionTable.customerId,
				expiresAt: sessionTable.expiresAt
			}
		})
		.from(sessionTable)
		.innerJoin(customerTable, eq(sessionTable.customerId, customerTable.id))
		.where(and(eq(sessionTable.id, token), gt(sessionTable.expiresAt, new Date())));

	if (!result) return { session: null, user: null };

	const { session, user } = result;

	if (Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(sessionTable)
			.set({ expiresAt: session.expiresAt })
			.where(eq(sessionTable.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(id: string) {
	await db.delete(sessionTable).where(eq(sessionTable.id, id));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, { path: '/' });
}
