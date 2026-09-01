import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';
import { recordEmail } from './outbox';
import type { EmailKind } from '$lib/outbox';

/**
 * The one place mail leaves this application.
 *
 * Every sender — the contact form's acknowledgement, the reply written on the
 * dashboard, the general composer — goes through `sendMail`, so the SMTP
 * credentials are read once, the transport is reused across requests, and a
 * misconfiguration produces the same clear error everywhere rather than a
 * different nodemailer stack trace per caller.
 */

export class MailError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MailError';
	}
}

type MailConfig = {
	host: string;
	port: number;
	secure: boolean;
	user: string;
	password: string;
	/** The envelope sender. Must be an address the SMTP account may send as. */
	from: string;
	/** Where enquiry notifications land. */
	notify: string;
	/**
	 * A mailbox that receives a blind copy of everything a person here sends.
	 *
	 * Sending over SMTP leaves no record anywhere: the Sent folder in webmail is
	 * written by webmail itself, so a message this application sends is invisible
	 * in the very place staff look for it. A blind copy back to the company
	 * mailbox is the record — and, since it arrives through the normal delivery
	 * path, it is also proof that the path works.
	 */
	archive: string | null;
};

/**
 * Read the SMTP settings, or return null if the site has not been given any.
 *
 * Null rather than throwing, because "no mail configured" is a legitimate
 * state — a developer running the site locally has no SMTP account, and the
 * contact form must still accept an enquiry and store it. Only the callers
 * that cannot do their job without mail (the dashboard's two composers) turn
 * this into an error.
 */
export function mailConfig(): MailConfig | null {
	const host = env.SMTP_HOST?.trim();
	const user = env.SMTP_USER?.trim();
	const password = env.SMTP_PASSWORD;

	if (!host || !user || !password) return null;

	const port = Number(env.SMTP_PORT ?? 587);

	return {
		host,
		port,
		/*
		 * 465 is implicit TLS; 587 and 25 start in the clear and upgrade with
		 * STARTTLS, which nodemailer does on its own when `secure` is false.
		 * Getting this backwards is the usual cause of a connection that hangs
		 * until it times out rather than failing outright.
		 */
		secure: port === 465,
		user,
		password,
		/*
		 * `MAIL_FROM` is separate from `SMTP_USER` because they are usually not
		 * the same thing: the account authenticating may be a mailbox while the
		 * address recipients should see is "Pulsedata Solutions <hello@…>".
		 * Falling back to the user keeps a minimal .env working.
		 */
		from: env.MAIL_FROM?.trim() || user,
		/*
		 * Where a new enquiry is announced. Falls back to the authenticating
		 * account, so configuring SMTP at all is enough to stop losing leads —
		 * the failure mode this exists to prevent.
		 *
		 * Deliberately not `MAIL_FROM`: that is a sender identity and usually
		 * carries a display name — "Pulsedata Solutions <info@…>" — which is a
		 * strange thing to record as the recipient of every notification, and
		 * strictly wrong anywhere the address is compared rather than dialled.
		 */
		notify: env.MAIL_TO?.trim() || user,
		archive: env.MAIL_ARCHIVE?.trim() || null
	};
}

export function isMailConfigured() {
	return mailConfig() !== null;
}

/** Where new-enquiry notifications go, or null when mail is not configured. */
export function notifyAddress() {
	return mailConfig()?.notify ?? null;
}

/** The blind-copy mailbox, or null when none is configured. */
export function archiveAddress() {
	return mailConfig()?.archive ?? null;
}

let transporter: Transporter | null = null;

function getTransport(config: MailConfig) {
	/*
	 * Built once and kept. Nodemailer pools connections on the transport
	 * object, so constructing one per send would open a fresh TCP and TLS
	 * handshake for every message — slow, and enough to trip the connection
	 * limits on a shared SMTP account when a few enquiries arrive together.
	 */
	transporter ??= nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: { user: config.user, pass: config.password },
		pool: true,
		maxConnections: 3
	});

	return transporter;
}

