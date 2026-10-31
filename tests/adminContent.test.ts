import { beforeEach, describe, expect, test } from 'bun:test';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { eq } from 'drizzle-orm';
import db from '#lib/server/db/index.js';
import {
	beverageDetailsTable,
	cigarDetailsTable,
	orderItemTable,
	orderTable,
	producerTable,
	productReviewTable,
	productTable,
	siteContentTable,
	wishlistTable
} from '#lib/server/db/schema/index.js';
import { BeverageType, CigarStrength } from '#lib/types.js';
import { isSafeLink, getSiteContent, contentDefaults } from '#lib/server/content.js';
import { removeImage, replaceImage, uploadsDir } from '#lib/server/uploads.js';
import { getUploadedImage } from '#lib/server/uploaded-image.js';
import {
	actions as producerActions,
	load as loadProducers
} from '../src/routes/admin/producers/+page.server.ts';
import { actions as productActions } from '../src/routes/admin/inventory/[id]/+page.server.ts';
import {
	actions as contentActions,
	load as loadContent
} from '../src/routes/admin/content/+page.server.ts';
import { baseOrder, resetDb, seedCatalogue, seedCustomer } from './fixtures.ts';

// The upload actions write real files, into the temporary folder set in tests/setup.ts.

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];

const image = (head: number[], tail = 1, type = 'image/png') =>
	new File([new Uint8Array([...head, tail])], 'upload', { type });
const png = (tail = 1) => image(PNG, tail);

const formData = (fields: Record<string, string | File>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};

const event = (fields: Record<string, string | File> = {}, id = 'cigar-1') =>
	({ request: { formData: async () => formData(fields) }, params: { id } }) as never;

async function thrown(run: () => unknown) {
	try {
		await run();
	} catch (err) {
		return err as { status: number; location?: string };
	}
	throw new Error('expected a redirect or an error');
}

const filesIn = async (folder: string) => {
	try {
		return (await readdir(uploadsDir(folder))).sort();
	} catch {
		return [];
	}
};
const fileOf = (url: string | null) => basename(url ?? '');

const producer = async (id: string) =>
	(await db.select().from(producerTable).where(eq(producerTable.id, id)))[0];
const product = async (id: string) =>
	(await db.select().from(productTable).where(eq(productTable.id, id)))[0];

beforeEach(async () => {
	await resetDb();
	await rm(uploadsDir('product-images'), { recursive: true, force: true });
	await rm(uploadsDir('producer-images'), { recursive: true, force: true });
	await rm(uploadsDir('content-images'), { recursive: true, force: true });
});

