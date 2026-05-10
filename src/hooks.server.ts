import { sequence } from '@sveltejs/kit/hooks';
//import * as auth from '$lib/server/auth';
import { type Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import Logger from '$lib/server/Logger';
import db from '$lib/server/db';

const handleChecks: Handle = async ({ event, resolve }) => {
	// Log the request URL
	console.log(new Date().toISOString(), event.url.href);

	// Check if the database is online
	try {
		await db.execute('select 1');
		event.locals.dbOffline = false;
	} catch {
		await Logger.error('Database is offline.');
		event.locals.dbOffline = true;
	}

	// Check device type
	const userAgent = event.request.headers.get('user-agent') || '';
	event.locals.isDesktop = !/mobile/i.test(userAgent);

	/*
	 * Not Needed event.locals.store = await InitService.fetchInit();
	 * event.locals.me = await authenticateUser(event);
	 * event.locals.sid = event.cookies.get('connect.sid');
	 */

	return resolve(event);
};
const handleAuth: Handle = async ({ event, resolve }) => {
	/*const sessionToken = event.cookies.get(auth.sessionCookieName);

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
	event.locals.session = session;*/
	return resolve(event);
};
const handleParaglide: Handle = ({ event, resolve }) =>
paraglideMiddleware(event.request, ({ request, locale }) => {
	event.request = request;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
	});
});

export const handle: Handle = sequence(handleChecks, handleAuth, handleParaglide);
