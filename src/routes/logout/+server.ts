import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { localizeHref } from '$lib/paraglide/runtime';
import type { RequestHandler } from './$types';

/**
 * Signing out.
 *
 * POST only. A `GET /logout` can be triggered by anything that fetches a URL —
 * a prefetch, an image tag on another site, a link in an email preview — so a
 * signed-in colleague could be logged out by visiting an unrelated page.
 */
export const POST: RequestHandler = async (event) => {
	await auth.api.signOut({ headers: event.request.headers });
	redirect(303, localizeHref('/'));
};
