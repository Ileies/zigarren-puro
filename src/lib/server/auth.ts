import type { RequestEvent } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import { encodeBase64url } from '@oslojs/encoding';
import db from '$lib/server/db';
import { tokenTable, customerTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(bytes);
}

export async function createSession(token: string, customerId: string) {
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
	await db.insert(tokenTable).values({
		token,
		customerId,
		type: TokenType.SESSION,
		expiresAt
	});
	return { token, customerId, expiresAt };
}

export async function validateSessionToken(token: string) {
	const [result] = await db
		.select({
			user: { id: customerTable.id, email: customerTable.email, firstName: customerTable.firstName, lastName: customerTable.lastName },
			session: { token: tokenTable.token, customerId: tokenTable.customerId, expiresAt: tokenTable.expiresAt }
		})
		.from(tokenTable)
		.innerJoin(customerTable, eq(tokenTable.customerId, customerTable.id))
		.where(
			and(
				eq(tokenTable.token, token),
				eq(tokenTable.type, TokenType.SESSION),
				gt(tokenTable.expiresAt, new Date())
			)
		);

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const renewSession = Date.now() >= session.expiresAt!.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(tokenTable)
			.set({ expiresAt: session.expiresAt })
			.where(eq(tokenTable.token, session.token));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(token: string) {
	await db.delete(tokenTable).where(eq(tokenTable.token, token));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
