import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { projectOutcomes, projectServices, projects } from '$lib/server/db/schema';
import { projectSchema } from '$lib/forms/admin';
import { orNull, replaceImage, slugTaken } from '$lib/server/admin';
import { writeChildren } from '$lib/server/project-write';
import { renderRichText } from '$lib/server/richtext';
import { deleteUploadedFile } from '$lib/server/upload';
import { toDateInput } from '$lib/components/admin/format';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

async function readProject(id: number) {
	const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
	return row ?? null;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const project = await readProject(id);
	if (!project) error(404);

	const [services, outcomes] = await Promise.all([
		db
			.select({ label: projectServices.label, labelAm: projectServices.labelAm })
			.from(projectServices)
			.where(eq(projectServices.projectId, id))
			.orderBy(asc(projectServices.sortOrder)),
		db
			.select({
				value: projectOutcomes.value,
				label: projectOutcomes.label,
				labelAm: projectOutcomes.labelAm
			})
			.from(projectOutcomes)
			.where(eq(projectOutcomes.projectId, id))
			.orderBy(asc(projectOutcomes.sortOrder))
	]);

	// Same reason as the article edit page: these columns hold filenames, and the
	// schema's matching fields are `File` uploads.
	const { coverImage: _cover, clientLogo: _logo, ...rest } = project;

	const form = await superValidate(
		{
			...rest,
			// Coerced, because the driver can hand back 0/1 for a MySQL boolean and
			// `bind:checked` needs an actual boolean.
			featured: Boolean(project.featured),
			nameAm: project.nameAm ?? '',
			client: project.client ?? '',
			clientAm: project.clientAm ?? '',
			industry: project.industry ?? '',
			industryAm: project.industryAm ?? '',
			year: project.year ?? '',
			summary: project.summary ?? '',
			summaryAm: project.summaryAm ?? '',
			body: project.body ?? '',
			bodyAm: project.bodyAm ?? '',
			websiteUrl: project.websiteUrl ?? '',
			coverImageAlt: project.coverImageAlt ?? '',
			coverImageAltAm: project.coverImageAltAm ?? '',
			publishedAt: toDateInput(project.publishedAt),
			// Nulls flattened to empty strings: the repeater's inputs bind to these
			// directly, and `bind:value={null}` renders the string "null".
			services: services.length
				? services.map((s) => ({ label: s.label, labelAm: s.labelAm ?? '' }))
				: [{ label: '', labelAm: '' }],
			outcomes: outcomes.length
				? outcomes.map((o) => ({ value: o.value, label: o.label, labelAm: o.labelAm ?? '' }))
				: [{ value: '', label: '', labelAm: '' }]
		} as never,
		zod4(projectSchema())
	);

	return {
		form,
		coverImage: project.coverImage,
		clientLogo: project.clientLogo,
		name: project.name,
		slug: project.slug
	};
};

/**
 * Both actions are named.
 *
 * SvelteKit refuses a page that has a `default` action alongside named ones —
 * "When using named actions, the default action cannot be used" — so the save
 * cannot stay anonymous once delete exists. The create pages name theirs `save`
 * too, so the shared form component can always post to `?/save` rather than
 * having to know which page it is on.
 */
export const actions: Actions = {
	save: async ({ request, params }) => {
		const id = Number(params.id);
		const existing = await readProject(id);
		if (!existing) error(404);

		const form = await superValidate(request, zod4(projectSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		if (await slugTaken(projects, form.data.slug, id)) {
			return setError(form, 'slug', 'Another project already uses this slug.');
		}

		const coverImage = await replaceImage(form.data.coverImage, existing.coverImage);
		const clientLogo = await replaceImage(form.data.clientLogo, existing.clientLogo);

		await db
			.update(projects)
			.set({
				slug: form.data.slug,
				status: form.data.status,
				featured: form.data.featured,
				sortOrder: form.data.sortOrder,
				publishedAt:
					form.data.publishedAt ??
					(form.data.status === 'published' ? (existing.publishedAt ?? new Date()) : null),
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
			})
			.where(eq(projects.id, id));

		await writeChildren(id, form.data);

		return withFiles({ form, message: m.dash_saved() });
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const existing = await readProject(id);
		if (!existing) error(404);

		// The child rows go with it via `ON DELETE CASCADE`, declared on the
		// foreign keys in schema.ts — this is the one place that matters.
		await db.delete(projects).where(eq(projects.id, id));

		for (const file of [existing.coverImage, existing.clientLogo]) {
			if (file) await deleteUploadedFile(file).catch(() => {});
		}

		redirect(303, localizeHref('/dashboard/projects'));
	}
};
