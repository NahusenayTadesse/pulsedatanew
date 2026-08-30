import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	// Drafts included, and newest first — this is the editing list, not the
	// public index, so an unpublished piece must be the easiest thing to find.
	posts: await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			titleAm: posts.titleAm,
			category: posts.category,
			status: posts.status,
			featured: posts.featured,
			publishedAt: posts.publishedAt,
			updatedAt: posts.updatedAt
		})
		.from(posts)
		.orderBy(desc(posts.updatedAt))
});
