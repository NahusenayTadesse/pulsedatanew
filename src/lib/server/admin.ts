import { and, eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { posts, projects } from '$lib/server/db/schema';
import { deleteUploadedFile, saveUploadedFile } from '$lib/server/upload';

/**
 * Shared write helpers for the dashboard.
 *
 * The two content forms do the same three awkward things — check a slug is
 * free, replace an image without orphaning the old one, normalise blanks to
 * null — and getting any of them subtly different between posts and projects
 * is how the two screens drift apart.
 */

/**
 * Is this slug already taken by another row?
 *
 * Checked before the insert rather than catching the unique-constraint error,
 * because the error arrives as a driver code with no field attached and would
 * surface as "something went wrong" on a form where the actual problem — this
 * exact word is already used by another article — is worth saying plainly.
 */
export async function slugTaken(
	table: typeof posts | typeof projects,
	slug: string,
	excludeId?: number
) {
	const [row] = await db
		.select({ id: table.id })
		.from(table)
		.where(excludeId ? and(eq(table.slug, slug), ne(table.id, excludeId)) : eq(table.slug, slug))
		.limit(1);
	return Boolean(row);
}

/**
 * Stores a newly uploaded image and returns the filename to save.
 *
 * An untouched file input posts an empty `File`, which means "keep what is
 * there" — so `current` comes back unchanged. When a replacement *is* uploaded
 * the previous file is removed, because a company site that quietly
 * accumulates every superseded hero image fills its disk with nothing anyone
 * can see or reach.
 *
 * The delete is deliberately last and deliberately swallowed: losing the new
 * image because the old one had already been removed by hand would be a much
 * worse outcome than one orphaned file.
 */
export async function replaceImage(
	file: File | undefined,
	current: string | null
): Promise<string | null> {
	if (!file || file.size === 0) return current;

	const stored = await saveUploadedFile(file);
	if (current) await deleteUploadedFile(current).catch(() => {});
	return stored;
}

/** `undefined` and `""` both become `null`, which is what the columns mean. */
export const orNull = <T>(value: T | undefined | '' | null): T | null =>
	value === undefined || value === '' || value === null ? null : value;

/**
 * Drops repeater rows the user never filled in.
 *
 * The forms always render one blank row to type into, so an untouched
 * repeater posts a row of empty strings. Rejecting the save because of it
 * would be the form failing at its own affordance.
 */
export const withContent = <T extends Record<string, string>>(rows: T[], required: keyof T) =>
	rows.filter((row) => row[required]?.trim());
