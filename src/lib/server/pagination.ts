export const ADMIN_PAGE_SIZE = 25;

export type PageInfo = {
	page: number;
	pageSize: number;
	total: number;
	pages: number;
	/** Row offset of the first item on this page. */
	offset: number;
};

/** The `page` query parameter as a positive whole number, 1 when missing or malformed. */
export function parsePage(url: URL): number {
	const page = Number(url.searchParams.get('page'));
	return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Page numbers for a list of `total` rows. A page beyond the last one is moved to the last. */
export function pageInfo(requested: number, total: number, pageSize = ADMIN_PAGE_SIZE): PageInfo {
	const pages = Math.max(1, Math.ceil(total / pageSize));
	const page = Math.min(requested, pages);
	return { page, pageSize, total, pages, offset: (page - 1) * pageSize };
}
