import { env } from '$env/dynamic/private';
import { SITE_URL } from '$lib/site';

/**
 * The house style for everything this site sends.
 *
 * One renderer, used by every template: the acknowledgement a visitor gets,
 * the notification the team gets, the reply written on the dashboard and the
 * general composer. Adding another kind of mail means describing its content,
 * not designing another email.
 *
 * Written the way email has to be written rather than the way the site is:
 * nested tables, fixed 600px, inline styles on every element. Twenty years on,
 * Outlook still renders through Word's HTML engine, which has no flexbox, no
 * grid, no `max-width` on a div and no reliable support for a stylesheet.
 * Anything clever here degrades into an unreadable stack of left-aligned text
 * on exactly the clients Ethiopian businesses run.
 */

// -- Palette ---------------------------------------------------------------
//
// Hex, because email clients do not understand `oklch()` and a colour they
// cannot parse is dropped rather than approximated — a `color` that fails to
// parse leaves black text on the brand's dark header. These are the sRGB
// equivalents of the `--brand-*` tokens in `src/routes/layout.css`; if those
// move, these have to be recomputed to match.
const TEAL = '#017f81';
const TEAL_DEEP = '#00504f';
const GOLD = '#cda756';
const INK = '#12201f';
const BODY = '#3d4b4d';
const MUTED = '#78888a';
const LINE = '#e2e8e8';
const CANVAS = '#eef1f2';
const CARD = '#ffffff';
const QUOTE_BG = '#faf7f0';

/**
 * A font stack that survives the trip.
 *
 * No webfont: Outlook ignores `@font-face` and Gmail strips it, so a webfont
 * only ever adds a request that fails. The Ethiopic faces are named ahead of
 * the Latin ones for the Amharic messages — without them Windows renders
 * Ge'ez as boxes, and Nyala ships with Windows.
 */
const FONT =
	"'Segoe UI','Nyala','Abyssinica SIL',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,'Noto Sans Ethiopic',sans-serif";

function origin() {
	// ORIGIN is what the deployment actually answers on; SITE_URL is the
	// intended canonical domain. Preferring ORIGIN means images resolve on a
	// staging host too, where SITE_URL would point at a site that is not live.
	return (env.ORIGIN?.trim() || SITE_URL).replace(/\/+$/, '');
}

export function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Push the body styles onto the tags themselves.
 *
 * The rich-text editor emits bare `<p>`, `<h2>`, `<a>` and so on, which inherit
 * nothing useful in an email: Outlook gives `<p>` a 1em margin it will not let
 * a stylesheet remove, and Gmail's own link colour wins over an inherited one.
 * Rewriting the opening tags is blunt, but it is applied to markup that has
 * already been through `renderRichText`, so the tag set is known and closed.
 */
function inlineRichText(html: string) {
	const base = `font-family:${FONT};`;

	const styles: Record<string, string> = {
		p: `${base}margin:0 0 16px;font-size:15px;line-height:1.7;color:${BODY};`,
		h2: `${base}margin:28px 0 10px;font-size:19px;line-height:1.35;color:${INK};font-weight:700;`,
		h3: `${base}margin:24px 0 8px;font-size:16px;line-height:1.4;color:${INK};font-weight:700;`,
		h4: `${base}margin:20px 0 8px;font-size:15px;line-height:1.4;color:${INK};font-weight:700;`,
		ul: `${base}margin:0 0 16px;padding-left:22px;font-size:15px;line-height:1.7;color:${BODY};`,
		ol: `${base}margin:0 0 16px;padding-left:22px;font-size:15px;line-height:1.7;color:${BODY};`,
		li: `${base}margin:0 0 6px;`,
		a: `${base}color:${TEAL};text-decoration:underline;`,
		blockquote: `${base}margin:0 0 16px;padding:2px 0 2px 16px;border-left:3px solid ${GOLD};color:${MUTED};font-size:15px;line-height:1.7;`,
		hr: `border:0;border-top:1px solid ${LINE};margin:24px 0;`,
		img: 'max-width:100%;height:auto;border-radius:8px;display:block;',
		code: `font-family:'SFMono-Regular',Consolas,monospace;font-size:13px;background:${CANVAS};padding:2px 5px;border-radius:4px;`,
		pre: `margin:0 0 16px;padding:14px;background:${CANVAS};border-radius:8px;font-size:13px;overflow-x:auto;`,
		table: `${base}border-collapse:collapse;width:100%;margin:0 0 16px;font-size:14px;color:${BODY};`,
		th: `${base}border:1px solid ${LINE};padding:8px 10px;text-align:left;background:${CANVAS};font-weight:700;`,
		td: `${base}border:1px solid ${LINE};padding:8px 10px;`
	};

	let out = html;

	for (const [tag, style] of Object.entries(styles)) {
		out = out.replace(
			new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi'),
			(_match, attrs: string | undefined) => `<${tag}${attrs ?? ''} style="${style}">`
		);
	}

	return out;
}

