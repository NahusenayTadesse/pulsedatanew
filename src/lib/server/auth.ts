import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { baseAuthOptions } from '$lib/server/auth-config';

export const auth = betterAuth({
	...baseAuthOptions({
		db,
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.ORIGIN,
		// Never from the running app. See the note in auth-config.ts.
		allowSignUp: false
	}),
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
