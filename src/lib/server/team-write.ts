import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { teamMemberLinks } from '$lib/server/db/schema';
import type { TeamInput } from '$lib/forms/admin';

/**
 * Writes one member's social links.
 *
 * Replaced wholesale, exactly as a project's modules are and for the same
 * reason: it is one short ordered list edited as a unit, and nothing else
 * references these ids. Rows with no address are the repeater's trailing blank
 * and are dropped rather than rejected.
 *
 * The delete and insert share a transaction so a failure between them cannot
 * leave a published profile with its links emptied.
 */
export async function writeMemberLinks(memberId: number, links: TeamInput['links']) {
	const rows = (links ?? []).filter((link) => link.url.trim());

	await db.transaction(async (tx) => {
		await tx.delete(teamMemberLinks).where(eq(teamMemberLinks.memberId, memberId));

		if (rows.length) {
			await tx.insert(teamMemberLinks).values(
				rows.map((link, index) => ({
					memberId,
					platform: link.platform,
					url: link.url.trim(),
					sortOrder: index
				}))
			);
		}
	});
}
