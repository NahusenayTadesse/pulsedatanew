import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * Every unrecognised public URL, so that it renders the site's own 404.
 *
 * A route that exists only to fail: matching is what puts the request inside
 * the `(site)` group, which is what gives the error page the header, the
 * footer and the links onward. `src/params/publicpath.ts` decides what counts
 * as public — the dashboard and the endpoints are excluded and keep falling
 * through to the root error page.
 *
 * The status is a real 404, so crawlers and monitoring see what they should.
 */
export const load: PageLoad = () => error(404);
