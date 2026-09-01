import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auth } from '$lib/server/auth';
import { loginSchema } from '$lib/forms/auth';
import { clearFailedLogins, loginBlocked, recordFailedLogin } from '$lib/server/throttle';
import { localizeHref } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

/**
 * Where `redirectTo` is allowed to point.
 *
 * Only a path on this site, and never one starting `//` — which a browser
 * reads as a protocol-relative URL to another host. Without this the login
 * page is an open redirector: a link to
 * `/login?redirectTo=https://not-us.example` would send someone who has just
 * typed their password to a site of the attacker's choosing.
 */
function safeRedirect(target: string | null): string {
	if (!target) return '/dashboard';
	if (!target.startsWith('/') || target.startsWith('//')) return '/dashboard';
	return target;
}

export const load: PageServerLoad = async (event) => {
	// Already signed in: there is nothing to do here.
	if (event.locals.user)
		redirect(303, localizeHref(safeRedirect(event.url.searchParams.get('redirectTo'))));

	return { form: await superValidate(zod4(loginSchema())) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod4(loginSchema()));
		if (!form.valid) return fail(400, { form });

		const identifier = form.data.email.trim().toLowerCase();
		const ipAddress = event.getClientAddress();

		/*
		 * Checked before the password is verified, not after.
		 *
		 * Verifying a hash is deliberately expensive, so an attacker who is
		 * already locked out but still costs us a full verification per attempt
		 * has been given a way to exhaust the server rather than a way in.
		 */
		if (await loginBlocked(identifier, ipAddress)) {
			return message(form, m.login_throttled(), { status: 429 });
		}

		try {
			await auth.api.signInEmail({
				body: { email: form.data.email, password: form.data.password },
				headers: event.request.headers,
				// So Better Auth's cookie is set on this response rather than needing
				// a second round trip to establish the session.
				asResponse: false
			});
		} catch (error) {
			/*
			 * One message for every failure — wrong password, unknown address,
			 * locked account. Distinguishing them tells an attacker which email
			 * addresses have accounts, and a staff member who mistyped either
			 * field is served just as well by being asked to check both.
			 */
			if (error instanceof APIError) {
				// Recorded for addresses that do not exist too — see the note in
				// `$lib/server/throttle`. Locking only real accounts would tell an
				// attacker which addresses are real.
				await recordFailedLogin(identifier, ipAddress);
				return message(form, m.login_failed(), { status: 401 });
			}
			throw error;
		}

		// The password was right, so the run of failures is over.
		await clearFailedLogins(identifier);

		redirect(303, localizeHref(safeRedirect(event.url.searchParams.get('redirectTo'))));
	}
};
