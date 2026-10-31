// Prices in the shop are gross prices (VAT included). These helpers split a gross amount
// into net and VAT, per rate, and round to whole cents.

export type VatLine = { gross: number; rate: number };
export type VatGroup = { rate: number; gross: number; net: number; vat: number };
export type TaxBreakdown = { total: number; groups: VatGroup[] };

export function roundCents(n: number) {
	return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** The VAT contained in a gross amount. */
export function vatIncluded(gross: number, rate: number) {
	return roundCents(gross - gross / (1 + rate));
}

/**
 * VAT of an order, grouped by rate. Shipping is split across the rates in proportion to the
 * goods value, which is how a mixed basket is taxed. With one rate this is simply that rate.
 * `fallbackRate` applies to shipping when the basket has no value.
 */
export function calculateTax(
	lines: VatLine[],
	shippingGross: number,
	fallbackRate: number
): TaxBreakdown {
	const goodsByRate = new Map<number, number>();
	for (const line of lines) {
		goodsByRate.set(line.rate, (goodsByRate.get(line.rate) ?? 0) + line.gross);
	}
	const goodsTotal = [...goodsByRate.values()].reduce((sum, g) => sum + g, 0);
	if (goodsTotal <= 0) goodsByRate.set(fallbackRate, 0);

	const groups = [...goodsByRate.entries()]
		.sort(([a], [b]) => a - b)
		.map(([rate, goods]) => {
			const share = goodsTotal > 0 ? goods / goodsTotal : 1;
			const gross = roundCents(goods + shippingGross * share);
			const vat = vatIncluded(gross, rate);
			return { rate, gross, net: roundCents(gross - vat), vat };
		});

	return { total: roundCents(groups.reduce((sum, g) => sum + g.vat, 0)), groups };
}
