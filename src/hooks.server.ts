import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { deLocalizeUrl, getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

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

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth, handlePrivateRoutes);
