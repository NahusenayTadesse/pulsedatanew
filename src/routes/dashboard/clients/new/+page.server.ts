import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { clients } from '$lib/server/db/schema';
import { clientSchema } from '$lib/forms/admin';
import { linkedProjectId, listProjectOptions, orNull, replaceImage } from '$lib/server/admin';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(clientSchema()), {
		// Spelled out for the same reason the other forms' defaults are: a schema
		// `.default()` does not survive the adapter's JSON Schema as a real value.
		defaults: { status: 'draft', sortOrder: 0, projectId: '' } as never
	}),
	projects: await listProjectOptions()
});

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(clientSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		const projectId = await linkedProjectId(form.data.projectId);
		if (projectId === undefined) {
			return setError(form, 'projectId', m.dash_project_gone());
		}

		/*
		 * The logo is checked here rather than in the schema.
		 *
		 * `clients.logo` is NOT NULL — a row exists to put a mark on the page — but
		 * the schema types the field as an optional `File` because an untouched
		 * file input on the *edit* form posts an empty one meaning "keep what is
		 * there". Requiring it in the schema would make every edit fail until the
		 * logo was re-uploaded. So creation enforces it, where "no file" really
		 * does mean there is no logo, and the message lands on the field.
		 */
		const logo = await replaceImage(form.data.logo, null);
		if (!logo) return setError(form, 'logo', m.dash_client_logo_required());

		const [result] = await db.insert(clients).values({
			name: form.data.name,
			nameAm: orNull(form.data.nameAm),
			logo,
			logoAlt: orNull(form.data.logoAlt),
			logoAltAm: orNull(form.data.logoAltAm),
			note: orNull(form.data.note),
			noteAm: orNull(form.data.noteAm),
			websiteUrl: orNull(form.data.websiteUrl),
			projectId,
			status: form.data.status,
			sortOrder: form.data.sortOrder
		});

		redirect(303, localizeHref(`/dashboard/clients/${result.insertId}`));
	}
};
