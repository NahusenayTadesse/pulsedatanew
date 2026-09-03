import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { clients } from '$lib/server/db/schema';
import { clientSchema } from '$lib/forms/admin';
import { linkedProjectId, listProjectOptions, orNull, replaceImage } from '$lib/server/admin';
import { deleteUploadedFile } from '$lib/server/upload';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

async function readClient(id: number) {
	const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
	return row ?? null;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const client = await readClient(id);
	if (!client) error(404);

	// The stored logo is a filename and the schema's field is a `File`; feeding
	// the string to `z.instanceof(File)` opens the page with an error against a
	// field nobody touched. It is passed separately, for the preview.
	const { logo: _logo, ...rest } = client;

	const form = await superValidate(
		{
			...rest,
			nameAm: client.nameAm ?? '',
			logoAlt: client.logoAlt ?? '',
			logoAltAm: client.logoAltAm ?? '',
			note: client.note ?? '',
			noteAm: client.noteAm ?? '',
			websiteUrl: client.websiteUrl ?? '',
			// The select's values are strings; a number here matches no option and
			// the field would open showing the placeholder over a real link.
			projectId: client.projectId ? String(client.projectId) : ''
		} as never,
		zod4(clientSchema())
	);

	return { form, logo: client.logo, name: client.name, projects: await listProjectOptions() };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const id = Number(params.id);
		const existing = await readClient(id);
		if (!existing) error(404);

		const form = await superValidate(request, zod4(clientSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		const projectId = await linkedProjectId(form.data.projectId);
		if (projectId === undefined) {
			return setError(form, 'projectId', m.dash_project_gone());
		}

		// No emptiness check here, unlike the create action: the row cannot exist
		// without a logo, so `replaceImage` returning the current one is always a
		// real filename. The `??` is for the type — `replaceImage` is written for
		// the nullable columns everywhere else — and falls back to what is already
		// stored, which is the only safe answer for a NOT NULL column.
		const logo = (await replaceImage(form.data.logo, existing.logo)) ?? existing.logo;

		await db
			.update(clients)
			.set({
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
			})
			.where(eq(clients.id, id));

		return withFiles({ form, message: m.dash_saved() });
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const existing = await readClient(id);
		if (!existing) error(404);

		await db.delete(clients).where(eq(clients.id, id));

		// After the row, never before, as everywhere else here.
		if (existing.logo) await deleteUploadedFile(existing.logo).catch(() => {});

		redirect(303, localizeHref('/dashboard/clients'));
	}
};
