import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { teamMembers } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	/*
	 * In the order the about page will show them, drafts included — this is the
	 * editing list, and a member being unpublished is precisely when they are
	 * most likely to need finding.
	 */
	members: await db
		.select({
			id: teamMembers.id,
			name: teamMembers.name,
			nameAm: teamMembers.nameAm,
			roleAm: teamMembers.roleAm,
			bioAm: teamMembers.bioAm,
			role: teamMembers.role,
			photo: teamMembers.photo,
			status: teamMembers.status,
			sortOrder: teamMembers.sortOrder,
			updatedAt: teamMembers.updatedAt
		})
		.from(teamMembers)
		.orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id))
});
