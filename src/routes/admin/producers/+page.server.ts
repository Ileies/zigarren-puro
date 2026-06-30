import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { producerTable } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { writeFile, unlink, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const PRODUCER_IMAGES_DIR = join(
	process.cwd(),
	process.env.NODE_ENV === 'production' ? 'client' : 'static',
	'producer-images'
);
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024;

export const load: PageServerLoad = async () => {
	const producers = await db.query.producerTable.findMany({ orderBy: asc(producerTable.name) });
	return { producers };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const country = (data.get('country') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const contactInfo = (data.get('contactInfo') as string)?.trim() || null;

		if (!name || !country) {
			return { error: 'Name und Herkunftsland sind Pflichtfelder.' };
		}

		await db.insert(producerTable).values({ name, country, description, contactInfo });
		return { success: 'Hersteller erstellt.' };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = (data.get('name') as string)?.trim();
		const country = (data.get('country') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const contactInfo = (data.get('contactInfo') as string)?.trim() || null;

		if (!id || !name || !country) {
			return { error: 'Name und Herkunftsland sind Pflichtfelder.' };
		}

		await db.update(producerTable).set({ name, country, description, contactInfo }).where(eq(producerTable.id, id));
		return { success: 'Hersteller aktualisiert.' };
	},

	uploadImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const file = data.get('image') as File;

		if (!id) return { error: 'Fehlende ID.' };
		if (!file || file.size === 0) return { uploadError: 'Keine Datei ausgewählt.', uploadId: id };
		if (!ALLOWED_MIME.includes(file.type)) return { uploadError: 'Nur JPG, PNG und WebP sind erlaubt.', uploadId: id };
		if (file.size > MAX_SIZE) return { uploadError: 'Datei zu groß (max. 2 MB).', uploadId: id };

		const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
		const filename = `${id}.${ext}`;

		await mkdir(PRODUCER_IMAGES_DIR, { recursive: true });

		try {
			const existing = await readdir(PRODUCER_IMAGES_DIR);
			for (const f of existing) {
				if (f.startsWith(id + '.') && f !== filename) {
					await unlink(join(PRODUCER_IMAGES_DIR, f));
				}
			}
		} catch {}

		await writeFile(join(PRODUCER_IMAGES_DIR, filename), Buffer.from(await file.arrayBuffer()));
		await db.update(producerTable).set({ imageUrl: `/producer-images/${filename}` }).where(eq(producerTable.id, id));

		return { uploadSuccess: true, uploadId: id };
	},

	removeImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return { error: 'Fehlende ID.' };

		const producer = await db.query.producerTable.findFirst({
			where: eq(producerTable.id, id),
			columns: { imageUrl: true }
		});

		if (producer?.imageUrl) {
			const filename = producer.imageUrl.split('/').pop();
			if (filename) {
				try {
					await unlink(join(PRODUCER_IMAGES_DIR, filename));
				} catch {}
			}
		}

		await db.update(producerTable).set({ imageUrl: null }).where(eq(producerTable.id, id));
		return { removeSuccess: true, uploadId: id };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return { error: 'Fehlende ID.' };

		const producer = await db.query.producerTable.findFirst({
			where: eq(producerTable.id, id),
			columns: { imageUrl: true }
		});

		if (producer?.imageUrl) {
			const filename = producer.imageUrl.split('/').pop();
			if (filename) {
				try {
					await unlink(join(PRODUCER_IMAGES_DIR, filename));
				} catch {}
			}
		}

		try {
			await db.delete(producerTable).where(eq(producerTable.id, id));
		} catch {
			return { error: 'Hersteller konnte nicht gelöscht werden. Möglicherweise sind noch Produkte zugeordnet.' };
		}

		return { success: 'Hersteller gelöscht.' };
	}
};