/** Tags out, entities decoded, blank lines kept — the plain-text alternative. */
export function htmlToText(html: string) {
	return (
		html
			/*
			 * Cells first, and the last cell of a row without a separator.
			 *
			 * Only `</tr>` used to break, so a two-column table came out as
			 * "Finance & AccountingChart of accounts…" — every row a run-on word.
			 * Nothing sent a table until the first outbound proposal did, which is
			 * exactly the kind of thing only the plain-text alternative shows.
			 */
			.replace(/<\/(td|th)>\s*(?=<\/tr>)/gi, '')
			.replace(/<\/(td|th)>/gi, ' — ')
			.replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<li[^>]*>/gi, '• ')
			.replace(/<[^>]+>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/\n{3,}/g, '\n\n')
			.replace(/[ \t]+\n/g, '\n')
			.trim()
	);
}

export type EmailButton = { label: string; href: string };

/** A label/value row — the enquiry's own details, above the message. */
export type EmailMeta = { label: string; value: string; href?: string };

export type EmailContent = {
	/** The line the inbox shows after the subject. Never leave it to chance. */
	preheader: string;
	/** Small caps above the heading — the kind of message this is. */
	eyebrow?: string;
	heading: string;
	/** Plain paragraphs, escaped. For copy the sender did not write in HTML. */
	intro?: string[];
	/** Rich text, already sanitised by `renderRichText`. */
	bodyHtml?: string;
	/** Quoted verbatim text, shown as text — a visitor's own message. */
	quote?: { title: string; text: string; lang?: string };
	meta?: EmailMeta[];
	button?: EmailButton;
	/** A closing aside inside the card, under a rule. */
	note?: string;
	/** Sets `lang`/`dir` and picks the footer's language. */
	locale?: string;
	/** Footer lines — company address, contact details. */
	footer?: string[];
};

function paragraph(text: string) {
	return `<p style="font-family:${FONT};margin:0 0 16px;font-size:15px;line-height:1.7;color:${BODY};">${escapeHtml(text)}</p>`;
}

/**
 * A button that survives Outlook.
 *
 * The VML block is not optional decoration: Word's engine ignores padding on
 * an anchor, so without it the "button" collapses to underlined text on every
 * desktop Outlook. The conditional comment is invisible to every other client,
 * which reads the anchor underneath.
 */
function button({ label, href }: EmailButton) {
	const safeHref = escapeHtml(href);

	return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
        <tr><td align="center" bgcolor="${TEAL}" style="border-radius:8px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
            href="${safeHref}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="18%" stroke="f" fillcolor="${TEAL}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;">${escapeHtml(label)}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${safeHref}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background:${TEAL};">${escapeHtml(label)}</a>
          <!--<![endif]-->
        </td></tr>
      </table>`;
}

function metaTable(rows: EmailMeta[]) {
	const cells = rows
		.map(({ label, value, href }) => {
			const shown = href
				? `<a href="${escapeHtml(href)}" style="color:${TEAL};text-decoration:none;font-weight:600;">${escapeHtml(value)}</a>`
				: `<span style="color:${INK};font-weight:600;">${escapeHtml(value)}</span>`;

			return `<tr>
            <td style="padding:0 0 12px;font-family:${FONT};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};width:34%;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:0 0 12px;font-family:${FONT};font-size:14px;line-height:1.5;vertical-align:top;">${shown}</td>
          </tr>`;
		})
		.join('');

	return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;padding:20px 22px;background:${CANVAS};border-radius:10px;">
        ${cells}
      </table>`;
}

function quoteBlock({ title, text, lang }: NonNullable<EmailContent['quote']>) {
	return `
      <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">${escapeHtml(title)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr><td style="padding:16px 20px;background:${QUOTE_BG};border-left:3px solid ${GOLD};border-radius:0 8px 8px 0;">
          <div lang="${escapeHtml(lang ?? 'en')}" style="font-family:${FONT};font-size:15px;line-height:1.7;color:${BODY};white-space:pre-wrap;">${escapeHtml(text)}</div>
        </td></tr>
      </table>`;
}

/**
 * Render one message into the house layout.
 *
 * Returns both parts, built from the same content — so the plain-text version
 * cannot drift out of date with the HTML the way a hand-written one does.
 */
