import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { projectSchema } from '$lib/forms/admin';
import { orNull, replaceImage, slugTaken } from '$lib/server/admin';
import { writeChildren } from '$lib/server/project-write';
import { renderRichText } from '$lib/server/richtext';
import { localizeHref } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(projectSchema()), {
		defaults: {
			status: 'draft',
			// See the note in the article form: an undefined `featured` breaks
			// `bind:checked` outright.
			featured: false,
			sortOrder: 0,
			// One blank row each, so the repeaters open with somewhere to type.
			services: [{ label: '', labelAm: '' }],
			outcomes: [{ value: '', label: '', labelAm: '' }]
		} as never
	})
});

export const actions: Actions = {
	// Named `save` to match the edit page, so `PostForm`/`ProjectForm` can post
	// to `?/save` wherever they are used. See the note on the edit action.
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(projectSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		if (await slugTaken(projects, form.data.slug)) {
			return setError(form, 'slug', 'Another project already uses this slug.');
		}

		const coverImage = await replaceImage(form.data.coverImage, null);
		const clientLogo = await replaceImage(form.data.clientLogo, null);

		const [result] = await db.insert(projects).values({
			slug: form.data.slug,
			status: form.data.status,
			featured: form.data.featured,
			sortOrder: form.data.sortOrder,
			publishedAt: form.data.publishedAt ?? (form.data.status === 'published' ? new Date() : null),
			name: form.data.name,
			nameAm: orNull(form.data.nameAm),
			client: orNull(form.data.client),
			clientAm: orNull(form.data.clientAm),
			industry: orNull(form.data.industry),
			industryAm: orNull(form.data.industryAm),
			year: orNull(form.data.year),
			summary: orNull(form.data.summary),
			summaryAm: orNull(form.data.summaryAm),
			body: orNull(renderRichText(form.data.body)),
			bodyAm: orNull(renderRichText(form.data.bodyAm)),
			websiteUrl: orNull(form.data.websiteUrl),
			coverImage,
			coverImageAlt: orNull(form.data.coverImageAlt),
			coverImageAltAm: orNull(form.data.coverImageAltAm),
			clientLogo
		});

		const id = Number(result.insertId);
		await writeChildren(id, form.data);

		redirect(303, localizeHref(`/dashboard/projects/${id}`));
	}
};
