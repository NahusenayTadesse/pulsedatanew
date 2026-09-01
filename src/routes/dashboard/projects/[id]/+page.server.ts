import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, sql } from 'drizzle-orm';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { projectImages, projectOutcomes, projectServices, projects } from '$lib/server/db/schema';
import { projectSchema } from '$lib/forms/admin';
import { orNull, replaceImage, slugTaken } from '$lib/server/admin';
import { writeChildren } from '$lib/server/project-write';
import { renderRichText } from '$lib/server/richtext';
import { deleteUploadedFile, saveUploadedFile, UploadError } from '$lib/server/upload';
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

	const [services, outcomes, images] = await Promise.all([
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
			.orderBy(asc(projectOutcomes.sortOrder)),
		db
			.select({
				id: projectImages.id,
				image: projectImages.image,
				alt: projectImages.alt,
				altAm: projectImages.altAm,
				caption: projectImages.caption,
				captionAm: projectImages.captionAm
			})
			.from(projectImages)
			.where(eq(projectImages.projectId, id))
			.orderBy(asc(projectImages.sortOrder))
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
		images,
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

	/*
	 * The gallery's three actions.
	 *
	 * Separate from `save`, and from each other, because an image row owns a
	 * file. The modules and outcomes lists are replaced wholesale on every save,
	 * which is cheap for text; doing that to images would delete and re-upload
	 * every file on every save of the project, and lose them all if the save
	 * failed halfway.
	 */
	addImage: async ({ request, params }) => {
		const projectId = Number(params.id);
		if (!(await readProject(projectId))) error(404);

		const data = await request.formData();
		const file = data.get('image');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { galleryError: m.dash_gallery_no_file() });
		}

		let stored: string;
		try {
			stored = await saveUploadedFile(file);
		} catch (err) {
			// `saveUploadedFile` already refuses the wrong type or an oversized
			// file with a message written for the person who chose it.
			return fail(400, {
				galleryError: err instanceof UploadError ? err.message : m.dash_gallery_upload_failed()
			});
		}

		// Appended to the end. Position is edited on the row afterwards, which
		// keeps "add" a single decision rather than two.
		const [last] = await db
			.select({ max: sql<number | null>`MAX(${projectImages.sortOrder})` })
			.from(projectImages)
			.where(eq(projectImages.projectId, projectId));

		await db.insert(projectImages).values({
			projectId,
			image: stored,
			alt: orNull(String(data.get('alt') ?? '')),
			altAm: orNull(String(data.get('altAm') ?? '')),
			caption: orNull(String(data.get('caption') ?? '')),
			captionAm: orNull(String(data.get('captionAm') ?? '')),
			sortOrder: (last?.max ?? -1) + 1
		});

		return { galleryMessage: m.dash_gallery_added() };
	},

	updateImage: async ({ request, params }) => {
		const projectId = Number(params.id);
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id)) return fail(400, { galleryError: m.dash_gallery_upload_failed() });

		const position = Number(data.get('sortOrder'));

		/*
		 * Scoped to this project as well as to the row id.
		 *
		 * The id arrives in a form field, so on its own it would let anyone signed
		 * in retitle an image belonging to a different case study by editing the
		 * hidden input. Every account here is trusted, but a query that only works
		 * when the caller behaves is a query written wrong.
		 */
		await db
			.update(projectImages)
			.set({
				alt: orNull(String(data.get('alt') ?? '')),
				altAm: orNull(String(data.get('altAm') ?? '')),
				caption: orNull(String(data.get('caption') ?? '')),
				captionAm: orNull(String(data.get('captionAm') ?? '')),
				sortOrder: Number.isFinite(position) ? position : 0
			})
			.where(and(eq(projectImages.id, id), eq(projectImages.projectId, projectId)));

		return { galleryMessage: m.dash_gallery_updated() };
	},

	deleteImage: async ({ request, params }) => {
		const projectId = Number(params.id);
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id)) return fail(400, { galleryError: m.dash_gallery_upload_failed() });

		const [row] = await db
			.select({ image: projectImages.image })
			.from(projectImages)
			.where(and(eq(projectImages.id, id), eq(projectImages.projectId, projectId)))
			.limit(1);

		if (!row) return fail(404, { galleryError: m.dash_gallery_upload_failed() });

		await db
			.delete(projectImages)
			.where(and(eq(projectImages.id, id), eq(projectImages.projectId, projectId)));

		// The row goes first. An orphaned file wastes a few kilobytes; a row
		// pointing at a file that no longer exists is a broken image on the site.
		await deleteUploadedFile(row.image).catch(() => {});

		return { galleryMessage: m.dash_gallery_removed() };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const existing = await readProject(id);
		if (!existing) error(404);

		/*
		 * The gallery filenames are read before the delete, not after.
		 *
		 * `ON DELETE CASCADE` on the foreign key takes the rows with the project,
		 * so once it has run there is nothing left to say which files belonged to
		 * it — and they would sit in `FILES_DIR` forever.
		 */
		const gallery = await db
			.select({ image: projectImages.image })
			.from(projectImages)
			.where(eq(projectImages.projectId, id));
		const galleryFiles = gallery.map((row) => row.image);

		await db.delete(projects).where(eq(projects.id, id));

		for (const file of [existing.coverImage, existing.clientLogo, ...galleryFiles]) {
			if (file) await deleteUploadedFile(file).catch(() => {});
		}

		redirect(303, localizeHref('/dashboard/projects'));
	}
};
