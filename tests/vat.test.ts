import { describe, expect, test } from 'bun:test';
import { calculateTax, roundCents, vatIncluded } from '#lib/vat.js';

describe('vatIncluded', () => {
	test('extracts the VAT from a gross amount', () => {
		expect(vatIncluded(119, 0.19)).toBe(19);
		expect(vatIncluded(100, 0.19)).toBe(15.97);
		expect(vatIncluded(0, 0.19)).toBe(0);
	});

	test('a rate of zero has no VAT', () => {
		expect(vatIncluded(50, 0)).toBe(0);
	});
});

describe('roundCents', () => {
	test('rounds half cents up and does not drift', () => {
		expect(roundCents(1.005)).toBe(1.01);
		expect(roundCents(0.1 + 0.2)).toBe(0.3);
	});
});

describe('calculateTax', () => {
	test('one rate: goods plus shipping', () => {
		const tax = calculateTax([{ gross: 119, rate: 0.19 }], 5.99, 0.19);
		expect(tax.groups).toHaveLength(1);
		expect(tax.groups[0].gross).toBe(124.99);
		expect(tax.total).toBe(vatIncluded(124.99, 0.19));
		expect(tax.groups[0].net + tax.groups[0].vat).toBeCloseTo(124.99, 2);
	});

	test('lines with the same rate are grouped', () => {
		const tax = calculateTax(
			[
				{ gross: 40, rate: 0.19 },
				{ gross: 80, rate: 0.19 }
			],
			0,
			0.19
		);
		expect(tax.groups).toHaveLength(1);
		expect(tax.groups[0].gross).toBe(120);
	});

	test('shipping is split across rates in proportion to the goods', () => {
		const tax = calculateTax(
			[
				{ gross: 75, rate: 0.19 },
				{ gross: 25, rate: 0.07 }
			],
			10,
			0.19
		);
		expect(tax.groups.map((g) => g.rate)).toEqual([0.07, 0.19]);
		expect(tax.groups.find((g) => g.rate === 0.19)!.gross).toBe(82.5);
		expect(tax.groups.find((g) => g.rate === 0.07)!.gross).toBe(27.5);
		expect(tax.total).toBe(roundCents(vatIncluded(82.5, 0.19) + vatIncluded(27.5, 0.07)));
	});

	test('shipping on an empty basket uses the fallback rate', () => {
		const tax = calculateTax([], 5.99, 0.19);
		expect(tax.groups).toHaveLength(1);
		expect(tax.groups[0].rate).toBe(0.19);
		expect(tax.total).toBe(vatIncluded(5.99, 0.19));
	});

	test('net plus VAT equals gross for every group', () => {
		const tax = calculateTax(
			[
				{ gross: 33.33, rate: 0.19 },
				{ gross: 12.34, rate: 0.07 }
			],
			5.99,
			0.19
		);
		for (const g of tax.groups) expect(roundCents(g.net + g.vat)).toBe(g.gross);
	});
});
