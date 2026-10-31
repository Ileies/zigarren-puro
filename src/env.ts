import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ADMIN_PASSWORD: { schema: (input) => input ?? '' },
	PUBLIC_ORIGIN: { public: true, static: true },
	PUBLIC_APP_NAME: { public: true, static: true },
	SMTP_HOST: { static: true },
	SMTP_USER: { static: true },
	SMTP_PASSWORD: { static: true }
});
