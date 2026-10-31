declare global {
	namespace App {
		interface Error {
			code?: string;
		}
		interface Locals {
			user: import('#lib/server/auth').SessionValidationResult['user'];
			session: import('#lib/server/auth').SessionValidationResult['session'];
			isDesktop: boolean;
			dbOffline: boolean;
		}
	}
}

export {};
