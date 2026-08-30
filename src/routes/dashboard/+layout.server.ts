import { count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/guard';
import type { LayoutServerLoad } from './$types';

/**
 * The dashboard shell's data.
 *
 * `requireUser` runs here, which is what protects every page beneath it — a
 * child load cannot render before its parent layout load has resolved, so
 * there is no route under `/dashboard` that can be reached without it. The
 * per-route loads below still query freely; none of them re-checks, because
 * the check that matters already happened.
 */
export const load: LayoutServerLoad = async (event) => {
	const user = requireUser(event);

	// The unread badge, which is the only number the sidebar needs.
	const [unread] = await db
		.select({ total: count() })
		.from(contactSubmissions)
		.where(eq(contactSubmissions.status, 'new'));

	return {
		user: { name: user.name, email: user.email },
		unreadEnquiries: Number(unread.total)
	};
};
