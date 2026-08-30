import { listProjects } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ projects: await listProjects() });
