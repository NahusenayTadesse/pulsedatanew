import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { deLocalizeUrl, getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { recordView, shouldCount } from '$lib/server/traffic';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

/**
 * Keeps the private half of the site out of search indexes.
 *
 * A header rather than only a `<meta>` tag, because the meta tag is invisible
 * to a crawler fetching anything that is not HTML — the enquiry attachment
 * endpoint, for one — and because a header still applies to a response that
 * errored before the page rendered.
 */
const handlePrivateRoutes: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	const path = deLocalizeUrl(event.url).pathname;
	if (path.startsWith('/dashboard') || path.startsWith('/login')) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
};

/**
 * Counts a page view, on the way out.
 *
 * After `resolve`, so a request that 404s or redirects is not counted as a
 * reading of the page it never showed. Two shapes of request are a view:
 *
 * - a full HTML response, which is a first arrival or a reload;
 * - a `__data.json` fetch, which is how a client-side navigation asks for the
 *   next page. Without it every visit would count as exactly one page, because
 *   nothing after the first is a document request.
 *
 * A request carrying `x-sveltekit-invalidated` is neither: it is the client
 * re-fetching data it already has after a form action, and counting it would
 * add a view every time somebody submitted the contact form.
 *
 * The insert is deliberately not awaited. A counter must never be on the
 * critical path of serving the page, and `recordView` swallows its own errors.
 */
const handleTraffic: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (event.request.method !== 'GET' || response.status >= 400) return response;
	if (event.url.searchParams.has('x-sveltekit-invalidated')) return response;

	const isData = event.url.pathname.endsWith('/__data.json');
	const isPage = response.headers.get('content-type')?.includes('text/html');
	if (!isData && !isPage) return response;

	const url = deLocalizeUrl(event.url);
	const path = url.pathname.replace(/\/__data\.json$/, '') || '/';
	const userAgent = event.request.headers.get('user-agent') ?? '';

	if (path.startsWith('/dashboard') || path.startsWith('/login') || path.startsWith('/logout')) {
		return response;
	}
	if (!shouldCount(path, userAgent)) return response;

	void recordView({
		path,
		locale: event.url.pathname.startsWith('/am') ? 'am' : 'en',
		ip: event.getClientAddress(),
		userAgent,
		referrer: event.request.headers.get('referer'),
		host: event.url.hostname
	});

	return response;
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(
	handleParaglide,
	handleBetterAuth,
	handlePrivateRoutes,
	handleTraffic
);
