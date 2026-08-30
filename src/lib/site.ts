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
	email: '',
	phone: '',
	/** The `tel:` form — no spaces or punctuation. */
	phoneHref: '',
	city: 'Addis Ababa',
	country: 'Ethiopia'
} as const;

/** The canonical origin, for `og:` tags and the sitemap. */
export const SITE_URL = 'https://pulsedata.et';

export const SOCIAL: { label: string; href: string }[] = [];
