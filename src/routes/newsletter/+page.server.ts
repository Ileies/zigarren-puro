import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { sendMail } from '$lib/server/functions';
import db from '$lib/server/db';
import { customerTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { PUBLIC_ORIGIN, PUBLIC_APP_NAME } from '$env/static/public';

const subscribeSchema = z.object({
	email: z.string().email()
});

export const actions: Actions = {
	subscribe: async ({ request }) => {
		const formData = await request.formData();
		const parse = subscribeSchema.safeParse({ email: formData.get('email') });

		if (!parse.success) {
			return { success: false };
		}

		const { email } = parse.data;

		const [customer] = await db
			.select({ id: customerTable.id, firstName: customerTable.firstName })
			.from(customerTable)
			.where(eq(customerTable.email, email))
			.limit(1);

		if (customer) {
			await db
				.update(customerTable)
				.set({ marketingConsent: true, updatedAt: new Date() })
				.where(eq(customerTable.id, customer.id));

			await sendMail(
				{
					to: email,
					subject: `Newsletter-Anmeldung bestätigt – ${PUBLIC_APP_NAME}`,
					html: `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/></head><body style="font-family:Georgia,serif;background:#f4f4f0;padding:40px 16px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#fff">
<tr><td style="background:#000;padding:40px;text-align:center">
<h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:4px;text-transform:uppercase">Zigarren Puro</h1>
</td></tr>
<tr><td style="padding:40px">
<p style="color:#444;font-size:15px;line-height:1.8">Guten Tag ${customer.firstName},</p>
<p style="color:#444;font-size:15px;line-height:1.8">
Sie haben sich erfolgreich für unseren Newsletter angemeldet. Wir informieren Sie künftig über exklusive Angebote und Neuheiten.
</p>
<p style="color:#888;font-size:13px">
Sie können sich jederzeit über Ihr <a href="https://${PUBLIC_ORIGIN}/account" style="color:#b8834a">Kundenkonto</a> abmelden.
</p>
</td></tr>
<tr><td style="background:#111;padding:20px;text-align:center">
<p style="margin:0;color:#666;font-size:11px">Zigarren Puro GmbH &nbsp;·&nbsp; Weidengasse 25 &nbsp;·&nbsp; 50668 Köln</p>
</td></tr>
</table>
</body></html>`,
					text: `Guten Tag ${customer.firstName},\n\nSie haben sich erfolgreich für unseren Newsletter angemeldet.\n\nZigarren Puro`
				},
				customer.id
			);
		}

		return { success: true };
	}
};