describe('replaceImage', () => {
	const options = (file: unknown, save: (url: string) => void = () => {}) => ({
		folder: 'product-images',
		name: 'p1',
		file,
		maxBytes: 100,
		save
	});

	test('stores the file under a name with a content hash', async () => {
		let saved = '';
		const result = await replaceImage(options(png(), (url) => (saved = url)));

		expect(result.ok).toBe(true);
		expect(saved).toMatch(/^\/product-images\/p1-[0-9a-f]{12}\.png$/);
		expect(await filesIn('product-images')).toEqual([basename(saved)]);
	});

	test('a different image gets a different URL, so a cached copy is not shown again', async () => {
		const first = await replaceImage(options(png(1)));
		const second = await replaceImage(options(png(2)));

		expect(first.ok && second.ok && first.url !== second.url).toBe(true);
		// Only the newest file is kept
		expect(await filesIn('product-images')).toEqual([fileOf(second.ok ? second.url : null)]);
	});

	test('the same image twice keeps the one file', async () => {
		const first = await replaceImage(options(png(5)));
		const second = await replaceImage(options(png(5)));

		expect(first).toEqual(second);
		expect(await filesIn('product-images')).toHaveLength(1);
	});

	test('a new image replaces one in another format and a file from the old naming scheme', async () => {
		await mkdir(uploadsDir('product-images'), { recursive: true });
		await writeFile(join(uploadsDir('product-images'), 'p1.jpg'), 'old');
		await writeFile(join(uploadsDir('product-images'), 'p10.jpg'), 'other product');

		const result = await replaceImage(options(image(WEBP, 1, 'image/webp')));

		expect(result.ok && result.url.endsWith('.webp')).toBe(true);
		// p10 is another product, not a file of p1
		expect(await filesIn('product-images')).toEqual(
			['p10.jpg', fileOf(result.ok ? result.url : null)].sort()
		);
	});

	test('accepts JPEG and WebP by their content', async () => {
		expect((await replaceImage(options(image(JPEG, 1, 'image/jpeg')))).ok).toBe(true);
		expect((await replaceImage(options(image(WEBP, 2, 'image/webp')))).ok).toBe(true);
	});

	test('judges by the content, not by the type the browser reports', async () => {
		const html = new File(['<script>alert(1)</script>'], 'x.png', { type: 'image/png' });
		const result = await replaceImage(options(html));

		expect(result).toEqual({ ok: false, error: 'Nur JPG, PNG und WebP sind erlaubt.' });
		expect(await filesIn('product-images')).toEqual([]);
	});

	test('refuses an empty upload, a missing file and a file that is too large', async () => {
		const empty = await replaceImage(options(new File([], 'x.png', { type: 'image/png' })));
		const none = await replaceImage(options(null));
		const text = await replaceImage(options('not a file'));
		const large = await replaceImage({ ...options(png()), maxBytes: 4 });

		expect(empty).toEqual({ ok: false, error: 'Keine Datei ausgewählt.' });
		expect(none).toEqual(empty);
		expect(text).toEqual(empty);
		expect(large.ok).toBe(false);
		expect(await filesIn('product-images')).toEqual([]);
	});

	test('a failing save removes the new file and keeps the old one', async () => {
		const first = await replaceImage(options(png(1)));
		const failed = replaceImage(
			options(png(2), () => {
				throw new Error('db down');
			})
		);

		await expect(failed).rejects.toThrow('db down');
		expect(await filesIn('product-images')).toEqual([fileOf(first.ok ? first.url : null)]);
	});

	test('removeImage deletes the file, ignores a missing one and stays inside the folder', async () => {
		const stored = await replaceImage(options(png()));
		await mkdir(uploadsDir('producer-images'), { recursive: true });
		await writeFile(join(uploadsDir('producer-images'), 'keep.png'), 'x');

		await removeImage('product-images', stored.ok ? stored.url : null);
		await removeImage('product-images', stored.ok ? stored.url : null);
		await removeImage('product-images', null);
		// Only the file name counts, so a crafted URL cannot reach another folder
		await removeImage('product-images', '/product-images/../producer-images/keep.png');

		expect(await filesIn('product-images')).toEqual([]);
		expect(await filesIn('producer-images')).toEqual(['keep.png']);
	});

	test('the file route serves a stored image and refuses other names', async () => {
		const stored = await replaceImage(options(png()));
		const name = fileOf(stored.ok ? stored.url : null);

		const found = await getUploadedImage('product-images', name);
		expect(found.status).toBe(200);
		expect(found.headers.get('Content-Type')).toBe('image/png');
		expect((await getUploadedImage('product-images', '../x.png')).status).toBe(404);
		expect((await getUploadedImage('product-images', 'missing.png')).status).toBe(404);
		expect((await getUploadedImage('product-images', 'notes.txt')).status).toBe(404);
	});
});

