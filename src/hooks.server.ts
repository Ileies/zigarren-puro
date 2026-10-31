import { sequence, type Handle, type ServerInit } from '@sveltejs/kit/hooks';
import { error, isHttpError } from '@sveltejs/kit';
import * as auth from '#lib/server/auth.js';
import { startOrderSweep } from '#lib/server/orderSweep.js';
import { cookieName, getTextDirection, locales, runWithLocale } from '#lib/messages.js';
import Logger from '#lib/server/Logger.js';
import { checkDatabase, databasePath } from '#lib/server/db/index.js';
import { databaseFailure, databaseDiagnostic } from '#lib/server/db/errors.js';
import * as m from '#lib/messages.js';
import { ADMIN_PASSWORD } from '$app/env/private';
import errorTemplate from './error.html?raw';

// Cancels unpaid orders after their payment deadline so reserved stock does not stay blocked
export const init: ServerInit = () => {
	startOrderSweep();
};

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
		checkDatabase();
		event.locals.dbOffline = false;
	} catch (cause) {
		event.locals.dbOffline = true;
		await Logger.error(databaseDiagnostic(cause), { path: databasePath, error: String(cause) });
		return databaseUnavailable(event);
	}

	const userAgent = event.request.headers.get('user-agent') || '';
	event.locals.isDesktop = !/mobile/i.test(userAgent);

	try {
		const response = await resolve(event);
		return event.locals.dbOffline ? databaseUnavailable(event) : response;
	} catch (cause) {
		if (!databaseFailure(cause)) throw cause;
		await Logger.error(databaseDiagnostic(cause), { path: databasePath, error: String(cause) });
		return databaseUnavailable(event);
	}
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

function databaseUnavailable(event: import('@sveltejs/kit').RequestEvent) {
	const raw = event.cookies.get(cookieName) ?? 'de';
	const locale = (locales as readonly string[]).includes(raw) ? raw : 'de';
	return runWithLocale(locale, () => {
		const message = m.errorDatabaseDescription();
		const headers = { 'Retry-After': '60', 'Cache-Control': 'no-store' };
		if (event.isDataRequest || event.request.headers.get('accept')?.includes('application/json')) {
			return Response.json(
				{ type: 'error', status: 503, error: { message, code: 'DATABASE_UNAVAILABLE' } },
				{ status: 503, headers }
			);
		}
		return new Response(
			errorTemplate
				.replaceAll('%sveltekit.status%', '503')
				.replace('<html lang="de">', `<html lang="${locale}" dir="${getTextDirection(locale)}">`)
				.replace('Diese Seite ist gerade nicht erreichbar.', m.errorDatabaseTitle())
				.replace(
					/<p class="description">[\s\S]*?<\/p>/,
					() => `<p class="description">${message}</p>`
				),
			{ status: 503, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } }
		);
	});
}

export const handleError = ({
	error,
	event
}: {
	error: unknown;
	event: import('@sveltejs/kit').RequestEvent;
}) => {
	const expected = isHttpError(error);
	const status = expected ? (error as { status: number }).status : 500;
	const failure = databaseFailure(error);
	if (failure) event.locals.dbOffline = true;
	const message = failure
		? m.errorDatabaseDescription()
		: expected
			? error.body.message
			: m.errorServerDescription();
	const stack = error instanceof Error ? error.stack : undefined;
	if (!expected || status >= 500) {
		void Logger.error(failure ? databaseDiagnostic(error) : 'Request failed', {
			status,
			path: event.url.pathname,
			databasePath: failure ? databasePath : undefined,
			error: stack ?? String(error)
		});
	}
	return { message, ...(failure ? { code: 'DATABASE_UNAVAILABLE' } : {}) };
};
