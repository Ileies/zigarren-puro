import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import db from '$lib/server/db';
import { customerTable } from '$lib/server/db/schema';
import { sendPasswordResetEmail } from '$lib/server/functions';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase();

		if (!email) {
			return fail(400, { error: 'Bitte geben Sie Ihre E-Mail-Adresse ein.' });
		}

		const [customer] = await db
			.select({ id: customerTable.id, firstName: customerTable.firstName })
			.from(customerTable)
			.where(eq(customerTable.email, email));

		if (customer) {
			await sendPasswordResetEmail(customer.id, email, customer.firstName);
		}

		return { sent: true };
	}
};
