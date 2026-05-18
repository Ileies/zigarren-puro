import { deLocalizeUrl } from '$lib/messages';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;
