import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	// The message body is left out on purpose: this is a list of who wrote and
	// when, and pulling every enquiry's full text to render a table of names
	// would grow the payload with the inbox.
	enquiries: await db
		.select({
			id: contactSubmissions.id,
			name: contactSubmissions.name,
			email: contactSubmissions.email,
			company: contactSubmissions.company,
			topic: contactSubmissions.topic,
			status: contactSubmissions.status,
			locale: contactSubmissions.locale,
			attachment: contactSubmissions.attachment,
			createdAt: contactSubmissions.createdAt
		})
		.from(contactSubmissions)
		.orderBy(desc(contactSubmissions.createdAt))
});