describe('admin producers', () => {
	beforeEach(seedCatalogue);

	const fields = { name: 'Davidoff', country: 'Schweiz', description: '', contactInfo: '' };

	test('the list is sorted by name', async () => {
		await db.insert(producerTable).values({ id: 'p-a', name: 'Arturo Fuente', country: 'USA' });
		const { producers } = (await loadProducers({} as never)) as { producers: { name: string }[] };

		expect(producers.map((p) => p.name)).toEqual(['Arturo Fuente', 'Cohiba']);
	});

	test('create saves trimmed values and empty optional fields as null', async () => {
		const result = await producerActions.create!(
			event({ ...fields, name: '  Davidoff  ', description: '  ' })
		);

		expect(result).toEqual({ success: 'Hersteller erstellt.' });
		const [saved] = await db.select().from(producerTable).where(eq(producerTable.name, 'Davidoff'));
		expect(saved).toMatchObject({ country: 'Schweiz', description: null, contactInfo: null });
	});

	test('create needs name and country and limits their length', async () => {
		const missing = await producerActions.create!(event({ ...fields, country: ' ' }));
		const long = await producerActions.create!(event({ ...fields, name: 'x'.repeat(201) }));

		expect(missing).toEqual({ error: 'Name und Herkunftsland sind Pflichtfelder.' });
		expect(long).toHaveProperty('error');
		expect(await db.select().from(producerTable)).toHaveLength(1);
	});

	test('update changes the producer and reports an unknown id instead of success', async () => {
		const ok = await producerActions.update!(
			event({ ...fields, id: 'prod-1', name: 'Cohiba Cuba' })
		);
		const unknown = await producerActions.update!(event({ ...fields, id: 'nope' }));

		expect(ok).toEqual({ success: 'Hersteller aktualisiert.' });
		expect((await producer('prod-1')).name).toBe('Cohiba Cuba');
		expect(unknown).toEqual({ error: 'Hersteller nicht gefunden.' });
	});

	test('an image upload is saved, replaced and removed together with its file', async () => {
		await producerActions.uploadImage!(event({ id: 'prod-1', image: png(1) }));
		const first = (await producer('prod-1')).imageUrl;
		expect(first).toMatch(/^\/producer-images\/prod-1-[0-9a-f]{12}\.png$/);

		const replaced = await producerActions.uploadImage!(event({ id: 'prod-1', image: png(2) }));
		const second = (await producer('prod-1')).imageUrl;
		expect(replaced).toEqual({ uploadSuccess: true, uploadId: 'prod-1' });
		expect(second).not.toBe(first);
		expect(await filesIn('producer-images')).toEqual([fileOf(second)]);

		const removed = await producerActions.removeImage!(event({ id: 'prod-1' }));
		expect(removed).toEqual({ removeSuccess: true, uploadId: 'prod-1' });
		expect((await producer('prod-1')).imageUrl).toBeNull();
		expect(await filesIn('producer-images')).toEqual([]);
	});

	test('an upload for an unknown producer writes no file', async () => {
		const result = await producerActions.uploadImage!(event({ id: '../../evil', image: png() }));

		expect(result).toHaveProperty('uploadError', 'Hersteller nicht gefunden.');
		expect(await filesIn('producer-images')).toEqual([]);
	});

	test('a bad upload reports the reason and keeps the current image', async () => {
		await producerActions.uploadImage!(event({ id: 'prod-1', image: png(1) }));
		const before = (await producer('prod-1')).imageUrl;

		const none = await producerActions.uploadImage!(event({ id: 'prod-1' }));
		const wrong = await producerActions.uploadImage!(
			event({ id: 'prod-1', image: new File(['hello'], 'a.png', { type: 'image/png' }) })
		);
		const large = await producerActions.uploadImage!(
			event({ id: 'prod-1', image: new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'a.png') })
		);

		expect(none).toHaveProperty('uploadError', 'Keine Datei ausgewählt.');
		expect(wrong).toHaveProperty('uploadError', 'Nur JPG, PNG und WebP sind erlaubt.');
		expect(large).toHaveProperty('uploadError', 'Datei zu groß (max. 2 MB).');
		expect((await producer('prod-1')).imageUrl).toBe(before);
	});

	test('a producer with products cannot be deleted', async () => {
		const result = await producerActions.delete!(event({ id: 'prod-1' }));

		expect(result).toEqual({
			error:
				'Hersteller hat noch 3 Produkte. Zuerst die Produkte löschen oder einem anderen Hersteller zuordnen.'
		});
		expect(await producer('prod-1')).toBeDefined();
		expect(await db.select().from(productTable)).toHaveLength(3);
	});

	test('a producer without products is deleted with its image', async () => {
		await db.insert(producerTable).values({ id: 'p-empty', name: 'Leer', country: 'DE' });
		await producerActions.uploadImage!(event({ id: 'p-empty', image: png() }));

		const result = await producerActions.delete!(event({ id: 'p-empty' }));

		expect(result).toEqual({ success: 'Hersteller gelöscht.' });
		expect(await producer('p-empty')).toBeUndefined();
		expect(await filesIn('producer-images')).toEqual([]);
		expect(await producerActions.delete!(event({ id: 'p-empty' }))).toEqual({
			error: 'Hersteller nicht gefunden.'
		});
	});
});

