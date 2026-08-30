import { asc, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	projects: await db
		.select({
			id: projects.id,
			slug: projects.slug,
			name: projects.name,
			nameAm: projects.nameAm,
			client: projects.client,
			industry: projects.industry,
			year: projects.year,
			status: projects.status,
			featured: projects.featured,
			sortOrder: projects.sortOrder,
			updatedAt: projects.updatedAt
		})
		.from(projects)
		// The index's own order, so the list reads the way the site does.
		.orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.updatedAt))
});
