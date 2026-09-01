import { and, eq, gte, lt, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { loginAttempts } from '$lib/server/db/schema';

/**
 * How many times a password may be guessed before the door closes.
 *
 * The contact form had a flood check from the first day and the login page had
 * none, which is the wrong way round: a public form filling a table is a
 * nuisance, and an unlimited guess rate against an account that can publish to
 * the company's website and read its enquiry inbox is not.
 *
 * Two counters, because they stop different attacks:
 *
 * - **Per address.** Someone working through a password list against
 *   `surafel@…`. Five tries is more than a person who has forgotten which of
 *   their two passwords it is, and far less than a dictionary.
 * - **Per IP.** A flood from one source: someone spraying one likely password
 *   across many addresses never trips the per-address counter, because no
 *   single address is tried twice.
 *
 * The per-IP number is deliberately generous. It is a backstop, not the
 * control — the per-address lock is what actually stops a break-in, and this
 * site has three accounts, so an attacker who has locked all three has nothing
 * left to spray at. Set low it does real harm instead: every person in one
 * office shares a NAT address, and a stranger guessing at a made-up address
 * could lock the staff out of their own dashboard from the other side of the
 * world. The test suite makes roughly a dozen failed logins per run and must
 * not lock itself out either.
 *
 * Failures are recorded for addresses that do not exist too. Skipping those
 * would turn the lockout itself into an oracle: an attacker learns which
 * addresses are real by seeing which ones can be locked.
 */
export const MAX_PER_IDENTIFIER = 5;
export const MAX_PER_IP = 100;
export const WINDOW_MINUTES = 15;

const windowStart = sql`DATE_SUB(NOW(), INTERVAL ${sql.raw(String(WINDOW_MINUTES))} MINUTE)`;

/**
 * Whether this sign-in should be refused without checking the password.
 *
 * Refusing before the hash is verified is the point: argon2 is deliberately
 * slow, so a locked-out attacker who still costs us a verification per attempt
 * has been handed a way to exhaust the server instead.
 */
export async function loginBlocked(identifier: string, ipAddress: string) {
	const [row] = await db
		.select({
			byIdentifier: sql<number>`SUM(CASE WHEN ${loginAttempts.identifier} = ${identifier} THEN 1 ELSE 0 END)`,
			byIp: sql<number>`SUM(CASE WHEN ${loginAttempts.ipAddress} = ${ipAddress} THEN 1 ELSE 0 END)`
		})
		.from(loginAttempts)
		.where(
			and(
				gte(loginAttempts.createdAt, windowStart),
				// One query rather than two: the row set is the same, and this page
				// is on the critical path of every sign-in.
				or(eq(loginAttempts.identifier, identifier), eq(loginAttempts.ipAddress, ipAddress))
			)
		);

	return (
		Number(row?.byIdentifier ?? 0) >= MAX_PER_IDENTIFIER || Number(row?.byIp ?? 0) >= MAX_PER_IP
	);
}

export async function recordFailedLogin(identifier: string, ipAddress: string) {
	await db.insert(loginAttempts).values({ identifier, ipAddress });

	/*
	 * Expired rows are swept here rather than on a schedule.
	 *
	 * The table is only ever read through a window, so old rows change no
	 * answer — they would simply accumulate forever on a site with no cron. A
	 * failed login is exactly the moment it is worth spending a delete on, and
	 * it is already the slow path.
	 */
	await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, windowStart));
}

/** A correct password clears the address's record. See the note on the table. */
export async function clearFailedLogins(identifier: string) {
	await db.delete(loginAttempts).where(eq(loginAttempts.identifier, identifier));
}
