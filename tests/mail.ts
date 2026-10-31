import { mock } from 'bun:test';

// The mail module needs the SvelteKit runtime, which `bun test` does not have. Routes that send
// mail are tested against this stand-in, which records what would have been sent. `mock.module`
// lasts for the whole test process, so every route test shares this one definition.

export const sent = {
	emailChange: [] as unknown[][],
	cancelled: [] as { notice: { id: string }; reason: string }[],
	paymentReceived: [] as { id: string }[]
};

/** When true, the order mails throw, like an unreachable SMTP server. */
export const mailBroken = { value: false };

export function resetMail() {
	sent.emailChange.length = 0;
	sent.cancelled.length = 0;
	sent.paymentReceived.length = 0;
	mailBroken.value = false;
}

mock.module('#lib/server/functions.js', () => ({
	sendEmailChangeConfirmation: async (...args: unknown[]) => {
		sent.emailChange.push(args);
	},
	sendOrderCancelledEmail: async (notice: { id: string }, reason = 'unpaid') => {
		if (mailBroken.value) throw new Error('SMTP down');
		sent.cancelled.push({ notice, reason });
	},
	sendPaymentReceivedEmail: async (notice: { id: string }) => {
		if (mailBroken.value) throw new Error('SMTP down');
		sent.paymentReceived.push(notice);
	}
}));
