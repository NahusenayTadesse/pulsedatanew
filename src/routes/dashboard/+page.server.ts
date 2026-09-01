import { count, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactSubmissions, posts, projects } from '$lib/server/db/schema';
import { dailyViews, trafficSummary } from '$lib/server/traffic';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	/*
	 * Every read the overview needs, issued together rather than awaited one at
	 * a time — otherwise the page takes eight round trips to render eight
	 * numbers, and the traffic aggregates are the slowest of them.
	 */
	const [publishedProjects, publishedPosts, newEnquiries, drafts, recent, traffic, series] =
		await Promise.all([
			db.select({ n: count() }).from(projects).where(eq(projects.status, 'published')),
			db.select({ n: count() }).from(posts).where(eq(posts.status, 'published')),
			db
				.select({ n: count() })
				.from(contactSubmissions)
				.where(eq(contactSubmissions.status, 'new')),
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
				.limit(5),
			trafficSummary(),
			dailyViews(14)
		]);

	return {
		stats: {
			projects: Number(publishedProjects[0].n),
			posts: Number(publishedPosts[0].n),
			enquiries: Number(newEnquiries[0].n),
			drafts: Number(drafts[0].n)
		},
		recent,
		traffic,
		series,
		/*
		 * Uptime is read off this process, not stored.
		 *
		 * It answers "has the site restarted recently?", which is the question
		 * worth asking from inside — and a number that resets on every deploy is
		 * the honest form of that answer. Real uptime over weeks is something only
		 * an outside observer can measure, which is what `/health` is for.
		 */
		startedAt: Date.now() - Math.round(process.uptime() * 1000)
	};
};
