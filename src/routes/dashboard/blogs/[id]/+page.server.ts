import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { postSchema } from '$lib/forms/admin';
import { orNull, replaceImage, slugTaken } from '$lib/server/admin';
import { readingMinutes, renderRichText } from '$lib/server/richtext';
import { deleteUploadedFile } from '$lib/server/upload';
import { toDateInput } from '$lib/components/admin/format';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

async function readPost(id: number) {
	const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	return row ?? null;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const post = await readPost(id);
	if (!post) error(404);

	/*
	 * The stored image is a filename; the schema's field is a `File`.
	 *
	 * Spreading the row straight into `superValidate` fed a string (or null) to
	 * `z.instanceof(File)`, so every edit page opened with an "Invalid input"
	 * error against a field the user had not touched. The filename is passed to
	 * the form component separately, as `coverImage`, purely to render a preview.
	 */
	const { coverImage: _coverImage, ...rest } = post;

	const form = await superValidate(
		{
			...rest,
			// Coerced, because the driver can hand back 0/1 for a MySQL boolean and
			// `bind:checked` needs an actual boolean.
			featured: Boolean(post.featured),
			titleAm: post.titleAm ?? '',
			excerpt: post.excerpt ?? '',
			excerptAm: post.excerptAm ?? '',
			bodyAm: post.bodyAm ?? '',
			category: post.category ?? '',
			categoryAm: post.categoryAm ?? '',
			author: post.author ?? '',
			authorAm: post.authorAm ?? '',
			coverImageAlt: post.coverImageAlt ?? '',
			coverImageAltAm: post.coverImageAltAm ?? '',
			readingMinutes: post.readingMinutes ?? '',
			// The date input wants `YYYY-MM-DD` in local time, not an ISO string.
			publishedAt: toDateInput(post.publishedAt)
		} as never,
		zod4(postSchema())
	);

	return { form, coverImage: post.coverImage, title: post.title, slug: post.slug };
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
		const existing = await readPost(id);
		if (!existing) error(404);

		const form = await superValidate(request, zod4(postSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		if (await slugTaken(posts, form.data.slug, id)) {
			return setError(form, 'slug', 'Another article already uses this slug.');
		}

		const coverImage = await replaceImage(form.data.coverImage, existing.coverImage);
		const body = renderRichText(form.data.body);
		const bodyAm = renderRichText(form.data.bodyAm);

		await db
			.update(posts)
			.set({
				slug: form.data.slug,
				status: form.data.status,
				featured: form.data.featured,
				/*
				 * Publishing something that has never had a date stamps it now.
				 * An article that already has one keeps it: re-editing a piece from
				 * last March must not move it to the top of the index as if it were
				 * new.
				 */
				publishedAt:
					form.data.publishedAt ??
					(form.data.status === 'published' ? (existing.publishedAt ?? new Date()) : null),
				title: form.data.title,
				titleAm: orNull(form.data.titleAm),
				excerpt: orNull(form.data.excerpt),
				excerptAm: orNull(form.data.excerptAm),
				body,
				bodyAm: orNull(bodyAm),
				category: orNull(form.data.category),
				categoryAm: orNull(form.data.categoryAm),
				author: orNull(form.data.author),
				authorAm: orNull(form.data.authorAm),
				coverImage,
				coverImageAlt: orNull(form.data.coverImageAlt),
				coverImageAltAm: orNull(form.data.coverImageAltAm),
				readingMinutes: form.data.readingMinutes
					? Number(form.data.readingMinutes)
					: readingMinutes(body)
			})
			.where(eq(posts.id, id));

		return withFiles({ form, message: m.dash_saved() });
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		const existing = await readPost(id);
		if (!existing) error(404);

		await db.delete(posts).where(eq(posts.id, id));

		// After the row, not before: an article that still exists but has lost its
		// cover image is a worse outcome than a file left on disk.
		if (existing.coverImage) await deleteUploadedFile(existing.coverImage).catch(() => {});

		redirect(303, localizeHref('/dashboard/blogs'));
	}
};
