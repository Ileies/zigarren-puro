import { createHash } from 'node:crypto';
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

/** Folder for uploaded files. `UPLOADS_DIR` lets tests and deployments move it. */
export function uploadsDir(folder: string) {
	return join(process.env.UPLOADS_DIR ?? join(process.cwd(), 'data', 'uploads'), folder);
}

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCER_IMAGE_BYTES = 2 * 1024 * 1024;

type ImageKind = { extension: 'jpg' | 'png' | 'webp'; label: string };

/** Looks at the first bytes instead of trusting the type the browser reports. */
function sniffImage(bytes: Uint8Array): ImageKind | null {
	const startsWith = (signature: number[], offset = 0) =>
		signature.every((byte, i) => bytes[offset + i] === byte);

	if (startsWith([0xff, 0xd8, 0xff])) return { extension: 'jpg', label: 'JPG' };
	if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return { extension: 'png', label: 'PNG' };
	}
	// RIFF....WEBP
	if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
		return { extension: 'webp', label: 'WebP' };
	}
	return null;
}

type ReplaceImage = {
	/** Folder below the uploads directory, also the first part of the public URL. */
	folder: string;
	/** Base of the file name, for example a product id. */
	name: string;
	file: unknown;
	maxBytes: number;
	/** Stores the new URL. It runs after the file is written and before the old files go. */
	save: (url: string) => void | Promise<void>;
};

/**
 * Stores an uploaded image and drops the earlier ones for the same `name`.
 *
 * The file name carries a hash of the content. The images are served with a one year cache, so a
 * replacement under the old name would keep showing the old picture. If saving the URL fails the
 * new file is removed again and the old picture stays untouched.
 */
export async function replaceImage(
	options: ReplaceImage
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
	const { folder, name, file, maxBytes, save } = options;

	if (!(file instanceof File) || file.size === 0) {
		return { ok: false, error: 'Keine Datei ausgewählt.' };
	}
	if (file.size > maxBytes) {
		return { ok: false, error: `Datei zu groß (max. ${maxBytes / 1024 / 1024} MB).` };
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	const kind = sniffImage(bytes);
	if (!kind) return { ok: false, error: 'Nur JPG, PNG und WebP sind erlaubt.' };

	const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
	const filename = `${name}-${hash}.${kind.extension}`;
	const dir = uploadsDir(folder);
	const url = `/${folder}/${filename}`;

	await mkdir(dir, { recursive: true });
	await writeFile(join(dir, filename), bytes);

	try {
		await save(url);
	} catch (error) {
		await unlink(join(dir, filename)).catch(() => {});
		throw error;
	}

	await removeImageFiles(folder, name, filename);
	return { ok: true, url };
}

/** Deletes the files stored for `name` (also the older `<name>.<ext>` form), except `keep`. */
export async function removeImageFiles(folder: string, name: string, keep?: string) {
	const dir = uploadsDir(folder);
	let files: string[];
	try {
		files = await readdir(dir);
	} catch {
		return;
	}
	for (const file of files) {
		const belongsToName = file.startsWith(`${name}-`) || file.startsWith(`${name}.`);
		if (belongsToName && file !== keep) await unlink(join(dir, file)).catch(() => {});
	}
}

/** Deletes the file behind a stored image URL. A missing file is not an error. */
export async function removeImage(folder: string, imageUrl: string | null | undefined) {
	if (!imageUrl) return;
	const filename = basename(imageUrl);
	if (!filename) return;
	await unlink(join(uploadsDir(folder), filename)).catch(() => {});
}
