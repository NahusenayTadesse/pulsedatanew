// src/lib/server/upload.ts
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { env } from '$env/dynamic/private';
import { randomUUID } from 'crypto';
import { invalidateStatCache } from '$lib/server/fileCache';
import { MAX_UPLOAD_BYTES as MAX_BYTES } from '$lib/forms/uploads';

const FILES_DIR = path.resolve(env.FILES_DIR ?? '.tempFiles');

/**
 * Uploads that must never be served.
 *
 * A contact-form attachment is somebody's brief or RFP — private, unlike the
 * marketing imagery this module otherwise stores. Rather than give `/files`
 * an access rule to get wrong, private uploads go somewhere the route cannot
 * address at all: `/files/[name=filename]` matches a bare `uuid.ext` only, so
 * no request can name a subdirectory, and there is no second route that reads
 * this one. Reaching these files means reaching the server's filesystem.
 */
const PRIVATE_DIR = path.join(FILES_DIR, 'private');

/* ensure folders exist once, at module load */
for (const dir of [FILES_DIR, PRIVATE_DIR]) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * The ceiling on a single upload.
 *
 * Declared in `$lib/forms/uploads` rather than here because the zod schema
 * applies the same limit in code the browser also builds, and it cannot import
 * a `$lib/server` module.
 */
export { MAX_UPLOAD_BYTES } from '$lib/forms/uploads';

/**
 * Extensions we are willing to write to disk.
 *
 * Deliberately permissive — this covers product/blog imagery, customer TIN
 * documents and spreadsheets, and the media the /files route streams — because
 * the point of the check is to reject executable and script-bearing uploads,
 * not to police document formats.
 *
 * `.svg` is excluded on purpose: SVG is script-bearing, and serving one back
 * from our own origin would be a stored-XSS vector. Use PNG/WEBP for logos.
 */
const ALLOWED_EXTENSIONS = new Set([
	// images
	'.png',
	'.jpg',
	'.jpeg',
	'.webp',
	'.avif',
	'.gif',
	// documents
	'.pdf',
	'.txt',
	'.csv',
	'.doc',
	'.docx',
	'.xls',
	'.xlsx',
	// media
	'.mp3',
	'.mp4',
	'.webm'
]);

export class UploadError extends Error {}

/**
 * Save an uploaded file and return the stored file name.
 *
 * @param file  File object coming from formData
 * @returns     The generated file name (with extension) that was written to disk
 * @throws      {UploadError} if no file was supplied or its type isn't allowed
 * @throws      If the write itself fails
 */
export async function saveUploadedFile(
	file: File | undefined | null,
	options: { private?: boolean } = {}
): Promise<string> {
	// The signature has always advertised `undefined`, but `path.extname(undefined)`
	// throws a bare TypeError and `file.stream()` was unguarded — so callers that
	// trusted the type got a 500 instead of a usable error.
	if (!file || typeof file.stream !== 'function') {
		throw new UploadError('No file was provided to upload.');
	}

	const ext = path.extname(file.name ?? '').toLowerCase();
	if (!ALLOWED_EXTENSIONS.has(ext)) {
		throw new UploadError(
			`Files of type "${ext || 'unknown'}" can't be uploaded. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}.`
		);
	}

	// The dynamic form's schema enforces this too, but not every caller passes
	// through one, and an endpoint that streams an unbounded body to disk is a
	// way to fill the volume.
	if (file.size > MAX_BYTES) {
		throw new UploadError(`Files must be under ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`);
	}

	// The stored name is a UUID, so a hostile original filename can't traverse
	// out of FILES_DIR or collide with an existing file.
	const fileName = `${randomUUID()}${ext}`;
	const target = path.join(options.private ? PRIVATE_DIR : FILES_DIR, fileName);

	// Node's fromWeb types are narrower than the DOM ReadableStream that File
	// exposes; they are the same object at runtime.
	const nodeStream = Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]);

	try {
		await pipeline(nodeStream, fs.createWriteStream(target));
	} catch (err) {
		// A partial file left behind by a failed write would be served as a
		// truncated response by /files/[name].
		await fsp.rm(target, { force: true }).catch(() => {});
		throw err;
	}

	// Must match the key /files/[name] caches under, which is
	// path.resolve(FILES_DIR, <fileName>). This previously passed
	// path.resolve(FILES_DIR, target) — with target ALREADY containing
	// FILES_DIR — producing ".../.tempFiles/.tempFiles/<name>", a key that
	// could never match, so invalidation silently did nothing.
	invalidateStatCache(target);

	return fileName; // store this string in your DB
}

/**
 * Remove a previously stored upload by the file name saveUploadedFile returned.
 * Used to clean up when the DB write that would have referenced it rolls back.
 * Missing files are not an error — the goal state is "not on disk".
 */
export async function deleteUploadedFile(
	fileName: string,
	options: { private?: boolean } = {}
): Promise<void> {
	const dir = options.private ? PRIVATE_DIR : FILES_DIR;
	// Defend against a caller passing through something attacker-influenced:
	// only ever touch a plain file directly inside FILES_DIR.
	const target = path.resolve(dir, fileName);
	const relative = path.relative(dir, target);
	if (relative.startsWith('..') || path.isAbsolute(relative) || relative.includes(path.sep)) {
		throw new UploadError('Refusing to delete a path outside the uploads directory.');
	}

	await fsp.rm(target, { force: true });
	invalidateStatCache(target);
}
