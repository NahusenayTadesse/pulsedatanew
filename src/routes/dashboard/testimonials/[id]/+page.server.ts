import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { testimonials } from '$lib/server/db/schema';
import { testimonialSchema } from '$lib/forms/admin';
import { linkedProjectId, listProjectOptions, orNull, replaceImage } from '$lib/server/admin';
import { deleteUploadedFile } from '$lib/server/upload';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

async function readTestimonial(id: number) {
	const [row] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
	return row ?? null;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const quote = await readTestimonial(id);
	if (!quote) error(404);

	// The stored logo is a filename and the schema's field is a `File`; feeding
	// the string to `z.instanceof(File)` opens the page with an error against a
	// field nobody touched. It is passed separately, for the preview.
	const { logo: _logo, ...rest } = quote;

	const form = await superValidate(
		{
			...rest,
			quoteAm: quote.quoteAm ?? '',
			authorNameAm: quote.authorNameAm ?? '',
			authorRole: quote.authorRole ?? '',
			authorRoleAm: quote.authorRoleAm ?? '',
			company: quote.company ?? '',
			companyAm: quote.companyAm ?? '',
			logoAlt: quote.logoAlt ?? '',
			logoAltAm: quote.logoAltAm ?? '',
			// The select's values are strings; a number here matches no option and
			// the field would open showing the placeholder over a real link.
			projectId: quote.projectId ? String(quote.projectId) : ''
		} as never,
		zod4(testimonialSchema())
	);

	return {
		form,
		logo: quote.logo,
		authorName: quote.authorName,
		projects: await listProjectOptions()
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const id = Number(params.id);
		const existing = await readTestimonial(id);
		if (!existing) error(404);

		const form = await superValidate(request, zod4(testimonialSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		const projectId = await linkedProjectId(form.data.projectId);
		if (projectId === undefined) {
			return setError(form, 'projectId', m.dash_project_gone());
		}

		const logo = await replaceImage(form.data.logo, existing.logo);

		await db
			.update(testimonials)
			.set({
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
				projectId,
				status: form.data.status,
				sortOrder: form.data.sortOrder
			})
			.where(eq(testimonials.id, id));

		return withFiles({ form, message: m.dash_saved() });
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const existing = await readTestimonial(id);
		if (!existing) error(404);

		await db.delete(testimonials).where(eq(testimonials.id, id));

		// After the row, never before, as everywhere else here: a quote that still
		// exists but has lost its logo is worse than one orphaned file.
		if (existing.logo) await deleteUploadedFile(existing.logo).catch(() => {});

		redirect(303, localizeHref('/dashboard/testimonials'));
	}
};
