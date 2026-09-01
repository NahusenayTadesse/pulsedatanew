import { fail, redirect } from '@sveltejs/kit';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { teamMembers } from '$lib/server/db/schema';
import { teamSchema } from '$lib/forms/admin';
import { orNull, replaceImage } from '$lib/server/admin';
import { writeMemberLinks } from '$lib/server/team-write';
import { localizeHref } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(teamSchema()), {
		// Spelled out for the same reason the article form's defaults are: a
		// schema `.default()` does not survive the adapter's JSON Schema as a
		// real value, and the publish switch cannot bind to `undefined`.
		defaults: { status: 'draft', sortOrder: 0, links: [] } as never
	})
});

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(teamSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		const photo = await replaceImage(form.data.photo, null);

		const [result] = await db.insert(teamMembers).values({
			name: form.data.name,
			nameAm: orNull(form.data.nameAm),
			role: orNull(form.data.role),
			roleAm: orNull(form.data.roleAm),
			bio: orNull(form.data.bio),
			bioAm: orNull(form.data.bioAm),
			photo,
			photoAlt: orNull(form.data.photoAlt),
			photoAltAm: orNull(form.data.photoAltAm),
			status: form.data.status,
			sortOrder: form.data.sortOrder
		});

		await writeMemberLinks(Number(result.insertId), form.data.links);

		redirect(303, localizeHref(`/dashboard/team/${result.insertId}`));
	}
};
