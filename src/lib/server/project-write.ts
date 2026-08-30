import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { projectOutcomes, projectServices } from '$lib/server/db/schema';
import { withContent } from '$lib/server/admin';
import type { ProjectInput } from '$lib/forms/admin';

/**
 * Writes a project's child rows.
 *
 * Replaced wholesale rather than diffed. These are two short ordered lists
 * edited as a unit in one repeater each, so working out which rows moved,
 * which changed and which went is a lot of machinery to arrive at the same
 * result as deleting and re-inserting six rows. If either list ever grows an
 * id that something else references, this has to become a real diff.
 *
 * The delete and insert are one transaction: a failure between them would
 * leave a published case study with its modules list emptied, which is worse
 * than the save failing outright.
 */
export async function writeChildren(projectId: number, input: ProjectInput) {
	const services = withContent(input.services ?? [], 'label');
	const outcomes = withContent(input.outcomes ?? [], 'value');

	await db.transaction(async (tx) => {
		await tx.delete(projectServices).where(eq(projectServices.projectId, projectId));
		await tx.delete(projectOutcomes).where(eq(projectOutcomes.projectId, projectId));

		if (services.length) {
			await tx.insert(projectServices).values(
				services.map((service, index) => ({
					projectId,
					label: service.label,
					labelAm: service.labelAm || null,
					sortOrder: index
				}))
			);
		}

		if (outcomes.length) {
			await tx.insert(projectOutcomes).values(
				outcomes.map((outcome, index) => ({
					projectId,
					value: outcome.value,
					// An outcome with a figure but no description is still meaningful
					// on the page; the label column allows it and so does this.
					label: outcome.label || '',
					labelAm: outcome.labelAm || null,
					sortOrder: index
				}))
			);
		}
	});
}
