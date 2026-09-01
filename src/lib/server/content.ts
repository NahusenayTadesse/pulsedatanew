import { and, asc, desc, eq, inArray, lte, ne, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	posts,
	projects,
	projectImages,
	projectOutcomes,
	projectServices,
	teamMemberLinks,
	teamMembers
} from '$lib/server/db/schema';

/**
 * The reads behind the public pages.
 *
 * Everything here applies the same visibility rule — `status = 'published'` and
 * a `published_at` that has arrived — in one place, so a page cannot forget it
 * and leak a draft. `publishedAt` being allowed to sit in the future is what
 * makes a post schedulable rather than something to remember to click.
 */

const isLive = (table: typeof posts | typeof projects) =>
	and(
		eq(table.status, 'published'),
		or(sql`${table.publishedAt} IS NULL`, lte(table.publishedAt, sql`NOW()`))
	);

/** The columns a card needs — never the body, which can be tens of kilobytes. */
const postCard = {
	id: posts.id,
	slug: posts.slug,
	title: posts.title,
	titleAm: posts.titleAm,
	excerpt: posts.excerpt,
	excerptAm: posts.excerptAm,
	coverImage: posts.coverImage,
	coverImageAlt: posts.coverImageAlt,
	coverImageAltAm: posts.coverImageAltAm,
	category: posts.category,
	categoryAm: posts.categoryAm,
	author: posts.author,
	authorAm: posts.authorAm,
	readingMinutes: posts.readingMinutes,
	featured: posts.featured,
	publishedAt: posts.publishedAt
};

export async function listPosts(limit?: number) {
	const query = db
		.select(postCard)
		.from(posts)
		.where(isLive(posts))
		.orderBy(desc(posts.publishedAt), desc(posts.id));

	return limit ? query.limit(limit) : query;
}

export async function getPost(slug: string) {
	const [row] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, slug), isLive(posts)))
		.limit(1);
	return row ?? null;
}

/**
 * Other posts to read next: same category first, then anything recent.
 *
 * Two queries rather than one clever one — the fallback only runs when the
 * category did not fill the row, which for a young blog is most of the time.
 */
export async function relatedPosts(post: { id: number; category: string | null }, limit = 3) {
	const sameCategory = post.category
		? await db
				.select(postCard)
				.from(posts)
				.where(and(isLive(posts), ne(posts.id, post.id), eq(posts.category, post.category)))
				.orderBy(desc(posts.publishedAt))
				.limit(limit)
		: [];

	if (sameCategory.length >= limit) return sameCategory;

	const seen = new Set([post.id, ...sameCategory.map((row) => row.id)]);
	const recent = await db
		.select(postCard)
		.from(posts)
		.where(and(isLive(posts), ne(posts.id, post.id)))
		.orderBy(desc(posts.publishedAt))
		.limit(limit + seen.size);

	return [...sameCategory, ...recent.filter((row) => !seen.has(row.id))].slice(0, limit);
}

const projectCard = {
	id: projects.id,
	slug: projects.slug,
	name: projects.name,
	nameAm: projects.nameAm,
	client: projects.client,
	clientAm: projects.clientAm,
	summary: projects.summary,
	summaryAm: projects.summaryAm,
	industry: projects.industry,
	industryAm: projects.industryAm,
	year: projects.year,
	coverImage: projects.coverImage,
	coverImageAlt: projects.coverImageAlt,
	coverImageAltAm: projects.coverImageAltAm,
	clientLogo: projects.clientLogo,
	featured: projects.featured
};

export async function listProjects(limit?: number) {
	const query = db
		.select(projectCard)
		.from(projects)
		.where(isLive(projects))
		.orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.year));

	return limit ? query.limit(limit) : query;
}

/**
 * A case study with everything its page renders.
 *
 * The three child lists are fetched together rather than sequentially: they do
 * not depend on each other, and a case-study page waiting out four round trips
 * in a row is four times slower than it needs to be.
 */
export async function getProject(slug: string) {
	const [project] = await db
		.select()
		.from(projects)
		.where(and(eq(projects.slug, slug), isLive(projects)))
		.limit(1);

	if (!project) return null;

	const [services, outcomes, images] = await Promise.all([
		db
			.select()
			.from(projectServices)
			.where(eq(projectServices.projectId, project.id))
			.orderBy(asc(projectServices.sortOrder)),
		db
			.select()
			.from(projectOutcomes)
			.where(eq(projectOutcomes.projectId, project.id))
			.orderBy(asc(projectOutcomes.sortOrder)),
		db
			.select()
			.from(projectImages)
			.where(eq(projectImages.projectId, project.id))
			.orderBy(asc(projectImages.sortOrder))
	]);

	return { ...project, services, outcomes, images };
}

export async function otherProjects(currentId: number, limit = 2) {
	return db
		.select(projectCard)
		.from(projects)
		.where(and(isLive(projects), ne(projects.id, currentId)))
		.orderBy(asc(projects.sortOrder))
		.limit(limit);
}

/**
 * The published team, each person with their social links attached.
 *
 * Two queries and a group, rather than a join: a join repeats every bio once
 * per link and then has to be un-repeated in JavaScript anyway, and the whole
 * team is a handful of rows.
 *
 * A member with no `sortOrder` set falls back to their id, so the order is at
 * worst "who was added first" rather than arbitrary.
 */
export async function listTeam() {
	const members = await db
		.select({
			id: teamMembers.id,
			name: teamMembers.name,
			nameAm: teamMembers.nameAm,
			role: teamMembers.role,
			roleAm: teamMembers.roleAm,
			bio: teamMembers.bio,
			bioAm: teamMembers.bioAm,
			photo: teamMembers.photo,
			photoAlt: teamMembers.photoAlt,
			photoAltAm: teamMembers.photoAltAm
		})
		.from(teamMembers)
		.where(eq(teamMembers.status, 'published'))
		.orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id));

	if (!members.length) return [];

	const links = await db
		.select()
		.from(teamMemberLinks)
		.where(
			inArray(
				teamMemberLinks.memberId,
				members.map((member) => member.id)
			)
		)
		.orderBy(asc(teamMemberLinks.sortOrder), asc(teamMemberLinks.id));

	return members.map((member) => ({
		...member,
		links: links.filter((link) => link.memberId === member.id)
	}));
}

export type TeamCard = Awaited<ReturnType<typeof listTeam>>[number];

export type PostCard = Awaited<ReturnType<typeof listPosts>>[number];
export type ProjectCard = Awaited<ReturnType<typeof listProjects>>[number];