export type OutgoingMail = {
	to: string;
	subject: string;
	html: string;
	/** The plain-text alternative. Always send one; see the note below. */
	text: string;
	replyTo?: string;
	cc?: string;
	/**
	 * A blind copy. Set `archive: true` instead of writing the company's own
	 * address here — the two are different intentions and only one of them
	 * should follow `MAIL_ARCHIVE` when it changes.
	 */
	bcc?: string;
	/**
	 * Copy this message to `MAIL_ARCHIVE`, if one is set.
	 *
	 * True for everything a person composes — a reply, the general composer, an
	 * outbound proposal — and deliberately false for the contact form's
	 * automatic acknowledgement, which would put a copy of every enquiry
	 * acknowledgement in the inbox beside the notification that already
	 * announces it.
	 */
	archive?: boolean;
	attachments?: { filename: string; path: string }[];

	/**
	 * What kind of message this is, for the outbound record.
	 *
	 * Defaults to `other` rather than being required: a new sender that forgets
	 * it should still be recorded, just less well labelled. See `$lib/outbox`.
	 */
	kind?: EmailKind;
	/** Who pressed send, when a person did. */
	sentBy?: string | null;
	/** The enquiry this answers, when it answers one. */
	enquiryId?: number | null;
};

/**
 * Send one message, and record that it was sent.
 *
 * Throws `MailError` rather than returning a result, so a caller that forgets
 * to check cannot silently drop a message the user believes was sent. The
 * contact form is the one place that catches it deliberately.
 *
 * The record is written here, not by the callers, for the same reason the
 * transport lives here: this is the only place mail leaves the application, so
 * it is the only place that can promise every message is accounted for. A
 * caller cannot forget, and a new sender gets the record for free.
 */
export async function sendMail(mail: OutgoingMail): Promise<void> {
	const config = mailConfig();

	if (!config) {
		throw new MailError(
			'Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD in the environment.'
		);
	}

	const bcc =
		[mail.bcc, mail.archive ? config.archive : null].filter(Boolean).join(', ') || undefined;

	/** Everything the record needs that does not depend on the outcome. */
	const record = {
		recipient: mail.to,
		cc: mail.cc,
		bcc,
		subject: mail.subject,
		bodyHtml: mail.html,
		bodyText: mail.text,
		kind: mail.kind ?? ('other' as const),
		attachments: mail.attachments?.map((attachment) => attachment.filename),
		sentBy: mail.sentBy,
		enquiryId: mail.enquiryId
	};

	try {
		const info = await getTransport(config).sendMail({
			from: config.from,
			to: mail.to,
			cc: mail.cc,
			bcc,
			subject: mail.subject,
			/*
			 * Both parts, every time. A message with no text alternative scores
			 * as spam on most filters, and it is the only version some clients
			 * and every screen reader in "plain text" mode will show.
			 */
			text: mail.text,
			html: mail.html,
			replyTo: mail.replyTo,
			attachments: mail.attachments
		});

		/*
		 * Awaited, unlike the traffic counter's insert.
		 *
		 * A page view is worth nothing if it costs a millisecond of the response;
		 * a record of who was written to and what it said is worth the wait, and
		 * a script that exits the moment `sendMail` resolves would otherwise
		 * leave before the row was written.
		 */
		await recordEmail({ ...record, status: 'sent', messageId: info.messageId });
	} catch (err) {
		// The underlying error carries the SMTP conversation, which is what
		// makes a rejected sender or a bad password diagnosable in the logs —
		// but it is not shown to the person who pressed Send.
		console.error('[mail] send failed', err);

		// The failure is the row most worth having: it is the one the mailbox
		// cannot show, because nothing was ever delivered to it.
		await recordEmail({
			...record,
			status: 'failed',
			error: err instanceof Error ? err.message : String(err)
		});

		throw new MailError(
			err instanceof Error ? `The mail server rejected the message: ${err.message}` : 'Send failed.'
		);
	}
}
