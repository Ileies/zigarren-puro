import { ProductType } from './types.js';

export const domain = 'zigarren-puro.de';
export const companyName = 'Zigarren Puro GmbH';

export const facebook = 'https://www.facebook.com/profile.php?id=100094063374349';
export const instagram = 'https://www.instagram.com/zigarrenpuro';

// Geschäftsadresse (Ladengeschäft für Kunden)
export const storeAddress = 'Weidengasse 25, 50668 Köln, Germany';
export const location = 'https://maps.app.goo.gl/qTr7MfQyNigAwBoZA';

// Rechtliche Anschrift (Impressum/Handelsregister)
export const legalAddress = 'Merkenicher Hauptstraße 90, 50769 Köln, Germany';

export const phone = '+49 221 98043296';
export const email = 'info@zigarren-puro.de';

// ─── Versand ──────────────────────────────────────────────────────────────────

// ─── Mehrwertsteuer ───────────────────────────────────────────────────────────

// Shop prices include VAT. 19 % is the regular rate for tobacco, spirits and accessories,
// but the rates are still to be confirmed with the tax adviser.
export const vatRates: Record<ProductType, number> = {
	[ProductType.CIGAR]: 0.19,
	[ProductType.CIGARILLO]: 0.19,
	[ProductType.BEVERAGE]: 0.19,
	[ProductType.TOOL]: 0.19
};
// Applies to shipping when an order has no goods value
export const defaultVatRate = 0.19;

export const freeShippingThreshold = 150; // EUR
export const shippingCosts = {
	standard: 5.99, // EUR
	express: 12.99 // EUR
};

// ─── Bankverbindung ───────────────────────────────────────────────────────────

export const bankAccount = {
	accountHolder: companyName,
	iban: 'DE00 0000 0000 0000 0000 00', // TODO: echte IBAN eintragen
	bic: 'XXXXXXXX', // TODO: echten BIC eintragen
	paymentDeadlineDays: 7
};

// Bank transfer is only offered once real account data replaces the placeholders above.
export const bankTransferAvailable = !/^DE00/.test(bankAccount.iban.replace(/\s/g, ''));
