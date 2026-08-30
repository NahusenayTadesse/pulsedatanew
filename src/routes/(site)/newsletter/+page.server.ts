import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { newsletterSubscribers } from '$lib/server/db/schema';
import { newsletterSchema } from '$lib/forms/contact';
import { getLocale, localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

/**
 * The newsletter's action.
 *
 * The route exists mainly so the footer's field has somewhere real to post: it
 * lives in the layout, and a layout cannot own an action. With JavaScript the
 * form enhances and never leaves the page; without it, the browser lands here
 * and gets the confirmation `+page.svelte` renders.
 */

export const load: PageServerLoad = async () => {
	// Nobody navigates here on purpose.
	redirect(303, localizeHref('/'));
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(newsletterSchema()));

		// The honeypot. A bot that filled it gets the same success it would have
		// got anyway, and nothing is written — telling it that it was caught only
		// teaches whoever wrote it to stop filling the field in.
		if (form.data.website) {
			return { form, message: m.newsletter_success() };
		}

		if (!form.valid) return fail(400, { form });

		const email = form.data.email.toLowerCase();

		const [existing] = await db
			.select({
				id: newsletterSubscribers.id,
				unsubscribedAt: newsletterSubscribers.unsubscribedAt
			})
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.email, email))
			.limit(1);

		if (existing) {
			// Re-subscribing after an unsubscribe is a real thing people do, and it
			// should work rather than report a duplicate.
			if (existing.unsubscribedAt) {
				await db
					.update(newsletterSubscribers)
					.set({ unsubscribedAt: null, locale: getLocale() })
					.where(eq(newsletterSubscribers.id, existing.id));
				return { form, message: m.newsletter_success() };
			}
			return { form, message: m.newsletter_duplicate() };
		}

		await db.insert(newsletterSubscribers).values({ email, locale: getLocale() });

		return { form, message: m.newsletter_success() };
	}
};
