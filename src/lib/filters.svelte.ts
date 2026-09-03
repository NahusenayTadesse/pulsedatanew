import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import { buildQuery, decodeSelection, isSortOrder, type SortOrder } from '$lib/filters';

/**
 * The filter state an index page holds, kept in step with the address bar.
 *
 * Both public index pages want the same three things — a query, a set of facet
 * selections, a sort order — and want them reflected in the URL so a filtered
 * view can be sent to somebody. This is that, once.
 *
 * **Call it during component initialisation.** It registers an `$effect`, which
 * needs the calling component's context to be torn down with the page; calling
 * it from an event handler would leak one.
 *
 * `replaceState`, not `pushState`: a filter is a view of one page, not a
 * separate destination. Pushing would put an entry in the history for every
 * keystroke and turn the Back button into an undo for typing — thirty presses
 * to leave a page the reader arrived at once.
 *
 * Nothing here re-runs the server load. The page already holds the whole list;
 * the URL is a bookmark, not a query.
 */
export function filterState(keys: string[]) {
	const params = page.url.searchParams;
	const sortParam = params.get('sort');

	const state = $state({
		q: params.get('q') ?? '',
		sort: (isSortOrder(sortParam) ? sortParam : 'newest') as SortOrder,
		/**
		 * Seeded from the URL so a shared link opens filtered, and only for the
		 * keys the page declared — an unknown `?colour=blue` is ignored rather
		 * than becoming a facet nothing can display or clear.
		 */
		facets: Object.fromEntries(
			keys.map((key) => [key, decodeSelection(params.get(key))])
		) as Record<string, string[]>
	});

	$effect(() => {
		const query = buildQuery(state);
		const next = query ? `?${query}` : page.url.pathname;

		// Compared before writing, because this effect re-runs on any state read
		// and `replaceState` with an unchanged URL still churns the history entry.
		if (page.url.search === (query ? `?${query}` : '')) return;

		replaceState(next, page.state);
	});

	return {
		get q() {
			return state.q;
		},
		set q(value: string) {
			state.q = value;
		},
		get sort() {
			return state.sort;
		},
		set sort(value: SortOrder) {
			state.sort = value;
		},
		get facets() {
			return state.facets;
		},

		/** The chips are toggles: clicking a selected one removes it. */
		toggle(key: string, value: string) {
			const current = state.facets[key] ?? [];
			state.facets[key] = current.includes(value)
				? current.filter((entry) => entry !== value)
				: [...current, value];
		},

		selected(key: string) {
			return state.facets[key] ?? [];
		},

		clear() {
			state.q = '';
			state.sort = 'newest';
			for (const key of keys) state.facets[key] = [];
		}
	};
}

export type FilterStore = ReturnType<typeof filterState>;
