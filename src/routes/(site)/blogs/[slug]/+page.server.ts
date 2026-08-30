import { error } from '@sveltejs/kit';
import { getPost, relatedPosts } from '$lib/server/content';
import { excerptFrom, readingMinutes, renderRichText } from '$lib/server/richtext';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);
	if (!post) error(404);

	const related = await relatedPosts(post);

	return {
		post,
		related,
		bodyHtml: renderRichText(post.body),
		bodyHtmlAm: renderRichText(post.bodyAm),
		/**
		 * Computed here when the column is empty, so a seeded post that nobody
		 * gave a reading time still shows one, and an author who wants to
		 * override the estimate still can.
		 */
		minutes: post.readingMinutes ?? readingMinutes(post.body),
		fallbackExcerpt: post.excerpt ?? excerptFrom(post.body)
	};
};