export function renderEmail(content: EmailContent): { html: string; text: string } {
	const site = origin();
	const locale = content.locale === 'am' ? 'am' : 'en';

	const sections = [
		content.eyebrow
			? `<p style="margin:0 0 10px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${TEAL};">${escapeHtml(content.eyebrow)}</p>`
			: '',
		`<h1 style="margin:0 0 18px;font-family:${FONT};font-size:24px;line-height:1.3;color:${INK};font-weight:700;">${escapeHtml(content.heading)}</h1>`,
		(content.intro ?? []).map(paragraph).join(''),
		content.meta?.length ? metaTable(content.meta) : '',
		content.quote ? quoteBlock(content.quote) : '',
		content.bodyHtml ? inlineRichText(content.bodyHtml) : '',
		content.button ? button(content.button) : '',
		content.note
			? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding-top:8px;border-top:1px solid ${LINE};">
          <p style="margin:16px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(content.note)}</p>
        </td></tr></table>`
			: ''
	].join('\n');

	const footerLines = (content.footer ?? [])
		.map(
			(line) =>
				`<p style="margin:0 0 4px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(line)}</p>`
		)
		.join('');

	const html = `<!doctype html>
<html lang="${locale}" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(content.heading)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  /*
   * Everything that matters is inlined above; this block only holds the two
   * things an inline style cannot express — a media query and a pseudo-class.
   * Clients that drop <style> entirely still get the full design.
   */
  @media only screen and (max-width:620px) {
    .shell { width:100% !important; }
    .pad { padding-left:22px !important; padding-right:22px !important; }
    .band { padding:22px !important; }
  }
  /*
   * Dark mode, for the clients that honour it (Apple Mail, iOS, Outlook mobile).
   * !important is required: these override inline styles, which otherwise win.
   * Gmail does its own colour inversion and ignores all of this.
   */
  @media (prefers-color-scheme: dark) {
    .canvas { background:#0f1718 !important; }
    .card { background:#16211f !important; border-color:#26332f !important; }
    .card h1, .card strong, .card span { color:#f4f1e8 !important; }
    .card p, .card li, .card div { color:#c3cdcb !important; }
    .meta { background:#1d2926 !important; }
    .quote { background:#1d2926 !important; }
    .foot p { color:#8b9997 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${CANVAS};font-family:${FONT};-webkit-font-smoothing:antialiased;">
  <!-- The preview line, hidden in the body and padded so the client does not
       pull the first sentence of the message in after it. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(content.preheader)}
    ${'&#847;&zwnj;&nbsp;'.repeat(60)}
  </div>

  <table role="presentation" class="canvas" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${CANVAS};">
    <tr><td align="center" style="padding:28px 12px 36px;">

      <table role="presentation" class="shell" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

        <!-- Header band -->
        <tr><td class="band" align="center" style="padding:28px;background:${TEAL_DEEP};border-radius:14px 14px 0 0;">
          <a href="${escapeHtml(site)}" style="text-decoration:none;">
            <img src="${escapeHtml(site)}/longLogoforDark.png" width="196" alt="Pulsedata Solutions"
                 style="display:block;width:196px;max-width:70%;height:auto;border:0;">
          </a>
        </td></tr>
        <!-- The gold rule: the brand's second colour, and the only thing
             separating the band from the card. -->
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${GOLD};">&nbsp;</td></tr>

        <!-- The message -->
        <tr><td class="card pad" style="padding:34px 36px 30px;background:${CARD};border:1px solid ${LINE};border-top:0;border-radius:0 0 14px 14px;font-family:${FONT};">
          ${sections}
        </td></tr>

        <!-- Footer -->
        <tr><td class="foot" align="center" style="padding:24px 20px 0;">
          <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.04em;color:${MUTED};">
            Pulsedata Solutions · Complexity, Simplified.
          </p>
          ${footerLines}
          <p style="margin:10px 0 0;font-family:${FONT};font-size:12px;color:${MUTED};">
            <a href="${escapeHtml(site)}" style="color:${TEAL};text-decoration:none;">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

	const text = [
		content.eyebrow?.toUpperCase(),
		content.heading,
		'',
		...(content.intro ?? []),
		content.meta?.length ? content.meta.map((row) => `${row.label}: ${row.value}`).join('\n') : '',
		content.quote ? `${content.quote.title}:\n${content.quote.text}` : '',
		content.bodyHtml ? htmlToText(content.bodyHtml) : '',
		content.button ? `${content.button.label}: ${content.button.href}` : '',
		content.note,
		'',
		'—',
		'Pulsedata Solutions · Complexity, Simplified.',
		...(content.footer ?? []),
		site
	]
		.filter((line): line is string => Boolean(line))
		.join('\n\n')
		.replace(/\n{3,}/g, '\n\n');

	return { html, text };
}
