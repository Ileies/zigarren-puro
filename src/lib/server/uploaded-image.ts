import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const contentTypes: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

export async function getUploadedImage(folder: string, filename: string) {
	const contentType = contentTypes[filename.slice(filename.lastIndexOf('.')).toLowerCase()];
	if (!contentType || basename(filename) !== filename) {
		return new Response('Not found', { status: 404 });
	}

	try {
		const image = await readFile(join(process.cwd(), 'data', 'uploads', folder, filename));
		return new Response(image, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		return new Response('Not found', { status: 404 });
	}
}
