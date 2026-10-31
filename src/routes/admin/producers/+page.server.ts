import type { PageServerLoad, Actions } from './$types';
import db from '#lib/server/db/index.js';
import { producerTable } from '#lib/server/db/schema/index.js';
import {
	createProducer,
	deleteProducer,
	parseProducerForm,
	updateProducer
} from '#lib/server/catalogue.js';
import { MAX_PRODUCER_IMAGE_BYTES, removeImage, replaceImage } from '#lib/server/uploads.js';
import { asc, eq } from 'drizzle-orm';

const IMAGE_FOLDER = 'producer-images';

export const load: PageServerLoad = async () => {
	const producers = await db.query.producerTable.findMany({ orderBy: asc(producerTable.name) });
	return { producers };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const input = parseProducerForm(await request.formData());
		if (!input.ok) return { error: input.error };

		createProducer(input.value);
		return { success: 'Hersteller erstellt.' };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const input = parseProducerForm(data);

		if (!input.ok) return { error: input.error };
		if (!id || !updateProducer(id, input.value)) return { error: 'Hersteller nicht gefunden.' };

		return { success: 'Hersteller aktualisiert.' };
	},

	uploadImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { error: 'Fehlende ID.' };

		const producer = await db.query.producerTable.findFirst({
			where: eq(producerTable.id, id),
			columns: { id: true }
		});
		if (!producer) return { uploadError: 'Hersteller nicht gefunden.', uploadId: id };

		const result = await replaceImage({
			folder: IMAGE_FOLDER,
			name: producer.id,
			file: data.get('image'),
			maxBytes: MAX_PRODUCER_IMAGE_BYTES,
			save: (url) => {
				db.update(producerTable).set({ imageUrl: url }).where(eq(producerTable.id, id)).run();
			}
		});
		if (!result.ok) return { uploadError: result.error, uploadId: id };

		return { uploadSuccess: true, uploadId: id };
	},

	removeImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { error: 'Fehlende ID.' };

		const producer = await db.query.producerTable.findFirst({
			where: eq(producerTable.id, id),
			columns: { imageUrl: true }
		});
		if (!producer) return { error: 'Hersteller nicht gefunden.' };

		await db.update(producerTable).set({ imageUrl: null }).where(eq(producerTable.id, id));
		await removeImage(IMAGE_FOLDER, producer.imageUrl);
		return { removeSuccess: true, uploadId: id };
	},

	delete: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return { error: 'Fehlende ID.' };

		const result = deleteProducer(id);
		if (!result.ok) return { error: result.error };

		await removeImage(IMAGE_FOLDER, result.imageUrl);
		return { success: 'Hersteller gelöscht.' };
	}
};
