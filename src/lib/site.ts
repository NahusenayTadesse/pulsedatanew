/**
 * The details that appear in the chrome of every page.
 *
 * Empty strings are meaningful: the footer and contact page render a field only
 * when it has a value, so the site is honest about what it does not yet publish
 * rather than showing a placeholder that looks like a real address. Fill these
 * in when the business email, phone number and domain are confirmed — they are
 * the open items in BUILD.md.
 */
export const CONTACT = {
	email: 'info@pulsedataet.com',
	phone: '0947 340 602',
	/**
	 * The `tel:` form — no spaces or punctuation, and in international format.
	 *
	 * `tel:` is consumed by a phone, not a person: the local `09…` form fails
	 * for anyone dialling from outside Ethiopia, and a prospective client
	 * abroad is exactly who taps a number on a website rather than typing it.
	 * `Footer` and the contact page prefix `tel:` themselves.
	 */
	phoneHref: '+251947340602',
	city: 'Addis Ababa',
	country: 'Ethiopia'
} as const;

/** The canonical origin, for `og:` tags and the sitemap. */
export const SITE_URL = 'https://pulsedataet.com';

/*
 * The social profiles are *not* here.
 *
 * They started as a constant in this file and moved to the `company_links`
 * table, edited at /dashboard/socials, for the same reason the team did: an
 * account that opens should not need a deploy. The footer reads them from the
 * `(site)` layout's load; the home page's `sameAs` reads the same list.
 */
