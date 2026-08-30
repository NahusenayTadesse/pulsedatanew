/**
 * The URL for a stored upload.
 *
 * Columns hold the bare filename `saveUploadedFile` returned, never a path, so
 * the route that serves them can move without a migration. Anything that
 * already looks like a URL is passed through untouched, which is what lets a
 * seeded row point at a file in `static/` while real uploads point at `/files`.
 */
export function assetUrl(name: string | null | undefined): string | null {
	if (!name) return null;
	if (/^(https?:)?\/\//.test(name) || name.startsWith('/')) return name;
	return `/files/${name}`;
}
