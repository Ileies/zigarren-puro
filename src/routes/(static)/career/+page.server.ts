import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { sendMail } from '$lib/server/functions';
import { email as shopEmail } from '$lib/config';

const applicationSchema = z.object({
	name: z.string().min(2, 'Bitte geben Sie Ihren Namen ein.'),
	email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
	message: z.string().min(10, 'Bitte schreiben Sie eine Nachricht (min. 10 Zeichen).')
});

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData) as Record<string, string>;

		// Honeypot
		if (data.company && data.company.trim().length > 0) {
			return { success: true };
		}

		const parse = applicationSchema.safeParse(data);
		if (!parse.success) {
			const issues = parse.error.issues.map((i) => i.message).join('\n');
			return { error: issues };
		}

		const { name, email, message } = parse.data;

		try {
			await sendMail({
				to: shopEmail,
				replyTo: `"${name}" <${email}>`,
				subject: `Initiativbewerbung von ${name}`,
				text: `Name: ${name}\nE-Mail: ${email}\n\n${message}`
			});
		} catch {
			return { error: 'Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' };
		}

		return { success: true };
	}
};
