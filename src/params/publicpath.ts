import type { ParamMatcher } from '@sveltejs/kit';

/**
 * Which unmatched URLs belong to the public site.
 *
 * Used by the catch-all in `(site)`, which exists so that a mistyped address
 * gets the marketing 404 — with the header, the footer and somewhere to go —
 * rather than the bare one. Without the catch-all an unknown URL matches no
 * route at all, so it never enters the `(site)` group and always fell through
 * to the root error page: the admin-styled one, offering a stranger a link to
 * a dashboard they cannot open.
 *
 * These prefixes are excluded so they keep falling through to that root page,
 * which is the right one for them:
 *
 * - `dashboard`, `login`, `logout` — the private half.
 * - `files`, `api` — endpoints, where an HTML error page is the wrong answer
 *   to a request that asked for a file or JSON.
 *
 * A final segment containing a dot is excluded too: that is a missing asset
 * (`/logo.png`, `/favicon.ico`), and answering a broken `<img>` with a styled
 * HTML page wastes a render and confuses caches.
 */
const PRIVATE_PREFIX = /^(dashboard|login|logout|files|api)(\/|$)/;

export const match: ParamMatcher = (param) => {
	if (PRIVATE_PREFIX.test(param)) return false;

	const lastSegment = param.split('/').pop() ?? '';
	return !lastSegment.includes('.');
};
