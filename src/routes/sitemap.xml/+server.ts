import { desc, eq, isNull, lte, or, sql, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { posts, projects } from '$lib/server/db/schema';
import { absolute, LOCALES } from '$lib/seo';
import { localizeHref } from '$lib/paraglide/runtime';
import type { RequestHandler } from './$types';

/**
 * The sitemap, generated from the database.
 *
 * Not a static file: articles and case studies are published from the
 * dashboard, and a hand-maintained list is out of date the first time someone
 * uses it. Each entry declares both languages as `xhtml:link` alternates,
 * which is the form Google reads for a bilingual site — the same information
 * the pages carry in their `hreflang` tags, in the place a crawler looks first.
 */

/** The five pages that always exist, with a rough sense of their importance. */
const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
	{ path: '/', priority: '1.0', changefreq: 'monthly' },
	{ path: '/projects', priority: '0.9', changefreq: 'monthly' },
	{ path: '/about', priority: '0.8', changefreq: 'yearly' },
	{ path: '/blogs', priority: '0.8', changefreq: 'weekly' },
	{ path: '/contact', priority: '0.7', changefreq: 'yearly' }
];

function escapeXml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function entry(
	path: string,
	options: { lastmod?: Date | null; priority: string; changefreq: string }
) {
	const alternates = LOCALES.map(
		(locale) =>
			`    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(absolute(localizeHref(path, { locale })))}"/>`
	).join('\n');

	return `  <url>
    <loc>${escapeXml(absolute(path))}</loc>
${options.lastmod ? `    <lastmod>${options.lastmod.toISOString().slice(0, 10)}</lastmod>\n` : ''}    <changefreq>${options.changefreq}</changefreq>
    <priority>${options.priority}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absolute(path))}"/>
  </url>`;
}

/** Published, and not dated in the future — the same rule the pages apply. */
const isLive = (table: typeof posts | typeof projects) =>
	and(
		eq(table.status, 'published'),
		or(isNull(table.publishedAt), lte(table.publishedAt, sql`NOW()`))
	);

export const GET: RequestHandler = async ({ setHeaders }) => {
	const [livePosts, liveProjects] = await Promise.all([
		db
			.select({ slug: posts.slug, updatedAt: posts.updatedAt, publishedAt: posts.publishedAt })
			.from(posts)
			.where(isLive(posts))
			.orderBy(desc(posts.publishedAt)),
		db
			.select({
				slug: projects.slug,
				updatedAt: projects.updatedAt,
				publishedAt: projects.publishedAt
			})
			.from(projects)
			.where(isLive(projects))
			.orderBy(desc(projects.publishedAt))
	]);

	const urls = [
		...STATIC_PAGES.map((page) => entry(page.path, page)),
		...liveProjects.map((project) =>
			entry(`/projects/${project.slug}`, {
				lastmod: project.updatedAt ?? project.publishedAt,
				priority: '0.7',
				changefreq: 'yearly'
			})
		),
		...livePosts.map((post) =>
			entry(`/blogs/${post.slug}`, {
				lastmod: post.updatedAt ?? post.publishedAt,
				priority: '0.6',
				changefreq: 'yearly'
			})
		)
	];

	setHeaders({
		'content-type': 'application/xml',
		// An hour: long enough that crawlers are not regenerating this on every
		// visit, short enough that a newly published article appears the same day.
		'cache-control': 'public, max-age=3600'
	});

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
	);
};
