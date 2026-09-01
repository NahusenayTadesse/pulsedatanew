import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

/**
 * The Better Auth configuration, in one place both callers can reach.
 *
 * `auth.ts` cannot be imported by a plain Node script — it reads
 * `$env/dynamic/private` and registers a SvelteKit cookie plugin, neither of
 * which resolves outside Vite. So the options live here, free of both, and the
 * two callers supply what differs: the app passes its environment and the
 * SvelteKit plugin, and `scripts/create-admin.ts` passes `process.env` and
 * permission to create the account.
 *
 * The alternative was for the script to hold its own copy of the config, which
 * is how the two drift until the day the script writes a password the app
 * cannot verify.
 */
export function baseAuthOptions(options: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	db: any;
	secret: string | undefined;
	baseURL: string | undefined;
	/**
	 * Whether `POST /api/auth/sign-up/email` works.
	 *
	 * **False everywhere except the admin script.** Better Auth mounts that
	 * endpoint publicly whenever email-and-password is enabled, so leaving it on
	 * means anyone who finds the URL can create an account — and every account
	 * on this site can publish to the company's public pages and read the
	 * enquiry inbox. There is no self-service sign-up on a three-person staff
	 * dashboard; accounts are made on the server by someone who already has
	 * shell access.
	 */
	allowSignUp: boolean;
}) {
	return {
		baseURL: options.baseURL,
		secret: options.secret,
		database: drizzleAdapter(options.db, { provider: 'mysql' }),
		emailAndPassword: {
			enabled: true,
			disableSignUp: !options.allowSignUp
		},
		/*
		 * Rate limiting for Better Auth's own HTTP endpoints.
		 *
		 * The login *form* is throttled separately in `$lib/server/throttle`,
		 * because a SvelteKit action calls `auth.api.signInEmail()` as a function
		 * and never passes through this handler. This covers the other door:
		 * `POST /api/auth/sign-in/email` is mounted and reachable directly, so
		 * without it an attacker simply skips the form and the throttle with it.
		 *
		 * `enabled` is set explicitly because Better Auth turns rate limiting off
		 * outside production — which would mean the protection was never
		 * exercised until the day it mattered.
		 */
		rateLimit: {
			enabled: true,
			storage: 'database',
			window: 60,
			max: 30,
			customRules: {
				// Matches the form throttle: five tries, then a quarter of an hour.
				'/sign-in/email': { window: 900, max: 5 },
				'/sign-up/email': { window: 900, max: 3 }
			}
		}
	} satisfies Parameters<typeof betterAuth>[0];
}
