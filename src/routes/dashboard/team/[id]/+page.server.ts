import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { teamMemberLinks, teamMembers } from '$lib/server/db/schema';
import { teamSchema } from '$lib/forms/admin';
import { orNull, replaceImage } from '$lib/server/admin';
import { writeMemberLinks } from '$lib/server/social-write';
import { deleteUploadedFile } from '$lib/server/upload';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

async function readMember(id: number) {
	const [row] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
	return row ?? null;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const member = await readMember(id);
	if (!member) error(404);

	const links = await db
		.select({ platform: teamMemberLinks.platform, url: teamMemberLinks.url })
		.from(teamMemberLinks)
		.where(eq(teamMemberLinks.memberId, id))
		.orderBy(asc(teamMemberLinks.sortOrder), asc(teamMemberLinks.id));

	// The stored photo is a filename and the schema's field is a `File`; feeding
	// the string to `z.instanceof(File)` opens the page with an error against a
	// field nobody touched. It is passed to the form separately, for the preview.
	const { photo: _photo, ...rest } = member;

	const form = await superValidate(
		{
			...rest,
			nameAm: member.nameAm ?? '',
			role: member.role ?? '',
			roleAm: member.roleAm ?? '',
			bio: member.bio ?? '',
			bioAm: member.bioAm ?? '',
			photoAlt: member.photoAlt ?? '',
			photoAltAm: member.photoAltAm ?? '',
			links
		} as never,
		zod4(teamSchema())
	);

	return { form, photo: member.photo, name: member.name };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const id = Number(params.id);
		const existing = await readMember(id);
		if (!existing) error(404);

		const form = await superValidate(request, zod4(teamSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		const photo = await replaceImage(form.data.photo, existing.photo);

		await db
			.update(teamMembers)
			.set({
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
			})
			.where(eq(teamMembers.id, id));

		await writeMemberLinks(id, form.data.links);

		return withFiles({ form, message: m.dash_saved() });
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const existing = await readMember(id);
		if (!existing) error(404);

		// The links go with the row, by the foreign key's cascade.
		await db.delete(teamMembers).where(eq(teamMembers.id, id));

		// After the row, never before: a profile that still exists but has lost
		// its portrait is a worse outcome than one orphaned file.
		if (existing.photo) await deleteUploadedFile(existing.photo).catch(() => {});

		redirect(303, localizeHref('/dashboard/team'));
	}
};
