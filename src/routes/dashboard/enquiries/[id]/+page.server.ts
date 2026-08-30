import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404);

	const [enquiry] = await db
		.select()
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1);

	if (!enquiry) error(404);

	/*
	 * Opening an enquiry marks it read.
	 *
	 * Not awaited, and failures are swallowed: the page is already rendered
	 * from the row above, and a write that fails should not turn reading a
	 * message into an error page. The worst case is a badge that stays up and
	 * gets cleared on the next open.
	 */
	if (enquiry.status === 'new') {
		db.update(contactSubmissions)
			.set({ status: 'read' })
			.where(eq(contactSubmissions.id, id))
			.catch(() => {});
	}

	return { enquiry };
};

export const actions: Actions = {
	status: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();
		const status = String(data.get('status'));

		// The value comes from a form field, so it is checked against the list
		// rather than trusted — the column is an enum and MySQL would otherwise
		// coerce an unknown value to an empty string rather than refuse it.
		if (!(STATUSES as readonly string[]).includes(status)) {
			return fail(400, { message: 'Unknown status.' });
		}

		await db
			.update(contactSubmissions)
			.set({ status: status as (typeof STATUSES)[number] })
			.where(eq(contactSubmissions.id, id));

		return { success: true };
	}
};
