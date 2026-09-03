import { listProjectsWithServices } from '$lib/server/content';
import type { PageServerLoad } from './$types';

/**
 * Every published case study, each with the modules it delivered.
 *
 * The modules come along because the index filters by them, and filtering by
 * something means having it in the page — see the note in `$lib/filters` on why
 * the whole list is sent rather than queried per filter.
 */
export const load: PageServerLoad = async () => ({ projects: await listProjectsWithServices() });
