import { listCompanyLinks } from '$lib/server/content';
import type { LayoutServerLoad } from './$types';

/**
 * The company's social profiles, for the footer.
 *
 * Loaded in the layout because the footer is in the layout: pulling it into
 * every page's own load would be the same query written six times, and a page
 * that forgot it would render a footer missing its icons.
 *
 * One small unfiltered read of a table that holds a handful of rows, and it
 * runs alongside the page's own load rather than before it — SvelteKit runs
 * layout and page loads concurrently — so it costs nothing a page waits on.
 */
export const load: LayoutServerLoad = async () => ({
	companyLinks: await listCompanyLinks()
});
