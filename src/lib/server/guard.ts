import { redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * The dashboard's only access rule: you are signed in, or you are not here.
 *
 * There are no roles. Three people run this company and all three are
 * administrators of their own site; inventing a permission model for them
 * would be building for an organisation that does not exist. When there is a
 * fourth person who should see enquiries but not publish, this is the one
 * function that has to change.
 *
 * The redirect carries the path the visitor was trying to reach, so signing in
 * returns them to it rather than dropping them on the overview — which matters
 * most for the case that produces it: a bookmarked enquiry, opened on a phone,
 * on an expired session.
 */
export function requireUser(event: RequestEvent) {
	if (!event.locals.user) {
		const target = event.url.pathname + event.url.search;
		redirect(303, localizeHref(`/login?redirectTo=${encodeURIComponent(target)}`));
	}
	return event.locals.user;
}
