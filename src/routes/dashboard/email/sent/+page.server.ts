import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sentEmails } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	/*
	 * The bodies are deliberately not selected. A list of two hundred messages
	 * would otherwise carry two hundred rendered emails — several megabytes of
	 * HTML — to draw a table of subjects. The detail page reads the one it needs.
	 */
	emails: await db
		.select({
			id: sentEmails.id,
			recipient: sentEmails.recipient,
			subject: sentEmails.subject,
			kind: sentEmails.kind,
			status: sentEmails.status,
			sentBy: sentEmails.sentBy,
			attachments: sentEmails.attachments,
			createdAt: sentEmails.createdAt
		})
		.from(sentEmails)
		.orderBy(desc(sentEmails.createdAt))
		.limit(500)
});
