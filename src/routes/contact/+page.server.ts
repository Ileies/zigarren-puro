import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { sendMail } from '$lib/server/functions';

const validTopics = [
	'info',
	'beratung',
	'events',
	'bestellungen',
	'rechtliches',
	'support'
] as const;

const contactSchema = z.object({
	company: z.string().optional(),
	name: z.string().min(2, 'Bitte geben Sie Ihren Namen ein.'),
	email: z.string().email('Bitte geben Sie eine gültige E-Mail ein.'),
	topic: z.enum(validTopics, {
		message: 'Bitte wählen Sie ein gültiges Thema aus.'
	}),
	subject: z.string().optional(),
	message: z.string().min(10, 'Bitte schreiben Sie eine Nachricht (min. 10 Zeichen).'),
	consent: z.string().refine((v) => v === 'on', {
		message: 'Bitte stimmen Sie der Datenschutzerklärung zu.'
	})
});

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData) as Record<string, string>;

		// Honeypot: silently succeed
		if (data.company && data.company.trim().length > 0) {
			return { success: true };
		}

		const parse = contactSchema.safeParse(data);
		if (!parse.success) {
			const issues = parse.error.issues.map((i) => i.message).join('\n');
			return {
				error: issues
			};
		}

		const { name, email, topic, subject, message } = parse.data;

		const textLines = [
			`Name: ${name}`,
			`E-Mail: ${email}`,
			subject ? `Betreff: ${subject}` : undefined,
			'',
			message
		].filter(Boolean) as string[];

		await sendMail({
			to: `${topic}@zigarren-puro.de`,
			subject: `Kontaktformular: ${subject || 'Neue Nachricht'}`,
			text: textLines.join('\n')
		});

		return { success: true };
	}
};
