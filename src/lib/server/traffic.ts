import { createHash } from 'node:crypto';
import { and, count, desc, gte, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { pageViews } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';

/**
 * The site's own visitor counter.
 *
 * Built in rather than bought in, for one reason that decides the whole design:
 * a third-party analytics script is personal data leaving the country in a
 * request the visitor never agreed to, which in turn needs a consent banner,
 * which costs more visitors than the numbers are worth. Counting on the server
 * needs no script, no cookie and no banner.
 *
 * What is stored is deliberately thin — a path, a locale, a referring host and
 * a hash. There is no IP address in the table and no user agent, and the hash
 * is salted *and rotated daily*, so it can answer "how many people" today and
 * is worthless as a history of anybody tomorrow.
 */

/** Requests that are not a person reading a page. */
const BOT = /bot|crawler|spider|crawling|preview|monitor|curl|wget|headless|lighthouse|axios/i;

/**
 * Only real pages. An asset, an API call or a form POST is not a page view, and
 * counting them would make every number on the dashboard three times too big.
 */
const IGNORED = /^\/(files|api|health|sitemap\.xml|robots\.txt|favicon)/;

/**
 * The daily-rotating visitor hash.
 *
 * The salt is the auth secret, so the hash cannot be recomputed by anyone who
 * gets the table without also having the application's secret; the date makes
 * it useless for following one person across days. Truncated to 32 characters
 * because collisions between a few hundred visitors are not a concern and a
 * shorter column is a smaller thing to leak.
 */
function visitorHash(ip: string, userAgent: string): string {
	const day = new Date().toISOString().slice(0, 10);
	const salt = env.BETTER_AUTH_SECRET ?? 'pulsedata';
	return createHash('sha256')
		.update(`${salt}:${day}:${ip}:${userAgent}`)
		.digest('hex')
		.slice(0, 32);
}

/** The referring host only — never the full URL, which can carry a search query. */
function referrerHost(referrer: string | null, self: string): string | null {
	if (!referrer) return null;
	try {
		const host = new URL(referrer).hostname;
		return host && host !== self ? host.slice(0, 191) : null;
	} catch {
		return null;
	}
}

export function shouldCount(path: string, userAgent: string): boolean {
	return !IGNORED.test(path) && !BOT.test(userAgent);
}

/**
 * Records one view. Never throws.
 *
 * A counter that can take the page down with it is a bad trade, so a failed
 * insert is logged and swallowed — the visitor still gets their page.
 */
export async function recordView(input: {
	path: string;
	locale: string;
	ip: string;
	userAgent: string;
	referrer: string | null;
	host: string;
}) {
	try {
		await db.insert(pageViews).values({
			path: input.path.slice(0, 191),
			locale: input.locale.slice(0, 8),
			visitor: visitorHash(input.ip, input.userAgent),
			referrerHost: referrerHost(input.referrer, input.host)
		});
	} catch (error) {
		console.error('[traffic] could not record a view', error);
	}
}

const since = (days: number) => sql`DATE_SUB(NOW(), INTERVAL ${sql.raw(String(days))} DAY)`;

/**
 * The dashboard's numbers.
 *
 * Five small aggregates issued together. "Visitors" is a distinct count of the
 * daily hash, so a person who reads four pages today is one visitor — and one
 * who comes back tomorrow is counted again, which is the honest limit of a
 * measure that refuses to track anybody across days.
 */
export async function trafficSummary() {
	const [today, week, month, visitorsWeek, topPages, referrers] = await Promise.all([
		db
			.select({ n: count() })
			.from(pageViews)
			.where(gte(pageViews.createdAt, sql`CURDATE()`)),
		db
			.select({ n: count() })
			.from(pageViews)
			.where(gte(pageViews.createdAt, since(7))),
		db
			.select({ n: count() })
			.from(pageViews)
			.where(gte(pageViews.createdAt, since(30))),
		db
			.select({ n: sql<number>`COUNT(DISTINCT ${pageViews.visitor})` })
			.from(pageViews)
			.where(gte(pageViews.createdAt, since(7))),
		db
			.select({ path: pageViews.path, n: count() })
			.from(pageViews)
			.where(gte(pageViews.createdAt, since(30)))
			.groupBy(pageViews.path)
			.orderBy(desc(count()))
			.limit(6),
		db
			.select({ host: pageViews.referrerHost, n: count() })
			.from(pageViews)
			.where(and(gte(pageViews.createdAt, since(30)), sql`${pageViews.referrerHost} IS NOT NULL`))
			.groupBy(pageViews.referrerHost)
			.orderBy(desc(count()))
			.limit(5)
	]);

	return {
		today: Number(today[0].n),
		week: Number(week[0].n),
		month: Number(month[0].n),
		visitorsWeek: Number(visitorsWeek[0].n),
		topPages: topPages.map((row) => ({ path: row.path, views: Number(row.n) })),
		referrers: referrers.map((row) => ({ host: row.host ?? '', views: Number(row.n) }))
	};
}

/**
 * A daily series for the last `days` days, with the quiet days filled in.
 *
 * The gaps matter: a chart that plots only the days that had traffic draws a
 * flat line through a weekend nobody visited, which is the opposite of what
 * happened.
 */
export async function dailyViews(days = 14) {
	const rows = await db
		.select({
			day: sql<string>`DATE_FORMAT(${pageViews.createdAt}, '%Y-%m-%d')`,
			views: count(),
			visitors: sql<number>`COUNT(DISTINCT ${pageViews.visitor})`
		})
		.from(pageViews)
		.where(gte(pageViews.createdAt, since(days - 1)))
		.groupBy(sql`1`)
		.orderBy(sql`1`);

	const byDay = new Map(rows.map((row) => [row.day, row]));
	const series: { day: string; views: number; visitors: number }[] = [];

	for (let offset = days - 1; offset >= 0; offset--) {
		const date = new Date();
		date.setDate(date.getDate() - offset);
		const key = date.toISOString().slice(0, 10);
		const row = byDay.get(key);
		series.push({
			day: key,
			views: Number(row?.views ?? 0),
			visitors: Number(row?.visitors ?? 0)
		});
	}

	return series;
}
