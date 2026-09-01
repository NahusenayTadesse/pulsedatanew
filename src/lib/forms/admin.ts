import { z } from 'zod';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from './uploads';
import { socialPlatforms } from '$lib/social';

/**
 * The dashboard's write schemas.
 *
 * Shared by the browser and the action, as the public forms' are. Two rules
 * run through all of it:
 *
 * 1. **English is required, Amharic is not.** `pick()` in `$lib/i18n` falls
 *    back to English when a translation is missing, so a half-translated post
 *    renders correctly and the gap is visible on the form. Requiring both would
 *    mean nothing could be published until someone had time to translate it,
 *    which is how bilingual sites end up with an empty second language.
 *
 * 2. **Empty strings become null.** An HTML form posts `""` for an untouched
 *    optional field, and a column full of empty strings is indistinguishable
 *    from a column full of deliberate blanks — `isTranslated()` on the front
 *    end reads `""` as "translated into nothing".
 */

/** `""` from an untouched input becomes `undefined`, which the action stores as null. */
const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || undefined)
		.optional();

/**
 * A URL slug.
 *
 * Validated rather than generated from the title, because it is the permanent
 * public address of the page: deriving it from a title that later gets edited
 * would either break every existing link or silently stop matching the title.
 * The dashboard suggests one from the title and lets it be corrected.
 */
const slug = z
	.string()
	.trim()
	.min(1, 'A slug is required.')
	.max(191)
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		'Use lower-case letters, numbers and hyphens — for example "erp-for-multi-branch".'
	);

const status = z.enum(['draft', 'published']);

/**
 * An optional image upload.
 *
 * The empty `File` an untouched file input posts must pass, exactly as on the
 * contact form — and an image that is left alone means "keep the current one",
 * which is what every action here does with a missing file.
 */
const optionalImage = z
	.instanceof(File)
	.refine((file) => !file.size || file.size <= MAX_UPLOAD_BYTES, {
		message: `Images must be under ${MAX_UPLOAD_MB} MB.`
	})
	.refine((file) => !file.size || file.type.startsWith('image/'), {
		message: 'That file is not an image.'
	})
	.optional();

/**
 * A date from an `<input type="date">`, which posts `""` or `YYYY-MM-DD`.
 *
 * Parsed here rather than in the action so an unparseable value is a field
 * error next to the input instead of a 500 from the driver.
 */
const optionalDate = z
	.string()
	.trim()
	.transform((value) => (value ? new Date(value) : undefined))
	.refine((value) => !value || !Number.isNaN(value.getTime()), 'That is not a valid date.')
	.optional();

export function postSchema() {
	return z.object({
		slug,
		status,
		featured: z.coerce.boolean().default(false),
		publishedAt: optionalDate,

		title: z.string().trim().min(1, 'A title is required.').max(255),
		titleAm: optionalText(255),

		excerpt: optionalText(600),
		excerptAm: optionalText(600),

		body: z.string().trim().min(1, 'The article needs a body.'),
		bodyAm: z
			.string()
			.trim()
			.transform((value) => value || undefined)
			.optional(),

		category: optionalText(120),
		categoryAm: optionalText(120),
		author: optionalText(160),
		authorAm: optionalText(160),

		coverImageAlt: optionalText(255),
		coverImageAltAm: optionalText(255),
		coverImage: optionalImage,

		/**
		 * Empty means "estimate it from the body" — see `readingMinutes`.
		 *
		 * Preprocessed rather than written as `.optional().or(z.literal(''))`.
		 * That union is what an empty number input actually posts, but Superforms
		 * cannot parse a union out of FormData unless the whole form is submitted
		 * as JSON — it throws "Unions are only supported when the dataType option
		 * is set to json" and the action 500s. Normalising the empty string to
		 * `undefined` before validation keeps the schema a plain optional number.
		 */
		readingMinutes: z.preprocess(
			(value) =>
				value === '' || value === null || value === undefined ? undefined : Number(value),
			z.number().int().min(1).max(300).optional()
		),

		/** Present when editing; absent when creating. */
		id: z.coerce.number().int().positive().optional()
	});
}

