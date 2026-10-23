import { deLocalizeUrl } from '#lib/messages.js';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;
