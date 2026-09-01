import { db } from '$lib/server/db';
import { sentEmails } from '$lib/server/db/schema';
import type { EmailKind, EmailStatus } from '$lib/outbox';

/**
 * Writes one row to the outbound mail record.
 *
 * Called by `sendMail` on both paths — a message that failed is the single most
 * important one to be able to look at afterwards, and a mailbox copy can never
 * show you those.
 *
 * **Never throws.** A record is worth having and never worth losing a delivered
 * message over: if this table is missing or the database is down, the mail has
 * already gone and the caller must not hear about it. The failure is logged and
 * swallowed, exactly as the traffic counter's insert is.
 */
export async function recordEmail(row: {
	recipient: string;
	cc?: string | null;
	bcc?: string | null;
	subject: string;
	bodyHtml: string;
	bodyText?: string | null;
	kind: EmailKind;
	status: EmailStatus;
	error?: string | null;
	messageId?: string | null;
	attachments?: string[] | null;
	sentBy?: string | null;
	enquiryId?: number | null;
}) {
	try {
		await db.insert(sentEmails).values({
			recipient: row.recipient.slice(0, 320),
			cc: row.cc?.slice(0, 500) || null,
			bcc: row.bcc?.slice(0, 500) || null,
			subject: row.subject.slice(0, 500),
			bodyHtml: row.bodyHtml,
			bodyText: row.bodyText || null,
			kind: row.kind,
			status: row.status,
			error: row.error || null,
			messageId: row.messageId?.slice(0, 255) || null,
			// File names only. The contents are not ours to keep a second copy
			// of, and the path is a detail of the machine that sent it.
			attachments: row.attachments?.length ? row.attachments.join(', ').slice(0, 1000) : null,
			sentBy: row.sentBy?.slice(0, 160) || null,
			enquiryId: row.enquiryId ?? null
		});
	} catch (error) {
		console.error('[mail] could not record the message', error);
	}
}
