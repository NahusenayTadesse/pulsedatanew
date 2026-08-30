/**
 * Creates a dashboard account.
 *
 * There is no sign-up page and the sign-up endpoint is disabled in the running
 * app (see `src/lib/server/auth-config.ts`): every account on this site can
 * publish to the company's public pages and read the enquiry inbox, so they are
 * made here, on the server, by someone who already has shell access.
 *
 *   npm run admin:create -- "Surafel Asamnew" surafel@pulsedata.et
 *
 * The password is read from stdin rather than taken as an argument so it never
 * reaches shell history or the process list, where `ps` would show it to every
 * other user on the machine.
 */
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { betterAuth } from 'better-auth/minimal';
import * as schema from '../src/lib/server/db/schema';
import { baseAuthOptions } from '../src/lib/server/auth-config';

const [name, email] = process.argv.slice(2);

if (!name || !email) {
	console.error('Usage: npm run admin:create -- "Full Name" email@example.com');
	process.exit(1);
}

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL is not set.');
	process.exit(1);
}

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: 'default' });

// The one place sign-up is allowed, and it is not reachable over HTTP.
const auth = betterAuth(
	baseAuthOptions({
		db,
		secret: process.env.BETTER_AUTH_SECRET,
		baseURL: process.env.ORIGIN,
		allowSignUp: true
	})
);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question(`Password for ${email}: `);
rl.close();

if (password.length < 12) {
	// Higher than Better Auth's own floor. This account publishes to a public
	// company site and reads an inbox of other people's business documents.
	console.error('Use at least 12 characters.');
	await pool.end();
	process.exit(1);
}

try {
	await auth.api.signUpEmail({ body: { name, email, password } });
	console.log(`Created ${email}. Sign in at /login`);
} catch (error) {
	console.error('Could not create the account:', error instanceof Error ? error.message : error);
	await pool.end();
	process.exit(1);
}

await pool.end();
process.exit(0);
