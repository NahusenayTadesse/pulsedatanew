import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { postSchema } from '$lib/forms/admin';
import { orNull, replaceImage, slugTaken } from '$lib/server/admin';
import { readingMinutes, renderRichText } from '$lib/server/richtext';
import { localizeHref } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(postSchema()), {
		// A new article starts as a draft. Defaulting to published would make
		// "save to keep working on it later" put an unfinished piece on the site.
		/*
		 * Spelled out rather than left to the schema's `.default()`.
		 *
		 * Superforms builds its initial data from the JSON Schema the adapter
		 * derives, and a `z.coerce.boolean().default(false)` does not survive that
		 * as `false` — it arrives `undefined`, and `<Switch bind:checked={undefined}>`
		 * is a hard error in Svelte 5 because the child declares a fallback. The
		 * form crashed on load rather than rendering.
		 */
		defaults: { status: 'draft', featured: false } as never
	})
});

export const actions: Actions = {
	// Named `save` to match the edit page, so `PostForm`/`ProjectForm` can post
	// to `?/save` wherever they are used. See the note on the edit action.
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(postSchema()));
		if (!form.valid) return fail(400, withFiles({ form }));

		if (await slugTaken(posts, form.data.slug)) {
			return setError(form, 'slug', 'Another article already uses this slug.');
		}

		const coverImage = await replaceImage(form.data.coverImage, null);

		/*
		 * The body is sanitised on the way in as well as on the way out.
		 *
		 * Output sanitising is what actually protects readers, and it stays. This
		 * is here so the stored HTML matches what the site will render: without
		 * it a paste from Word writes a document full of `<span style>` that is
		 * silently dropped at render, and the author's next edit opens markup
		 * that no longer resembles the published page.
		 */
		const body = renderRichText(form.data.body);
		const bodyAm = renderRichText(form.data.bodyAm);

		const [result] = await db.insert(posts).values({
			slug: form.data.slug,
			status: form.data.status,
			featured: form.data.featured,
			publishedAt: form.data.publishedAt ?? (form.data.status === 'published' ? new Date() : null),
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
		});

		// MySQL gives back an insertId rather than the row; the edit screen is
		// keyed by id, so it is what the redirect needs.
		redirect(303, localizeHref(`/dashboard/blogs/${result.insertId}`));
	}
};
