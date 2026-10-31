import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { sendNewsletterConfirmationEmail } from '#lib/server/functions.js';
import { requestSubscription } from '#lib/server/newsletter.js';
import Logger from '#lib/server/Logger.js';
import { getLocale } from '#lib/messages.js';

const subscribeSchema = z.object({
	email: z.string().email().max(254)
});

export const actions: Actions = {
	subscribe: async ({ request }) => {
		const formData = await request.formData();
		const parse = subscribeSchema.safeParse({ email: formData.get('email') });

		if (!parse.success) {
			return fail(400, { success: false });
		}

		// Double opt-in: nothing is subscribed until the link in the mail is confirmed. The answer is
		// the same for new, pending and confirmed addresses, so the form does not reveal who is on the list.
		const outcome = requestSubscription(parse.data.email, getLocale());

		if (outcome.action === 'send') {
			try {
				await sendNewsletterConfirmationEmail(outcome.email, outcome.confirmToken);
			} catch (error) {
				await Logger.error('Newsletter confirmation email failed', { error: String(error) });
			}
		}

		return { success: true };
	}
};
