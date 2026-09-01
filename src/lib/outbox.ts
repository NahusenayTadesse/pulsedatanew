/**
 * The kinds of message this site sends, as stored in `sent_emails`.
 *
 * A closed list rather than free text, for the same reason the enquiry topics
 * are: the dashboard filters and labels by it, and a kind nobody has written a
 * label for renders as a raw column value.
 *
 * Imported by the schema, which means this module must stay free of anything
 * server-only.
 */
export const emailKinds = [
	/** The automatic thank-you to whoever filled in the contact form. */
	'acknowledgement',
	/** The automatic "new enquiry" to the team. */
	'notification',
	/** A person's reply to an enquiry, written on the dashboard. */
	'reply',
	/** Anything written in the general composer. */
	'composed',
	/** An outbound proposal sent from a script. */
	'proposal',
	'other'
] as const;

export type EmailKind = (typeof emailKinds)[number];

export const emailStatuses = ['sent', 'failed'] as const;
export type EmailStatus = (typeof emailStatuses)[number];
