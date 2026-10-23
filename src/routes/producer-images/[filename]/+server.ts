import type { RequestHandler } from './$types';
import { getUploadedImage } from '#lib/server/uploaded-image.js';

export const GET: RequestHandler = ({ params }) =>
	getUploadedImage('producer-images', params.filename);
