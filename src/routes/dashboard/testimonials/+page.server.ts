import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { projects, testimonials } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	/*
	 * In the order the home page will show them, drafts included — this is the
	 * editing list, and a quote being unpublished is precisely when it is most
	 * likely to need finding.
	 */
	quotes: await db
		.select({
			id: testimonials.id,
			quote: testimonials.quote,
			quoteAm: testimonials.quoteAm,
			authorName: testimonials.authorName,
			authorNameAm: testimonials.authorNameAm,
			authorRole: testimonials.authorRole,
			authorRoleAm: testimonials.authorRoleAm,
			company: testimonials.company,
			companyAm: testimonials.companyAm,
			logo: testimonials.logo,
			photo: testimonials.photo,
			/*
			 * A left join, not an inner one: most quotes are not tied to a case
			 * study, and an inner join would quietly drop every one of them from
			 * the screen that exists to list them.
			 */
			projectName: projects.name,
			status: testimonials.status,
			sortOrder: testimonials.sortOrder,
			updatedAt: testimonials.updatedAt
		})
		.from(testimonials)
		.leftJoin(projects, eq(testimonials.projectId, projects.id))
		.orderBy(asc(testimonials.sortOrder), asc(testimonials.id))
});
