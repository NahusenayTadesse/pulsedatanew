import { env } from '$env/dynamic/private';
import { CONTACT, SITE_URL } from '$lib/site';
import * as m from '$lib/paraglide/messages';
import { renderEmail, type EmailMeta } from './layout';

/**
 * The messages this site sends.
 *
 * Each one describes its content and hands it to `renderEmail`; none of them
 * contains markup. That is the point of the split — a new kind of email is a
 * function here, and never a second copy of the layout.
 */

type Locale = 'en' | 'am';

/** Anything with the shape of a contact row, so the seed and tests can pass a literal. */
export type EnquiryLike = {
	id: number;
	name: string;
	email: string;
	phone?: string | null;
	company?: string | null;
	topic: string;
	message: string;
	locale: string;
	attachmentName?: string | null;
	createdAt: Date;
};

function site() {
	return (env.ORIGIN?.trim() || SITE_URL).replace(/\/+$/, '');
}

function asLocale(value: string | null | undefined): Locale {
	return value === 'am' ? 'am' : 'en';
}

const topicMessages: Record<string, typeof m.topic_other> = {
	erp: m.topic_erp,
	website: m.topic_website,
	demo: m.topic_demo,
	support: m.topic_support,
	partnership: m.topic_partnership,
	other: m.topic_other
};

function topicLabel(topic: string, locale: Locale) {
	return (topicMessages[topic] ?? m.topic_other)({}, { locale });
}

/**
 * The lines under the card.
 *
 * Built from `$lib/site`, and each one omitted while it is empty — the same
 * rule the site's own footer follows. An email that prints "Phone:" with
 * nothing after it looks broken in a way a missing line does not.
 */
function footer() {
	return [`${CONTACT.city}, ${CONTACT.country}`, CONTACT.email, CONTACT.phone].filter(Boolean);
}

function formatReceived(date: Date, locale: Locale) {
	return new Intl.DateTimeFormat(locale === 'am' ? 'am-ET' : 'en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}

// ---------------------------------------------------------------------------
// 1. The acknowledgement, to whoever filled in the contact form
// ---------------------------------------------------------------------------

/**
 * Written in the language the form was filled in, not the reader's.
 *
 * Someone who wrote to us in Amharic gets Amharic back. The row already
 * records which it was, for exactly this.
 */
export function contactAcknowledgement(enquiry: EnquiryLike) {
	const locale = asLocale(enquiry.locale);

	return {
		subject: m.email_thanks_subject({}, { locale }),
		...renderEmail({
			locale,
			preheader: m.email_thanks_preheader({}, { locale }),
			eyebrow: m.email_thanks_eyebrow({}, { locale }),
			heading: m.email_thanks_heading({ name: enquiry.name }, { locale }),
			intro: [m.email_thanks_p1({}, { locale }), m.email_thanks_p2({}, { locale })],
			/*
			 * Their own words, quoted back.
			 *
			 * It is what turns an autoresponder into a receipt: it proves the
			 * message arrived intact, and it is the one thing a sender checks when
			 * they are not sure the form worked.
			 */
			quote: {
				title: m.email_thanks_quote_title({}, { locale }),
				text: enquiry.message,
				lang: locale
			},
			button: { label: m.email_thanks_button({}, { locale }), href: `${site()}/projects` },
			note: m.email_thanks_note({}, { locale }),
			footer: footer()
		})
	};
}

// ---------------------------------------------------------------------------
// 2. The notification, to the team
// ---------------------------------------------------------------------------

/**
 * Always English, whatever language the enquiry was written in: this one is
 * read by whoever is on the inbox, not by the sender.
 */
export function enquiryNotification(enquiry: EnquiryLike) {
	const locale: Locale = 'en';
	const topic = topicLabel(enquiry.topic, locale);

	const meta: (EmailMeta | null)[] = [
		{
			label: m.contact_email_label({}, { locale }),
			value: enquiry.email,
			href: `mailto:${enquiry.email}`
		},
		enquiry.phone
			? {
					label: m.contact_phone_label({}, { locale }),
					value: enquiry.phone,
					href: `tel:${enquiry.phone.replace(/[^\d+]/g, '')}`
				}
			: null,
		enquiry.company ? { label: m.dash_field_client({}, { locale }), value: enquiry.company } : null,
		{ label: m.dash_enquiry_topic({}, { locale }), value: topic },
		{
			label: m.email_meta_received({}, { locale }),
			value: formatReceived(enquiry.createdAt, locale)
		},
		enquiry.attachmentName
			? {
					label: m.dash_enquiry_attachment({}, { locale }),
					value: enquiry.attachmentName
				}
			: null
	];

	return {
		subject: m.email_enquiry_subject({ topic, name: enquiry.name }, { locale }),
		...renderEmail({
			locale,
			preheader: m.email_enquiry_preheader({ name: enquiry.name }, { locale }),
			eyebrow: m.email_enquiry_eyebrow({}, { locale }),
			heading: m.email_enquiry_heading({ name: enquiry.name }, { locale }),
			intro: [
				m.email_enquiry_p1({}, { locale }),
				// Surfaced here rather than only on the dashboard, because whoever
				// reads this on a phone decides then whether to answer.
				...(enquiry.locale === 'am' ? [m.email_enquiry_amharic({}, { locale })] : [])
			],
			meta: meta.filter((row): row is EmailMeta => row !== null),
			quote: {
				title: m.dash_enquiry_message({}, { locale }),
				text: enquiry.message,
				lang: asLocale(enquiry.locale)
			},
			button: {
				label: m.email_enquiry_button({}, { locale }),
				href: `${site()}/dashboard/enquiries/${enquiry.id}`
			},
			note: m.email_enquiry_note({}, { locale }),
			footer: footer()
		})
	};
}

// ---------------------------------------------------------------------------
// 3. A reply to an enquiry, written on the dashboard
// ---------------------------------------------------------------------------

export function replyMessage(input: {
	name: string;
	subject: string;
	/** Already through `renderRichText`. */
	bodyHtml: string;
	locale: string;
	/** Signed with the name of whoever is logged in. */
	from: string;
}) {
	const locale = asLocale(input.locale);

	return {
		subject: input.subject,
		...renderEmail({
			locale,
			/*
			 * The subject would be a wasted preview line — the inbox already shows
			 * it directly above. The opening of the reply itself is the useful
			 * thing to put there, so this is the greeting.
			 */
			preheader: locale === 'am' ? `ውድ ${input.name}` : `Dear ${input.name}`,
			heading: locale === 'am' ? `ውድ ${input.name}፣` : `Dear ${input.name},`,
			bodyHtml: input.bodyHtml,
			note: `${input.from} · ${m.email_signoff({}, { locale })}`,
			footer: footer()
		})
	};
}

// ---------------------------------------------------------------------------
// 4. Anything else, from the dashboard's composer
// ---------------------------------------------------------------------------

export function generalMessage(input: { subject: string; bodyHtml: string; from: string }) {
	const locale: Locale = 'en';

	return {
		subject: input.subject,
		...renderEmail({
			locale,
			preheader: input.subject,
			heading: input.subject,
			bodyHtml: input.bodyHtml,
			note: `${input.from} · ${m.email_signoff({}, { locale })}`,
			footer: footer()
		})
	};
}
