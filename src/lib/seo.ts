import { localizeHref } from '$lib/paraglide/runtime';
import { SITE_URL } from '$lib/site';

/**
 * The URLs a page has to declare about itself.
 *
 * A bilingual site that says nothing about its two halves looks to a crawler
 * like two unrelated pages competing for the same search: `/about` and
 * `/am/about` carry the same information in different languages, and without
 * `hreflang` neither one inherits the other's standing. This builds both the
 * canonical URL and the full alternates set from one path, so every page
 * declares the same thing in the same way.
 */

export const LOCALES = ['en', 'am'] as const;

export type Alternate = { hreflang: string; href: string };

/** Strips the origin and any locale prefix back to a plain, unprefixed path. */
function normalise(pathname: string) {
	const withoutLocale = pathname.replace(/^\/am(?=\/|$)/, '') || '/';
	// A trailing slash makes `/about/` and `/about` two URLs to a crawler.
	return withoutLocale !== '/' ? withoutLocale.replace(/\/$/, '') : '/';
}

export function absolute(path: string) {
	/*
	 * The trailing slash is stripped here as well as in `normalise`, because
	 * this also receives paths straight from `localizeHref` — which returns
	 * `/am/` for the Amharic home page. Left alone, the home page's own
	 * alternates would disagree about whether the site's root has a slash, and
	 * an alternate that does not match the URL it points at is ignored.
	 */
	const clean = path === '/' ? '' : path.replace(/\/$/, '');
	return `${SITE_URL}${clean}`;
}

/**
 * The canonical and the alternates for one page.
 *
 * `x-default` points at the English URL: it is what a crawler should offer a
 * reader whose language matches neither, and omitting it makes the set
 * incomplete in Search Console's eyes.
 *
 * Note that every alternate must be reciprocal — each language's page has to
 * list the whole set, including itself — which is why this returns all of them
 * rather than "the other one".
 */
export function seoUrls(pathname: string) {
	const path = normalise(pathname);

	const alternates: Alternate[] = [
		...LOCALES.map((locale) => ({
			hreflang: locale,
			href: absolute(localizeHref(path, { locale }))
		})),
		{ hreflang: 'x-default', href: absolute(path) }
	];

	return { canonical: absolute(localizeHref(path)), alternates };
}

/**
 * The default social card image, absolute because a crawler will not resolve a
 * relative one. 1200x630, which is what every platform crops from.
 */
export const OG_IMAGE = `${SITE_URL}/og-cover.png`;

/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 *
 * The escaping is the whole point. This is the one place in the codebase that
 * puts a database value inside `{@html}` without `renderRichText` — a JSON-LD
 * block cannot be built any other way in Svelte — so instead of sanitising
 * markup, it makes markup impossible: `<`, `>` and `&` are replaced by their
 * `\uXXXX` escapes, which JSON parses back to the same characters and an HTML
 * parser cannot read as the start of anything. A project titled
 * `</script><script>…` therefore stays a string.
 *
 * `U+2028`/`U+2029` are escaped for the same reason JSON embedded in a script
 * always must be: they are legal in JSON strings and illegal, unescaped, in
 * JavaScript source.
 */
export function jsonLd(data: Record<string, unknown>): string {
	return JSON.stringify(data)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

/**
 * The whole `<script type="application/ld+json">` element, as a string.
 *
 * Assembled here rather than in the component because a literal script tag
 * inside a Svelte template is a parse error for the ESLint plugin — it reads it
 * as the start of a real script block. In a `.ts` module it is just text.
 */
export function jsonLdScript(data: Record<string, unknown>): string {
	return `<script type="application/ld+json">${jsonLd(data)}</script>`;
}
