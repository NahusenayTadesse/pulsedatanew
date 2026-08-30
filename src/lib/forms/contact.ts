import { z } from 'zod';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, DOCUMENT_TYPES } from './uploads';
import { enquiryTopics } from '$lib/forms/topics';
import * as m from '$lib/paraglide/messages';

/**
 * The contact form's schema.
 *
 * Messages come from paraglide rather than being written inline, so a form
 * filled in Amharic fails in Amharic. That is why this is a function: the
 * message functions read the ambient locale when they are *called*, so building
 * the schema per request captures the right language, while a module-level
 * constant would freeze whichever locale happened to load the module first.
 */
export function contactSchema() {
	return z.object({
		name: z
			.string()
			.trim()
			.min(1, m.validation_name_required())
			.max(200, m.validation_name_too_long()),

		email: z
			.string()
			.trim()
			.min(1, m.validation_email_required())
			.email(m.validation_email_invalid())
			.max(255, m.validation_email_invalid()),

		/**
		 * Deliberately loose. Ethiopian numbers are written `+251 91 234 5678`,
		 * `0912345678` and half a dozen other ways, and a strict pattern would
		 * reject a real number from someone trying to give us their business.
		 * Anything with 7–20 digits and ordinary punctuation is accepted.
		 */
		phone: z
			.string()
			.trim()
			.max(60)
			.regex(/^[+()\d\s-]{7,60}$/, m.validation_phone_invalid())
			.optional()
			.or(z.literal('')),

		company: z.string().trim().max(200).optional().or(z.literal('')),

		topic: z.enum(enquiryTopics, { message: m.validation_topic_invalid() }),

		message: z
			.string()
			.trim()
			.min(1, m.validation_message_required())
			.min(20, m.validation_message_too_short())
			.max(5000, m.validation_message_too_long()),

		/**
		 * Optional, and "optional" has to mean two things.
		 *
		 * A form submitted with the field untouched sends an empty `File` — name
		 * and size zero — not `undefined`, so both have to pass. The refinements
		 * only bite once there are actually bytes to judge, which is why they
		 * test `!file.size` first rather than being written as a plain size and
		 * type check.
		 */
		attachment: z
			.instanceof(File)
			.refine((file) => !file.size || file.size <= MAX_UPLOAD_BYTES, {
				message: m.validation_file_too_large({ mb: String(MAX_UPLOAD_MB) })
			})
			.refine((file) => !file.size || (DOCUMENT_TYPES as readonly string[]).includes(file.type), {
				message: m.validation_file_type()
			})
			.optional(),

		/**
		 * A field no person ever sees, and so one no person ever fills in.
		 *
		 * Cheaper than a captcha and costs a real visitor nothing — a form that
		 * asks an enterprise buyer to identify traffic lights before they can
		 * talk to sales is a form that loses enterprise buyers.
		 */
		website: z.string().max(0).optional()
	});
}

export type ContactSchema = ReturnType<typeof contactSchema>;

export function newsletterSchema() {
	return z.object({
		email: z
			.string()
			.trim()
			.min(1, m.validation_email_required())
			.email(m.validation_email_invalid())
			.max(255),
		website: z.string().max(0).optional()
	});
}
