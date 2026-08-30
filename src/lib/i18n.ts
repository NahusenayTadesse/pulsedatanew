import { getLocale } from '$lib/paraglide/runtime';

/**
 * Reads the right half of a bilingual database row.
 *
 * Every translatable column in `schema.ts` has an `*_am` twin, which may be
 * null when nobody has translated that row yet. Rather than let a half-filled
 * post render as a blank page, an empty Amharic value falls back to English:
 * a visitor reading in Amharic sees the English text, which is worth far more
 * than white space, and the gap is visible to whoever fills it in.
 *
 * ```ts
 * pick(post.title, post.titleAm)      // current locale
 * pick(post.title, post.titleAm, 'am') // a specific one
 * ```
 */
export function pick<T extends string>(
	en: T | null | undefined,
	am: T | null | undefined,
	locale: string = getLocale()
): T | '' {
	if (locale === 'am') {
		const trimmed = am?.trim();
		if (trimmed) return am as T;
	}
	return (en ?? '') as T | '';
}

/**
 * Whether a row has a real translation for the current locale.
 *
 * Lets a page mark text that fell back — useful while Amharic is still being
 * written, and the only way to tell "translated" from "identical in both".
 */
export function isTranslated(am: string | null | undefined, locale: string = getLocale()) {
	return locale !== 'am' || Boolean(am?.trim());
}
