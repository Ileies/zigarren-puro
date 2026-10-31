import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { error, isHttpError } from '@sveltejs/kit';
import * as auth from '#lib/server/auth.js';
import { cookieName, getTextDirection, locales, runWithLocale } from '#lib/messages.js';
import Logger from '#lib/server/Logger.js';
import db from '#lib/server/db/index.js';
import { sql } from 'drizzle-orm';
import { ADMIN_PASSWORD } from '$app/env/private';
import errorTemplate from './error.html?raw';

const handleAdmin: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/admin')) {
		return resolve(event);
	}

	const adminPassword = ADMIN_PASSWORD;
	if (!adminPassword) {
		error(503, 'Admin not configured');
	}

	const authHeader = event.request.headers.get('Authorization');
	if (authHeader?.startsWith('Basic ')) {
		try {
			const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
			const colonIndex = decoded.indexOf(':');
			if (colonIndex !== -1) {
				const username = decoded.slice(0, colonIndex);
				const password = decoded.slice(colonIndex + 1);
				if (username === 'admin' && password === adminPassword) {
					return resolve(event);
				}
			}
		} catch {
			// invalid base64
		}
	}

	return new Response(errorTemplate.replaceAll('%sveltekit.status%', '401'), {
		status: 401,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'WWW-Authenticate': 'Basic realm="Admin"'
		}
	});
};

const handleChecks: Handle = async ({ event, resolve }) => {
	const { method, headers } = event.request;
	const { origin } = event.url;
	if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
		const requestOrigin = headers.get('origin');
		if (requestOrigin && requestOrigin !== origin) {
			error(403, 'Forbidden');
		}
	}
	console.log(new Date().toISOString(), event.url.href);

	try {
		db.run(sql`select 1`);
		event.locals.dbOffline = false;
	} catch {
		event.locals.dbOffline = true;
		try {
			await Logger.error('Database is offline.');
		} catch {
			console.error('Database is offline (logger also unavailable).');
		}
	}

	const userAgent = event.request.headers.get('user-agent') || '';
	event.locals.isDesktop = !/mobile/i.test(userAgent);

	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

const handleLocale: Handle = ({ event, resolve }) => {
	const raw = event.cookies.get(cookieName) ?? 'de';
	const locale = (locales as readonly string[]).includes(raw) ? raw : 'de';
	return runWithLocale(locale, () =>
		resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%lang%', locale).replace('%dir%', getTextDirection(locale))
		})
	);
};

export const handle: Handle = sequence(handleAdmin, handleChecks, handleAuth, handleLocale);

export const handleError = ({
	error,
	event
}: {
	error: unknown;
	event: import('@sveltejs/kit').RequestEvent;
}) => {
	const expected = isHttpError(error);
	const status = expected ? (error as { status: number }).status : 500;
	const message = expected
		? error.body.message
		: error instanceof Error
			? error.message
			: String(error);
	const stack = error instanceof Error ? error.stack : undefined;
	if (!expected || status >= 500) {
		console.error(`[${status}] ${event.url.pathname}`, stack ?? message);
	}
	return { message };
};
