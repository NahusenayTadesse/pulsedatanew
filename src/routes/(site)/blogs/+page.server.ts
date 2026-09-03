import { listPosts } from '$lib/server/content';
import type { PageServerLoad } from './$types';

/**
 * Every published post, in one read.
 *
 * The lead article used to be split out here. It is chosen on the page now,
 * because the page also filters: once a reader has typed a search or picked a
 * topic there is no "lead" any more, only results, and a server that had
 * already removed one post from the list would have hidden it from the search.
 *
 * The whole list goes to the browser deliberately — see the note at the top of
 * `$lib/filters`. A company blog is tens of rows, and sending all of them is
 * what lets the filtering be instant and the page still make sense with no
 * JavaScript at all.
 */
export const load: PageServerLoad = async () => ({ posts: await listPosts() });
