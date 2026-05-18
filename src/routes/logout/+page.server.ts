import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as auth from '$lib/server/auth';

export const actions: Actions = {
	default: async (event) => {
		const sessionToken = event.cookies.get(auth.sessionCookieName);
		if (sessionToken) {
			await auth.invalidateSession(sessionToken);
		}
		auth.deleteSessionTokenCookie(event);
		redirect(302, '/');
	}
};
