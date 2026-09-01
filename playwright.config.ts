import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		/*
		 * The real production server, not `vite preview`.
		 *
		 * They are not the same program. `vite preview` leaves dependencies
		 * external and lets Node resolve them from `node_modules`; the build
		 * inlines them into `build/server/chunks`, and a package that reaches for
		 * a file at runtime by relative path breaks there and only there. That is
		 * exactly how every article, case study and composer came to answer 500
		 * in production — `Cannot find module '../data/patch.json'`, from jsdom
		 * inside the old sanitiser — while the whole suite passed.
		 *
		 * `--env-file` rather than a shell `source`: values in `.env` contain
		 * characters a shell would try to interpret.
		 */
		command: 'npm run build && node --env-file=.env build',
		port: 4173,
		/*
		 * `ORIGIN` has to match the host the tests actually call.
		 *
		 * adapter-node rejects form POSTs whose origin disagrees with it, and
		 * Better Auth only answers `/api/auth/*` for its own base URL — so with
		 * the development value (`:5173`) every auth endpoint returns a 404 page
		 * under test. The self-registration guard then passed for the wrong
		 * reason: not because sign-up was disabled, but because the endpoint was
		 * never reached.
		 */
		env: {
			ORIGIN: 'http://localhost:4173',
			BETTER_AUTH_URL: 'http://localhost:4173',
			// adapter-node reads the port from the environment; `port` above only
			// tells Playwright what to wait for.
			PORT: '4173'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});