describe('admin product images and deletion', () => {
	beforeEach(seedCatalogue);

	test('upload, replace and remove keep the file and the URL in step', async () => {
		await productActions.uploadImage!(event({ image: png(1) }));
		const first = (await product('cigar-1')).imageUrl;
		expect(first).toMatch(/^\/product-images\/cigar-1-[0-9a-f]{12}\.png$/);

		await productActions.uploadImage!(event({ image: image(JPEG, 2, 'image/jpeg') }));
		const second = (await product('cigar-1')).imageUrl;
		expect(second).toMatch(/\.jpg$/);
		expect(await filesIn('product-images')).toEqual([fileOf(second)]);

		const removed = await productActions.removeImage!(event());
		expect(removed).toEqual({ imageRemoved: true });
		expect((await product('cigar-1')).imageUrl).toBeNull();
		expect(await filesIn('product-images')).toEqual([]);
	});

	test('an image for an unknown product is a 404 and writes no file', async () => {
		const upload = await thrown(() => productActions.uploadImage!(event({ image: png() }, 'nope')));
		const remove = await thrown(() => productActions.removeImage!(event({}, 'nope')));

		expect(upload.status).toBe(404);
		expect(remove.status).toBe(404);
		expect(await filesIn('product-images')).toEqual([]);
	});

	test('a bad image reports the reason', async () => {
		const result = await productActions.uploadImage!(
			event({ image: new File(['text'], 'a.png', { type: 'image/png' }) })
		);

		expect(result).toEqual({ error: 'Nur JPG, PNG und WebP sind erlaubt.' });
	});

	test('deleting removes the product with its details, wishlist entries, reviews and image', async () => {
		await seedCustomer();
		await db.insert(cigarDetailsTable).values({
			productId: 'cigar-1',
			lengthMm: 150,
			ringGauge: 52,
			strength: CigarStrength.FULL,
			wrapperType: 'Habano',
			countryOfOrigin: 'Kuba'
		});
		await db.insert(wishlistTable).values({ customerId: 'cust-1', productId: 'cigar-1' });
		await db
			.insert(productReviewTable)
			.values({ productId: 'cigar-1', customerId: 'cust-1', rating: 5 });
		await productActions.uploadImage!(event({ image: png() }));

		const result = await thrown(() => productActions.delete!(event()));

		expect(result).toMatchObject({ status: 303, location: '/admin/inventory' });
		expect(await product('cigar-1')).toBeUndefined();
		expect(await db.select().from(cigarDetailsTable)).toHaveLength(0);
		expect(await db.select().from(wishlistTable)).toHaveLength(0);
		expect(await db.select().from(productReviewTable)).toHaveLength(0);
		expect(await filesIn('product-images')).toEqual([]);
		// The other products are untouched
		expect(await product('rum-1')).toBeDefined();
	});

	test('a product that was ordered cannot be deleted', async () => {
		await seedCustomer();
		const [order] = await db.insert(orderTable).values(baseOrder()).returning();
		await db.insert(orderItemTable).values({
			orderId: order.id,
			productId: 'cigar-1',
			quantity: 1,
			unitPrice: 40,
			subtotal: 40
		});

		const result = await productActions.delete!(event());

		expect(result).toHaveProperty('error');
		expect(await product('cigar-1')).toBeDefined();
	});

	test('an unknown product reports an error instead of redirecting', async () => {
		expect(await productActions.delete!(event({}, 'nope'))).toEqual({
			error: 'Produkt nicht gefunden.'
		});
	});

	test('beverage details go with the product too', async () => {
		await db.insert(beverageDetailsTable).values({
			productId: 'rum-1',
			volumeMl: 700,
			alcoholPercentage: 40,
			type: BeverageType.RUM,
			countryOfOrigin: 'Kuba'
		});

		await thrown(() => productActions.delete!(event({}, 'rum-1')));

		expect(await db.select().from(beverageDetailsTable)).toHaveLength(0);
	});
});

