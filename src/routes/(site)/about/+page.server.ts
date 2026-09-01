import { listTeam } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const team = await listTeam();

	return {
		team,
		/*
		 * All or nothing.
		 *
		 * Photographs appear only when every published member has one. A grid of
		 * three faces and one monogram does not read as a team — it reads as a
		 * missing image, and the person without a portrait is the one it reads
		 * badly for. Deciding once, here, also keeps the markup from branching per
		 * card.
		 */
		showPhotos: team.length > 0 && team.every((member) => Boolean(member.photo))
	};
};
