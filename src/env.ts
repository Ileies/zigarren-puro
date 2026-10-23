import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ADMIN_PASSWORD: { schema: (input) => input ?? '' },
	PUBLIC_ORIGIN: { public: true, static: true },
	PUBLIC_APP_NAME: { public: true, static: true },
	STRIPE_SECRET_KEY: { static: true },
	PUBLIC_STRIPE_PUBLISHABLE_KEY: { public: true, static: true },
	STRIPE_WEBHOOK_SECRET: { static: true },
	SMTP_HOST: { static: true },
	SMTP_USER: { static: true },
	SMTP_PASSWORD: { static: true }
});
