import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { orderTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/login');

	const order = await db.query.orderTable.findFirst({
		where: eq(orderTable.id, params.id),
		with: {
			shippingAddress: true,
			billingAddress: true,
			items: {
				with: { product: true }
			}
		}
	});

	if (!order || order.customerId !== locals.user.id) error(404, 'Bestellung nicht gefunden');

	return { order };
};
