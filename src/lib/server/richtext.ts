import DOMPurify from 'isomorphic-dompurify';

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

	return DOMPurify.sanitize(source, {
		ALLOWED_TAGS,
		ALLOWED_ATTR: [
			'href',
			'title',
			'src',
			'alt',
			'width',
			'height',
			'colspan',
			'rowspan',
			'target',
			'rel'
		],
		/*
		 * `h1` is the page's own title, so a body that sets another would give
		 * the document two — a real problem for anyone navigating by heading, and
		 * something an editor's heading dropdown makes easy to do by accident.
		 */
		FORBID_TAGS: ['h1', 'style', 'script', 'iframe', 'form', 'input'],
		ALLOW_DATA_ATTR: false,
		/* Blocks `javascript:` and `data:` URLs in href and src. */
		ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i
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
