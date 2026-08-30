import { error } from '@sveltejs/kit';
import { getProject, otherProjects } from '$lib/server/content';
import { renderRichText } from '$lib/server/richtext';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const project = await getProject(params.slug);
	if (!project) error(404);

	const related = await otherProjects(project.id);

	/**
	 * Both languages are rendered on the server, not one.
	 *
	 * The alternative is rendering only the current locale, which would mean a
	 * language switch on a case study becomes a round trip to re-render the same
	 * page's other half. Two markdown parses of a document this size cost far
	 * less than that, and the sanitiser only ever runs where it can be trusted.
	 */
	return {
		project,
		related,
		bodyHtml: renderRichText(project.body),
		bodyHtmlAm: renderRichText(project.bodyAm)
	};
};
