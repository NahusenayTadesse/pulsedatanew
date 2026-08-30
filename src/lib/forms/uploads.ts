/**
 * Upload limits and image-compression settings.
 *
 * This module is imported by both sides on purpose. The zod schemas run in the
 * browser as well as on the server, and `FileUpload` compresses before a byte
 * goes over the wire — neither can import `$lib/server/upload`, so the ceiling
 * they all enforce is declared here and imported by that module too. One
 * number, one place; a form that accepts a file the server would reject is a
 * bug you only find in production.
 */

/** 8 MB. Large enough for a scanned RFP, small enough not to be a weapon. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

/**
 * What a contact-form attachment may be: a brief, a spec, a requirements doc.
 * Images are excluded — nobody attaches a photograph to an ERP enquiry, and
 * every format here is inert.
 */
export const DOCUMENT_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'text/plain',
	'text/csv'
] as const;

export const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv';

/**
 * Passed to `browser-image-compression`. A 1600px longest edge is enough for a
 * full-bleed case-study image on a 2x display and cuts a phone photo by an
 * order of magnitude before it is ever uploaded.
 */
export const IMAGE_COMPRESSION = {
	maxSizeMB: 1.5,
	maxWidthOrHeight: 1600,
	useWebWorker: true,
	fileType: 'image/webp'
} as const;

/** The name a compressed image is stored under, since its type changed. */
export function webpName(original: string): string {
	const dot = original.lastIndexOf('.');
	return `${dot === -1 ? original : original.slice(0, dot)}.webp`;
}
