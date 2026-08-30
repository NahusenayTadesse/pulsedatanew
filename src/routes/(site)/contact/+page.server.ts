import { fail } from '@sveltejs/kit';
import { and, eq, gte, sql } from 'drizzle-orm';
import { message, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import { contactSchema } from '$lib/forms/contact';
import { saveUploadedFile, deleteUploadedFile, UploadError } from '$lib/server/upload';
import { getLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

/** Enquiries accepted from one address in an hour before we stop recording them. */
const RATE_LIMIT = 5;

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(contactSchema()));

	/**
	 * The topic starts unanswered.
	 *
	 * Superforms defaults a zod enum to its first member, which would arrive as
	 * "ERP implementation" already chosen — so every enquiry from someone who
	 * never looked at the field would be filed as an ERP enquiry, and the column
	 * would be worthless. Blanking it shows the placeholder instead and makes
	 * the schema's own "Please choose a topic" do its job.
	 */
	form.data.topic = '' as typeof form.data.topic;

	return { form };
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const form = await superValidate(request, zod4(contactSchema()));

		// The honeypot: answered as success, written nowhere. See the schema.
		if (form.data.website) return withFiles(message(form, m.contact_success_body()));

		if (!form.valid) return fail(400, withFiles({ form }));

		const ipAddress = getClientAddress();

		/**
		 * A flood check, not a security boundary.
		 *
		 * One address filling the table is the realistic abuse of a public form
		 * with no captcha behind it. A determined sender gets past this; what it
		 * stops is a script making the inbox useless. Returning success is
		 * deliberate — a rejection message is a signal to try differently.
		 */
		const [{ recent }] = await db
			.select({ recent: sql<number>`COUNT(*)` })
			.from(contactSubmissions)
			.where(
				and(
					eq(contactSubmissions.ipAddress, ipAddress),
					gte(contactSubmissions.createdAt, sql`DATE_SUB(NOW(), INTERVAL 1 HOUR)`)
				)
			);

		if (Number(recent) >= RATE_LIMIT) {
			return withFiles(message(form, m.contact_success_body()));
		}

		/**
		 * The attachment is written before the row, so a failed insert would
		 * leave an orphaned file. That is why the write is unwound below rather
		 * than left: an orphan is invisible and accumulates, and the alternative
		 * — writing the row first — would mean a row pointing at a file that does
		 * not exist, which is worse.
		 */
		let attachment: string | null = null;

		try {
			if (form.data.attachment && form.data.attachment.size > 0) {
				attachment = await saveUploadedFile(form.data.attachment, { private: true });
			}

			await db.insert(contactSubmissions).values({
				name: form.data.name,
				email: form.data.email.toLowerCase(),
				phone: form.data.phone || null,
				company: form.data.company || null,
				topic: form.data.topic,
				message: form.data.message,
				locale: getLocale(),
				attachment,
				attachmentName: form.data.attachment?.name ?? null,
				ipAddress,
				userAgent: request.headers.get('user-agent')?.slice(0, 500) ?? null
			});
		} catch (err) {
			if (attachment) await deleteUploadedFile(attachment, { private: true }).catch(() => {});

			if (err instanceof UploadError) {
				return fail(400, withFiles({ form, uploadError: err.message }));
			}

			console.error('[contact] failed to record submission', err);
			return fail(500, withFiles({ form, serverError: true }));
		}

		return withFiles(message(form, m.contact_success_body()));
	}
};
