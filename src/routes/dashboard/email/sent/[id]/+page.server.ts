import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactSubmissions, sentEmails } from '$lib/server/db/schema';
import { localizeHref } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const [email] = await db.select().from(sentEmails).where(eq(sentEmails.id, id)).limit(1);
	if (!email) error(404);

	/*
	 * The enquiry is looked up rather than joined, and only to confirm it still
	 * exists: `enquiry_id` is deliberately not a foreign key, so it can point at
	 * a row somebody has since deleted. Linking to a 404 is worse than showing
	 * the reply without a link back.
	 */
	let enquiry: { id: number; name: string } | null = null;

	if (email.enquiryId) {
		const [row] = await db
			.select({ id: contactSubmissions.id, name: contactSubmissions.name })
			.from(contactSubmissions)
			.where(eq(contactSubmissions.id, email.enquiryId))
			.limit(1);
		enquiry = row ?? null;
	}

	return { email, enquiry };
};

export const actions: Actions = {
	/**
	 * Deletes one record.
	 *
	 * The row holds a recipient's address and the text of a message, so being
	 * able to remove it is part of holding it responsibly — and the mail itself
	 * has long since been delivered, so nothing about the world changes here.
	 */
	delete: async ({ params }) => {
		const id = Number(params.id);
		if (!Number.isInteger(id)) return fail(400);

		await db.delete(sentEmails).where(eq(sentEmails.id, id));
		redirect(303, localizeHref('/dashboard/email/sent'));
	}
};
