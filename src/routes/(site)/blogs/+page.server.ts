import { listPosts } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = await listPosts();
	// The lead article: whichever is flagged, else the most recent.
	const [lead, ...rest] = [...posts].sort((a, b) => Number(b.featured) - Number(a.featured));
	return { lead: lead ?? null, rest };
};
