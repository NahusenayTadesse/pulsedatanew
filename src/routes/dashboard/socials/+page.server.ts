import { fail } from '@sveltejs/kit';
import { asc } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { companyLinks } from '$lib/server/db/schema';
import { companyLinksSchema } from '$lib/forms/admin';
import { writeCompanyLinks } from '$lib/server/social-write';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

/**
 * The company's own social profiles.
 *
 * One row of settings rather than a list of records, so there is no index and
 * no `/new`: the page *is* the form, and saving replaces the whole list the
 * same way a member's links are replaced.
 */
export const load: PageServerLoad = async () => {
	const links = await db
		.select({ platform: companyLinks.platform, url: companyLinks.url })
		.from(companyLinks)
		.orderBy(asc(companyLinks.sortOrder), asc(companyLinks.id));

	// `links` is passed as data rather than left to the schema's `.default()`,
	// which does not survive the adapter's JSON Schema as a real value — the
	// repeater would have nothing to bind to.
	return { form: await superValidate({ links } as never, zod4(companyLinksSchema())) };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(companyLinksSchema()));
		if (!form.valid) return fail(400, { form });

		await writeCompanyLinks(form.data.links);

		return { form, message: m.dash_saved() };
	}
};
