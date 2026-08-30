import { count, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactSubmissions, posts, projects } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	/*
	 * Five independent counts and one small list. Issued together rather than
	 * awaited one at a time — the overview would otherwise take six round trips
	 * to render six numbers.
	 */
	const [publishedProjects, publishedPosts, newEnquiries, drafts, recent] = await Promise.all([
		db.select({ n: count() }).from(projects).where(eq(projects.status, 'published')),
		db.select({ n: count() }).from(posts).where(eq(posts.status, 'published')),
		db.select({ n: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'new')),
		db
			.select({ n: count() })
			.from(posts)
			.where(eq(posts.status, 'draft'))
			.then(async (postDrafts) => {
				const projectDrafts = await db
					.select({ n: count() })
					.from(projects)
					.where(eq(projects.status, 'draft'));
				return [{ n: Number(postDrafts[0].n) + Number(projectDrafts[0].n) }];
			}),
		db
			.select({
				id: contactSubmissions.id,
				name: contactSubmissions.name,
				email: contactSubmissions.email,
				topic: contactSubmissions.topic,
				status: contactSubmissions.status,
				locale: contactSubmissions.locale,
				createdAt: contactSubmissions.createdAt
			})
			.from(contactSubmissions)
			.orderBy(desc(contactSubmissions.createdAt))
			.limit(5)
	]);

	return {
		stats: {
			projects: Number(publishedProjects[0].n),
			posts: Number(publishedPosts[0].n),
			enquiries: Number(newEnquiries[0].n),
			drafts: Number(drafts[0].n)
		},
		recent
	};
};
