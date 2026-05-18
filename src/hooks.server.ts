import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth';
import { type Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
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

const handleChecks: Handle = async ({ event, resolve }) => {
	console.log(new Date().toISOString(), event.url.href);

	try {
		await db.execute('select 1');
		event.locals.dbOffline = false;
	} catch {
		await Logger.error('Database is offline.');
		event.locals.dbOffline = true;
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

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = sequence(handleAdmin, handleChecks, handleAuth, handleParaglide);
