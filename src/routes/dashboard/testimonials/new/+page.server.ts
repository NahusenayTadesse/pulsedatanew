import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { testimonials } from '$lib/server/db/schema';
import { testimonialSchema } from '$lib/forms/admin';
import { linkedProjectId, listProjectOptions, orNull, replaceImage } from '$lib/server/admin';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(testimonialSchema()), {
		// Spelled out for the same reason the team form's defaults are: a schema
		// `.default()` does not survive the adapter's JSON Schema as a real value.
		defaults: { status: 'draft', sortOrder: 0, projectId: '' } as never
	}),
	projects: await listProjectOptions()
});

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(testimonialSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		const projectId = await linkedProjectId(form.data.projectId);
		if (projectId === undefined) {
			return setError(form, 'projectId', m.dash_project_gone());
		}

		const [logo, photo] = await Promise.all([
			replaceImage(form.data.logo, null),
			replaceImage(form.data.photo, null)
		]);

		const [result] = await db.insert(testimonials).values({
			quote: form.data.quote,
			quoteAm: orNull(form.data.quoteAm),
			authorName: form.data.authorName,
			authorNameAm: orNull(form.data.authorNameAm),
			authorRole: orNull(form.data.authorRole),
			authorRoleAm: orNull(form.data.authorRoleAm),
			company: orNull(form.data.company),
			companyAm: orNull(form.data.companyAm),
			logo,
			logoAlt: orNull(form.data.logoAlt),
			logoAltAm: orNull(form.data.logoAltAm),
			photo,
			photoAlt: orNull(form.data.photoAlt),
			photoAltAm: orNull(form.data.photoAltAm),
			projectId,
			status: form.data.status,
			sortOrder: form.data.sortOrder
		});

		redirect(303, localizeHref(`/dashboard/testimonials/${result.insertId}`));
	}
};
