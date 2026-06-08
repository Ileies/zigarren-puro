import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth';
import { type Handle } from '@sveltejs/kit';
import { cookieName, getTextDirection, locales, runWithLocale } from '$lib/messages';
import Logger from '$lib/server/Logger';
import db from '$lib/server/db';
import { env } from '$env/dynamic/private';

const handleAdmin: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/admin')) {
		return resolve(event);
	}

	const adminPassword = env.ADMIN_PASSWORD;
	if (!adminPassword) {
		return new Response('Admin not configured', { status: 503 });
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

	return new Response('Unauthorized', {
		status: 401,
		headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
	});
};

const CSRF_EXEMPT = ['/api/stripe/webhook'];

const handleChecks: Handle = async ({ event, resolve }) => {
	const { method, headers } = event.request;
	const { pathname, origin } = event.url;
	if (
		(method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') &&
		!CSRF_EXEMPT.includes(pathname)
	) {
		const requestOrigin = headers.get('origin');
		if (requestOrigin && requestOrigin !== origin) {
			return new Response('Forbidden', { status: 403 });
		}
	}
	console.log(new Date().toISOString(), event.url.href);

	try {
		await db.execute('select 1');
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
