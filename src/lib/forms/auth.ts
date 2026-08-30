import { z } from 'zod';
import * as m from '$lib/paraglide/messages';

/**
 * The sign-in schema.
 *
 * A function, like the public forms' schemas, so the message functions are
 * called per request and a form filled in Amharic fails in Amharic.
 *
 * Deliberately no minimum length on the password: this validates a password
 * that already exists, and telling someone their existing password is "too
 * short" when it is simply wrong is both false and a small disclosure.
 */
export function loginSchema() {
	return z.object({
		email: z
			.string()
			.trim()
			.min(1, m.validation_email_required())
			.email(m.validation_email_invalid()),
		password: z.string().min(1, m.validation_password_required())
	});
}
