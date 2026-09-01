import sanitizeHtml from 'sanitize-html';

/**
 * Sanitising and measuring the rich text an editor produces.
 *
 * Bodies are stored as HTML, because the people writing them use the WYSIWYG
 * editor on the dashboard rather than a markdown box — asking the executive
 * manager to remember heading syntax to publish a post is how a CMS stops
 * being used. The trade is that what arrives here is untrusted markup, so
 * every read path goes through `renderRichText` and nothing else is ever
 * handed to `{@html}`.
 *
 * Sanitising on output rather than on input is deliberate. Input sanitising
 * has to be right once, forever, in every write path; output sanitising is
 * enforced by there being exactly one function that returns renderable HTML.
 * It also means tightening this list retroactively protects content that is
 * already in the database.
 *
 * **Why `sanitize-html` and not DOMPurify.** DOMPurify needs a DOM, so on the
 * server it came with jsdom — and jsdom does not survive being bundled. One of
 * its dependencies reaches for a JSON file at runtime with
 * `require('../data/patch.json')`, a path that exists in `node_modules` and not
 * in `build/server/chunks/`, so the built site threw
 * `Cannot find module '../data/patch.json'` the first time anything imported
 * this file. Every page that renders stored HTML — every article, every case
 * study, both dashboard composers — answered 500 in production while passing
 * locally, because `vite preview` leaves dependencies external and only the
 * real build inlines them.
 *
 * `sanitize-html` parses HTML directly instead of emulating a browser, so it
 * bundles as ordinary JavaScript, and it takes roughly forty megabytes of jsdom
 * out of the server bundle on the way past.
 */

const ALLOWED_TAGS = [
	'h2',
	'h3',
	'h4',
	'p',
	'a',
	'ul',
	'ol',
	'li',
	'blockquote',
	'strong',
	'em',
	'u',
	's',
	'code',
	'pre',
	'hr',
	'br',
	'img',
	'figure',
	'figcaption',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td'
];

export function renderRichText(source: string | null | undefined): string {
	if (!source?.trim()) return '';

	return sanitizeHtml(source, {
		allowedTags: ALLOWED_TAGS,
		/*
		 * The same attributes on every tag, as the previous allowlist was.
		 *
		 * Anything not named here is dropped, which covers every `on*` handler
		 * and every `data-*` attribute without having to enumerate them.
		 */
		allowedAttributes: {
			'*': ['href', 'title', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan', 'target', 'rel']
		},
		/*
		 * `h1`, `script`, `style`, `iframe`, `form` and `input` are simply absent
		 * from `ALLOWED_TAGS`, which drops the tag and keeps the text inside it —
		 * the same thing DOMPurify's `FORBID_TAGS` did. `script` and `style` are
		 * the exception on purpose: their *contents* go too, which is the default
		 * here and what `nonTextTags` below spells out rather than leaves implied.
		 */
		nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],

		/** What a link or an image may point at. */
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		allowedSchemesAppliedToAttributes: ['href', 'src'],
		/*
		 * `//evil.example` is a URL to another host that merely looks relative.
		 * The old regexp allowed it — it starts with `/` — which made a
		 * protocol-relative link to anywhere pass the filter. It does not now.
		 */
		allowProtocolRelative: false,

		transformTags: {
			/*
			 * A link that opens a new tab hands the opened page a `window.opener`
			 * reference to ours unless it is told not to. Editors set `target`
			 * from a toolbar button and cannot be expected to know that, so the
			 * counter-measure is added here rather than asked for.
			 */
			a: (tagName, attribs) => ({
				tagName,
				attribs: attribs.target ? { ...attribs, rel: 'noopener noreferrer' } : attribs
			})
		}
	});
}

/** Tags stripped, entities decoded, whitespace collapsed. */
function toPlainText(html: string | null | undefined): string {
	return (html ?? '')
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * A reading estimate, when the row does not carry one.
 *
 * 200 words per minute is the usual figure for English prose. Amharic is
 * counted the same way — whitespace-delimited tokens — which is close enough
 * for a label that only ever needs to distinguish short from long.
 */
export function readingMinutes(source: string | null | undefined): number {
	const words = toPlainText(source).split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

/**
 * The opening sentence or so as plain text, for a card or an `og:description`
 * on a post whose `excerpt` column was left empty.
 */
export function excerptFrom(source: string | null | undefined, limit = 180): string {
	const text = toPlainText(source);
	if (text.length <= limit) return text;
	// Cut on a word boundary so the ellipsis does not land mid-word.
	return `${text.slice(0, text.lastIndexOf(' ', limit))}…`;
}