export function projectSchema() {
	return z.object({
		slug,
		status,
		featured: z.coerce.boolean().default(false),
		sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
		publishedAt: optionalDate,

		name: z.string().trim().min(1, 'A project name is required.').max(255),
		nameAm: optionalText(255),
		client: optionalText(255),
		clientAm: optionalText(255),
		industry: optionalText(160),
		industryAm: optionalText(160),
		year: optionalText(32),

		summary: optionalText(600),
		summaryAm: optionalText(600),

		body: z
			.string()
			.trim()
			.transform((value) => value || undefined)
			.optional(),
		bodyAm: z
			.string()
			.trim()
			.transform((value) => value || undefined)
			.optional(),

		/** Same shape as `readingMinutes` above, and for the same reason. */
		websiteUrl: z.preprocess(
			(value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
			z
				.string()
				.trim()
				.max(500)
				.url('That is not a complete web address — include https://.')
				.optional()
		),

		coverImageAlt: optionalText(255),
		coverImageAltAm: optionalText(255),
		coverImage: optionalImage,
		clientLogo: optionalImage,

		/**
		 * The repeaters. Rows whose required field is blank are dropped rather
		 * than rejected: the form always renders one empty row to type into, and
		 * refusing to save because of it would be the form failing at its own
		 * affordance.
		 */
		services: z
			.array(z.object({ label: z.string().trim().max(160), labelAm: z.string().trim().max(160) }))
			.default([]),

		outcomes: z
			.array(
				z.object({
					value: z.string().trim().max(80),
					label: z.string().trim().max(200),
					labelAm: z.string().trim().max(200)
				})
			)
			.default([]),

		id: z.coerce.number().int().positive().optional()
	});
}

export function teamSchema() {
	return z.object({
		status,
		sortOrder: z.coerce.number().int().min(0).max(9999).default(0),

		name: z.string().trim().min(1, 'A name is required.').max(200),
		nameAm: optionalText(200),
		role: optionalText(200),
		roleAm: optionalText(200),
		bio: optionalText(1200),
		bioAm: optionalText(1200),

		photo: optionalImage,
		photoAlt: optionalText(255),
		photoAltAm: optionalText(255),

		/**
		 * The social profiles.
		 *
		 * Rows are checked one at a time in `superRefine` rather than by typing
		 * `url` as `z.string().url()`, because the repeater always renders a blank
		 * row to type into — a plain `.url()` would fail the whole form on a row
		 * nobody touched. A row with no address is dropped by the action; a row
		 * with one has to be a real address.
		 */
		links: z
			.array(
				z.object({
					platform: z.enum(socialPlatforms),
					url: z.string().trim().max(500)
				})
			)
			.default([])
			.superRefine((rows, ctx) => {
				rows.forEach((row, index) => {
					if (!row.url) return;

					const ok =
						row.platform === 'email'
							? z.email().safeParse(row.url).success
							: z.url().safeParse(row.url).success;

					if (!ok) {
						ctx.addIssue({
							code: 'custom',
							path: [index, 'url'],
							message:
								row.platform === 'email'
									? 'That is not an email address.'
									: 'That is not a complete web address — include https://.'
						});
					}
				});
			}),

		id: z.coerce.number().int().positive().optional()
	});
}

export type TeamInput = z.infer<ReturnType<typeof teamSchema>>;

export type PostInput = z.infer<ReturnType<typeof postSchema>>;
export type ProjectInput = z.infer<ReturnType<typeof projectSchema>>;

/** Turns a title into a usable slug. Used by the dashboard to suggest one. */
export function slugify(input: string): string {
	return (
		input
			.toLowerCase()
			.normalize('NFKD')
			// Ge'ez has no romanisation we could apply here, so an Amharic title
			// produces nothing and the field is simply left for the writer. That is
			// the honest outcome: an ASCII slug guessed from Amharic would be wrong.
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 191)
	);
}
