import type { Actions, PageServerLoad } from './$types';
import { confirmSubscription, previewConfirmation } from '#lib/server/newsletter.js';
import { sendNewsletterWelcomeEmail } from '#lib/server/functions.js';
import Logger from '#lib/server/Logger.js';

// Opening the link only checks it. The subscription is confirmed by the button, so mail scanners
// that follow links do not give consent on the reader's behalf.
export const load: PageServerLoad = ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) return { status: 'invalid' as const };
	return { status: previewConfirmation(token) };
};

export const actions: Actions = {
	default: async ({ url }) => {
		const token = url.searchParams.get('token');
		if (!token) return { status: 'invalid' as const };

		const result = confirmSubscription(token);
		if (result.state === 'invalid') return { status: 'invalid' as const };

		try {
			await sendNewsletterWelcomeEmail(result.email, result.unsubscribeToken);
		} catch (error) {
			await Logger.error('Newsletter welcome email failed', { error: String(error) });
		}
		return { status: 'confirmed' as const };
	}
};