describe('admin content', () => {
	const hero = {
		hero_subtitle: 'Seit 2024',
		hero_tagline: 'Zigarren und mehr',
		hero_cta_text: 'Zum Shop',
		hero_cta_link: '/shop?type=cigar'
	};
	const social = {
		social_facebook: 'https://facebook.com/zigarrenpuro',
		social_instagram: 'https://instagram.com/zigarrenpuro'
	};
	const stored = async () =>
		Object.fromEntries((await db.select().from(siteContentTable)).map((r) => [r.key, r.value]));

	test('the page shows the defaults until something is saved', async () => {
		const { content, defaults } = (await loadContent({} as never)) as {
			content: Record<string, string>;
			defaults: Record<string, string>;
		};

		expect(content).toEqual(contentDefaults);
		expect(defaults).toEqual(contentDefaults);
	});

	test('saving the hero texts replaces the defaults and can be saved again', async () => {
		expect(await contentActions.updateHero!(event(hero))).toEqual({ heroSuccess: true });
		await contentActions.updateHero!(event({ ...hero, hero_cta_text: 'Jetzt kaufen' }));

		const content = await getSiteContent();
		expect(content.hero_subtitle).toBe('Seit 2024');
		expect(content.hero_cta_text).toBe('Jetzt kaufen');
		expect(Object.keys(await stored())).toHaveLength(4);
	});

	test('an incomplete or oversized form saves nothing', async () => {
		const missing = await contentActions.updateHero!(event({ ...hero, hero_tagline: ' ' }));
		const long = await contentActions.updateHero!(
			event({ ...hero, hero_tagline: 'x'.repeat(301) })
		);

		expect(missing).toEqual({ error: 'Alle Felder sind erforderlich' });
		expect(long).toHaveProperty('error');
		expect(await stored()).toEqual({});
	});

	test('a call to action link must stay on the site or be an http(s) address', async () => {
		for (const link of ['javascript:alert(1)', '//evil.example', 'data:text/html,x', 'shop']) {
			const result = await contentActions.updateHero!(event({ ...hero, hero_cta_link: link }));
			expect(result).toHaveProperty('error');
		}
		expect(await stored()).toEqual({});

		const external = await contentActions.updateHero!(
			event({ ...hero, hero_cta_link: 'https://example.com/aktion' })
		);
		expect(external).toEqual({ heroSuccess: true });
	});

	test('social links must be full http(s) addresses', async () => {
		expect(await contentActions.updateSocial!(event(social))).toEqual({ socialSuccess: true });
		expect((await getSiteContent()).social_instagram).toBe(social.social_instagram);

		for (const link of ['javascript:alert(1)', '/intern', 'instagram.com/x']) {
			const result = await contentActions.updateSocial!(
				event({ ...social, social_facebook: link })
			);
			expect(result).toHaveProperty('error');
		}
		const missing = await contentActions.updateSocial!(event({ ...social, social_facebook: '' }));
		expect(missing).toEqual({ error: 'Alle Felder sind erforderlich' });
		expect((await getSiteContent()).social_facebook).toBe(social.social_facebook);
	});

	test('isSafeLink', () => {
		expect(isSafeLink('/shop')).toBe(true);
		expect(isSafeLink('https://example.com')).toBe(true);
		expect(isSafeLink('http://example.com')).toBe(true);
		expect(isSafeLink('//example.com')).toBe(false);
		expect(isSafeLink('/\\example.com')).toBe(false);
		expect(isSafeLink('javascript:alert(1)')).toBe(false);
		expect(isSafeLink('ftp://example.com')).toBe(false);
		expect(isSafeLink('')).toBe(false);
	});

	test('a new hero image gets a new URL and the old file goes', async () => {
		expect(await contentActions.uploadHeroImage!(event({ hero_image: png(1) }))).toEqual({
			imageSuccess: true
		});
		const first = (await getSiteContent()).hero_bg_image;
		expect(first).toMatch(/^\/content-images\/hero-bg-[0-9a-f]{12}\.png$/);

		await contentActions.uploadHeroImage!(event({ hero_image: png(2) }));
		const second = (await getSiteContent()).hero_bg_image;

		expect(second).not.toBe(first);
		expect(await filesIn('content-images')).toEqual([fileOf(second)]);
	});

	test('a bad hero image keeps the current one', async () => {
		const result = await contentActions.uploadHeroImage!(
			event({ hero_image: new File(['text'], 'a.png', { type: 'image/png' }) })
		);

		expect(result).toEqual({ error: 'Nur JPG, PNG und WebP sind erlaubt.' });
		expect((await getSiteContent()).hero_bg_image).toBe(contentDefaults.hero_bg_image);
	});
});
