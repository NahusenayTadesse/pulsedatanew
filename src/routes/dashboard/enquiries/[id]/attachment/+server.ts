import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/guard';
import type { RequestHandler } from './$types';

/**
 * The only way to read a contact-form attachment.
 *
 * These are private — somebody's brief or RFP — so they are written to
 * `FILES_DIR/private`, which the public `/files/[name]` route cannot address
 * at all: its matcher admits a bare `uuid.ext` and nothing with a slash. That
 * is the boundary. This endpoint is the single deliberate door through it, and
 * it is behind `requireUser`.
 *
 * The filename is never taken from the request. It is read from the enquiry
 * row named in the URL, so there is no user-supplied path to sanitise and no
 * way to ask for a file that is not attached to the enquiry being viewed.
 */
const PRIVATE_DIR = path.resolve(env.FILES_DIR ?? '.tempFiles', 'private');

export const GET: RequestHandler = async (event) => {
	requireUser(event);

	const id = Number(event.params.id);
	if (!Number.isInteger(id)) error(404);

	const [row] = await db
		.select({
			attachment: contactSubmissions.attachment,
			attachmentName: contactSubmissions.attachmentName
		})
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1);

	if (!row?.attachment) error(404);

	const filePath = path.join(PRIVATE_DIR, row.attachment);

	// Belt and braces. The name came from our own `randomUUID()`, but this is
	// the check that would catch a hand-edited database row.
	const relative = path.relative(PRIVATE_DIR, filePath);
	if (relative.startsWith('..') || path.isAbsolute(relative)) error(403);

	let stats: fs.Stats;
	try {
		stats = fs.statSync(filePath);
	} catch {
		error(404);
	}

	const stream = Readable.toWeb(fs.createReadStream(filePath), {
		strategy: new CountQueuingStrategy({ highWaterMark: 100 })
	});

	return new Response(stream as ReadableStream, {
		headers: {
			// Always a download, never rendered inline: an uploaded document must
			// not execute or display as a page on this origin.
			'Content-Disposition': `attachment; filename="${encodeURIComponent(row.attachmentName ?? row.attachment)}"`,
			'Content-Type': 'application/octet-stream',
			'Content-Length': String(stats.size),
			'X-Content-Type-Options': 'nosniff',
			// Private, and must not sit in a shared proxy or the browser's cache.
			'Cache-Control': 'private, no-store',
			'X-Robots-Tag': 'noindex, nofollow'
		}
	});
};
