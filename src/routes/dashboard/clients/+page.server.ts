import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { clients, projects } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	/*
	 * In the order the band will show them, drafts included — this is the
	 * editing list, and a logo being unpublished (permission not yet confirmed,
	 * say) is precisely when it is most likely to need finding.
	 *
	 * The join is left, not inner: most clients have no case study, and an inner
	 * join would drop every one of them from the screen that lists them.
	 */
	clients: await db
		.select({
			id: clients.id,
			name: clients.name,
			nameAm: clients.nameAm,
			logo: clients.logo,
			note: clients.note,
			noteAm: clients.noteAm,
			websiteUrl: clients.websiteUrl,
			projectName: projects.name,
			status: clients.status,
			sortOrder: clients.sortOrder,
			updatedAt: clients.updatedAt
		})
		.from(clients)
		.leftJoin(projects, eq(clients.projectId, projects.id))
		.orderBy(asc(clients.sortOrder), asc(clients.id))
});
