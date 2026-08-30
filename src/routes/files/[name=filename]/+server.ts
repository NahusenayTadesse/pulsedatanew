import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { env } from '$env/dynamic/private';
import { getCachedStats } from '$lib/server/fileCache';

/**
 * Serves the public uploads.
 *
 * Everything reachable here is public by construction: private uploads are
 * written to `FILES_DIR/private`, and the `filename` matcher admits only a
 * bare `uuid.ext`, so no request to this route can name that subdirectory
 * however it is encoded. That leaves this handler with no access rule to
 * enforce and none to get wrong.
 */

const FILES_DIR = path.resolve(env.FILES_DIR ?? '.tempFiles');

if (!fs.existsSync(FILES_DIR)) {
	fs.mkdirSync(FILES_DIR, { recursive: true });
}

/**
 * Only these render in the browser; anything else downloads.
 *
 * An uploaded SVG or HTML file is script that would otherwise run on our own
 * origin. `.svg` is already refused at upload, but forcing the download here
 * means a stored file can never execute as a page even if that list changes.
 */
const inlineSafe = (mimeType: string) =>
	mimeType === 'application/pdf' ||
	(mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') ||
	mimeType.startsWith('video/') ||
	mimeType.startsWith('audio/');

/** Headers every response carries, whether full or partial. */
const securityHeaders = (mimeType: string, name: string) => ({
	'Content-Disposition': inlineSafe(mimeType)
		? `inline; filename="${encodeURIComponent(name)}"`
		: `attachment; filename="${encodeURIComponent(name)}"`,
	'X-Content-Type-Options': 'nosniff'
});

// ---------------------------------------------------------------------------
// Cache-Control policy per file type
// ---------------------------------------------------------------------------
const CACHE_TTL: Record<string, string> = {
	immutable: 'public, max-age=31536000, immutable',
	long: 'public, max-age=86400',
	short: 'public, max-age=600',
	none: 'no-store'
};

function cacheControl(ext: string): string {
	if (['webp', 'png', 'jpg', 'jpeg', 'avif', 'mp4', 'webm', 'mp3'].includes(ext))
		return CACHE_TTL.long;
	if (['pdf', 'txt'].includes(ext)) return CACHE_TTL.short;
	return CACHE_TTL.none;
}

// ---------------------------------------------------------------------------
// Range header parser
// ---------------------------------------------------------------------------
function parseRange(header: string, size: number): { start: number; end: number } | null {
	const match = header.match(/^bytes=(\d*)-(\d*)$/);
	if (!match) return null;

	let start = match[1] === '' ? NaN : Number(match[1]);
	let end = match[2] === '' ? NaN : Number(match[2]);

	if (isNaN(start) && isNaN(end)) return null;

	if (isNaN(start)) {
		// suffix: bytes=-500
		start = Math.max(0, size - end);
		end = size - 1;
	} else if (isNaN(end)) {
		// open-ended: bytes=500-
		end = size - 1;
	}

	if (start > end || end >= size) return null;
	return { start, end };
}

// ---------------------------------------------------------------------------
// MIME types
// ---------------------------------------------------------------------------

/**
 * The one place a filename is turned into an extension, so the Cache-Control
 * policy and the MIME lookup can't disagree — they used to parse the same
 * string separately. Returns '' when there is no extension.
 */
function extensionOf(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

/*
 * The map and its lookup are one object in the original this was ported from,
 * which does not type: `lookup` is a function sitting in what is otherwise a
 * `Record<string, string>`. Splitting them keeps the same call site and lets
 * the index signature mean what it says.
 */
const mimes: Record<string, string> = {
	// Text
	txt: 'text/plain',
	pdf: 'application/pdf',
	// Images
	webp: 'image/webp',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	avif: 'image/avif',
	// Audio
	mp3: 'audio/mpeg',
	// Video
	webm: 'video/webm',
	mp4: 'video/mp4'
};

const mimeLookup = (s: string): string => {
	const ext = extensionOf(s);
	// Own-property + typeof guards, because:
	//  - `(ext && this[ext]) ?? fallback` returned '' for a name ending in
	//    '.', since ?? doesn't catch the empty string — the response then
	//    carried an empty Content-Type and browsers fell back to sniffing;
	//  - an unguarded index hit this map's own `lookup` method (and
	//    Object.prototype keys), so "x.lookup" stringified a function into
	//    the header.
	if (!ext || !Object.prototype.hasOwnProperty.call(mimes, ext)) {
		return 'application/octet-stream';
	}
	return mimes[ext];
};

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET({ params, request }: { params: { name: string }; request: Request }) {
	// Security: prevent path traversal
	const file_path = path.resolve(FILES_DIR, params.name);
	const relative = path.relative(FILES_DIR, file_path);
	if (relative.startsWith('..') || path.isAbsolute(relative)) {
		return new Response('forbidden', { status: 403 });
	}

	// Stat (with cache)
	const stats = getCachedStats(file_path);
	if (!stats) return new Response('not found', { status: 404 });

	const ext = extensionOf(params.name);
	const mimeType = mimeLookup(params.name);
	const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;
	const lastMod = stats.mtime.toUTCString();

	// Conditional requests
	if (request.headers.get('if-none-match') === etag) {
		return new Response(null, { status: 304 });
	}
	const ifModifiedSince = request.headers.get('if-modified-since');
	if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
		return new Response(null, { status: 304 });
	}

	// Range requests (audio/video seeking)
	const rangeHeader = request.headers.get('range');
	if (rangeHeader) {
		const range = parseRange(rangeHeader, stats.size);
		if (!range) {
			return new Response('range not satisfiable', {
				status: 416,
				headers: { 'Content-Range': `bytes */${stats.size}` }
			});
		}
		const { start, end } = range;
		const stream = Readable.toWeb(fs.createReadStream(file_path, { start, end }), {
			strategy: new CountQueuingStrategy({ highWaterMark: 100 })
		});
		return new Response(stream as ReadableStream, {
			status: 206,
			headers: {
				'Content-Range': `bytes ${start}-${end}/${stats.size}`,
				'Content-Length': String(end - start + 1),
				'Content-Type': mimeType,
				'Accept-Ranges': 'bytes',
				'Cache-Control': cacheControl(ext),
				'Last-Modified': lastMod,
				ETag: etag,
				...securityHeaders(mimeType, params.name)
			}
		});
	}

	// Full response
	const stream = Readable.toWeb(fs.createReadStream(file_path), {
		strategy: new CountQueuingStrategy({ highWaterMark: 100 })
	});
	return new Response(stream as ReadableStream, {
		headers: {
			'Content-Type': mimeType,
			'Content-Length': String(stats.size),
			'Cache-Control': cacheControl(ext),
			'Last-Modified': lastMod,
			'Accept-Ranges': 'bytes',
			ETag: etag,
			...securityHeaders(mimeType, params.name)
		}
	});
}
