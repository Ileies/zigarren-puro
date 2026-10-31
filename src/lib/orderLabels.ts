// German labels of the order enums. The admin is German only, so the server uses them in messages too.

export const orderStatusLabels: Record<string, string> = {
	pending: 'Ausstehend',
	confirmed: 'Bestätigt',
	processing: 'In Bearbeitung',
	shipped: 'Versandt',
	delivered: 'Geliefert',
	cancelled: 'Storniert',
	refunded: 'Erstattet'
};

export const paymentStatusLabels: Record<string, string> = {
	pending: 'Ausstehend',
	authorized: 'Autorisiert',
	paid: 'Bezahlt',
	failed: 'Fehlgeschlagen',
	refunded: 'Erstattet'
};

export const shippingMethodLabels: Record<string, string> = {
	standard: 'Standard',
	express: 'Express',
	next_day: 'Nächster Tag',
	pickup: 'Abholung'
};

export const paymentMethodLabels: Record<string, string> = {
	credit_card: 'Kreditkarte',
	paypal: 'PayPal',
	bank_transfer: 'Überweisung',
	crypto: 'Krypto'
};
