import { z } from 'zod';
import * as m from '$lib/paraglide/messages';

/**
 * The two things the dashboard can send: a reply to an enquiry, and a message
 * to an address typed by hand.
 *
 * The body is HTML from the rich-text editor, which is why the minimum length
 * check looks at the text inside it rather than the string: an "empty" tiptap
 * document is `<p></p>`, and a length check on the markup would happily send
 * a blank email.
 */

const hasText = (html: string) =>
	html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.trim().length > 0;

const subject = z
	.string()
	.trim()
	.min(1, 'A subject is required.')
	.max(200, 'Keep the subject under 200 characters.');

const body = z
	.string()
	.trim()
	.refine(hasText, 'Write a message before sending.')
	.refine((html) => html.length <= 100_000, 'That message is too long to send.');

export const replySchema = () => z.object({ subject, body });

export const composeSchema = () =>
	z.object({
		to: z
			.string()
			.trim()
			.min(1, m.validation_email_required())
			.email(m.validation_email_invalid())
			.max(255, m.validation_email_invalid()),
		subject,
		body
	});
