import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

/**
 * What an uptime monitor asks.
 *
 * Public and unauthenticated, because a monitor cannot sign in — so the body is
 * written to be worth nothing to anyone else: two booleans and a number. No
 * version, no hostname, no environment, no row counts. "Is it up" is the whole
 * question, and anything more here is reconnaissance offered for free.
 *
 * The database is actually queried rather than assumed. A process that is
 * running but cannot reach MySQL serves an error page to every visitor, and a
 * check that only proves Node is alive would call that healthy — which is
 * exactly the outage a monitor exists to catch.
 *
 * A failure answers 503, because that is the status a monitor understands.
 * `Cache-Control: no-store` keeps a proxy from serving yesterday's "ok".
 */
export const GET: RequestHandler = async () => {
	let database = false;

	try {
		await db.execute(sql`SELECT 1`);
		database = true;
	} catch (error) {
		console.error('[health] database unreachable', error);
	}

	return new Response(
		JSON.stringify({
			status: database ? 'ok' : 'degraded',
			database,
			/** Seconds since this process started. Restarts show up as a reset. */
			uptime: Math.round(process.uptime())
		}),
		{
			status: database ? 200 : 503,
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'cache-control': 'no-store',
				'x-robots-tag': 'noindex'
			}
		}
	);
};
