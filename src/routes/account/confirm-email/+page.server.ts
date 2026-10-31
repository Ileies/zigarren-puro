import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { confirmEmailChange } from '#lib/server/profile.js';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) redirect(302, '/login');

	return confirmEmailChange(locals.user.id, url.searchParams.get('token'));
};
