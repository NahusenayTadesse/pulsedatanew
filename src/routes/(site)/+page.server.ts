import { listClients, listPosts, listProjects, listTestimonials } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Independent reads, so they go out together rather than one after the other.
	const [projects, posts, testimonials, clients] = await Promise.all([
		listProjects(2),
		listPosts(3),
		listTestimonials(3),
		listClients()
	]);
	return { projects, posts, testimonials, clients };
};
