/**
 * The social platforms a team member can be linked from.
 *
 * A closed list rather than free text, for the same reason the enquiry topics
 * are: every value has to map to an icon and a label, and a platform nobody
 * has drawn an icon for renders as a mystery glyph. Adding one is two edits —
 * here and in `SocialIcon.svelte`.
 *
 * Imported by the zod schema, which runs in the browser, so this module must
 * stay free of anything server-only.
 */
export const socialPlatforms = [
	'linkedin',
	'x',
	'github',
	'telegram',
	'whatsapp',
	'instagram',
	'facebook',
	'youtube',
	'tiktok',
	'website',
	'email'
] as const;

export type SocialPlatform = (typeof socialPlatforms)[number];

/**
 * The names are the platforms' own and are not translated — "LinkedIn" is
 * LinkedIn in Amharic too — so they live here rather than in the message files.
 */
export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
	linkedin: 'LinkedIn',
	x: 'X',
	github: 'GitHub',
	telegram: 'Telegram',
	whatsapp: 'WhatsApp',
	instagram: 'Instagram',
	facebook: 'Facebook',
	youtube: 'YouTube',
	tiktok: 'TikTok',
	website: 'Website',
	email: 'Email'
};

/**
 * What to render as `href`.
 *
 * `email` is stored as a bare address because that is what someone types, and
 * a `mailto:` typed into a URL field is the kind of detail a form should not
 * make its user remember.
 */
export function socialHref(platform: SocialPlatform, url: string): string {
	return platform === 'email' ? `mailto:${url}` : url;
}

/** What the link points at, for a screen reader: "Selam on LinkedIn". */
export function socialLabel(platform: SocialPlatform, name: string): string {
	return `${name} · ${PLATFORM_LABELS[platform]}`;
}
