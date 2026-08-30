/**
 * Matches only the names `saveUploadedFile` produces: a UUID and an extension.
 *
 * Deliberately much stricter than "any non-slash string". Every servable file
 * is written under this shape, so nothing legitimate is excluded — and the
 * strictness is what keeps `/files/:name` from ever addressing a subdirectory.
 * Private uploads live in `FILES_DIR/private`, and with no `/` and no `.`
 * admissible here, no request to this route can name one however it is encoded.
 *
 * @type {import('@sveltejs/kit').ParamMatcher}
 */
export function match(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/.test(
		value
	);
}
