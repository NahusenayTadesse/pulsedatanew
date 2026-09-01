import { error, fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { contactSubmissions, sentEmails } from '$lib/server/db/schema';
import { replySchema } from '$lib/forms/mail';
import { renderRichText } from '$lib/server/richtext';
import { isMailConfigured, MailError, sendMail } from '$lib/server/mail/transport';
import { replyMessage } from '$lib/server/mail/templates';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

const topicMessages: Record<string, typeof m.topic_other> = {
	erp: m.topic_erp,
	website: m.topic_website,
	demo: m.topic_demo,
	support: m.topic_support,
	partnership: m.topic_partnership,
	other: m.topic_other
};

/**
 * "Re: <their topic> — Pulsedata Solutions", in their language.
 *
 * Composed on the server so the prefilled subject is part of the form's
 * validated default rather than something the browser fills in afterwards —
 * which means a reply sent with JavaScript off still carries it.
 */
function defaultSubject(topic: string, locale: string) {
	const label = (topicMessages[topic] ?? m.topic_other)(
		{},
		{ locale: locale === 'am' ? 'am' : 'en' }
	);
	return `Re: ${label} — Pulsedata Solutions`;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const [enquiry] = await db
		.select()
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1);

	if (!enquiry) error(404);

	/*
	 * Opening an enquiry marks it read.
	 *
	 * Not awaited, and failures are swallowed: the page is already rendered
	 * from the row above, and a write that fails should not turn reading a
	 * message into an error page. The worst case is a badge that stays up and
	 * gets cleared on the next open.
	 */
	if (enquiry.status === 'new') {
		db.update(contactSubmissions)
			.set({ status: 'read' })
			.where(eq(contactSubmissions.id, id))
			.catch(() => {});
	}

	const form = await superValidate(zod4(replySchema()), {
		defaults: { subject: defaultSubject(enquiry.topic, enquiry.locale), body: '' }
	});

	/*
	 * What has already been sent about this enquiry.
	 *
	 * Shown here rather than only on the sent-mail screen because this is where
	 * the question is actually asked — "has anyone answered this?" — and a
	 * status of `replied` says somebody clicked a button, not that a message
	 * left the building. A failed reply appears here as a failure.
	 */
	const correspondence = await db
		.select({
			id: sentEmails.id,
			subject: sentEmails.subject,
			kind: sentEmails.kind,
			status: sentEmails.status,
			sentBy: sentEmails.sentBy,
			createdAt: sentEmails.createdAt
		})
		.from(sentEmails)
		.where(eq(sentEmails.enquiryId, id))
		.orderBy(desc(sentEmails.createdAt));

	return { enquiry, form, correspondence, mailReady: isMailConfigured() };
};

export const actions: Actions = {
	status: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();
		const status = String(data.get('status'));

		// The value comes from a form field, so it is checked against the list
		// rather than trusted — the column is an enum and MySQL would otherwise
		// coerce an unknown value to an empty string rather than refuse it.
		if (!(STATUSES as readonly string[]).includes(status)) {
			return fail(400, { message: 'Unknown status.' });
		}

		await db
			.update(contactSubmissions)
			.set({ status: status as (typeof STATUSES)[number] })
			.where(eq(contactSubmissions.id, id));

		return { success: true };
	},

	reply: async ({ request, params, locals }) => {
		const id = Number(params.id);
		const form = await superValidate(request, zod4(replySchema()));

		if (!form.valid) return fail(400, { form });

		/*
		 * The address is read from the row, never from the form.
		 *
		 * The composer shows who the reply goes to but does not let it be
		 * changed — otherwise this action would be an authenticated open relay,
		 * able to send Pulsedata-branded mail to any address anyone posted to it.
		 */
		const [enquiry] = await db
			.select()
			.from(contactSubmissions)
			.where(eq(contactSubmissions.id, id))
			.limit(1);

		if (!enquiry) error(404);

		const mail = replyMessage({
			name: enquiry.name,
			subject: form.data.subject,
			// The editor's HTML is sanitised before it is sent, exactly as a post
			// body is before it is stored — a reply is published to someone's
			// inbox, and the same one function decides what markup is allowed.
			bodyHtml: renderRichText(form.data.body),
			locale: enquiry.locale,
			from: locals.user?.name ?? 'Pulsedata Solutions'
		});

		try {
			await sendMail({
				to: enquiry.email,
				archive: true,
				kind: 'reply',
				sentBy: locals.user?.name ?? null,
				enquiryId: enquiry.id,
				...mail
			});
		} catch (err) {
			// The draft stays on screen with everything they typed: a failed send
			// that also loses the message is how a reply gets written twice.
			return message(form, err instanceof MailError ? err.message : m.dash_email_failed(), {
				status: 500
			});
		}

		// Only after the send. Marking it replied first would leave a lie in the
		// inbox whenever SMTP was down.
		await db
			.update(contactSubmissions)
			.set({ status: 'replied' })
			.where(eq(contactSubmissions.id, id));

		return message(form, m.dash_reply_sent({ email: enquiry.email }));
	}
};
