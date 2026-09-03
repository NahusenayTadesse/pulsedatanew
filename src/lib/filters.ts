/**
 * Search, faceting and URL state for the two public index pages.
 *
 * Everything here runs in the browser over a list the server already sent
 * whole. That is a deliberate choice and the same one `DataTable` makes on the
 * dashboard, for a reason that is stronger in public: a company blog and a
 * case-study list are tens of rows, not thousands, so a round trip per
 * keystroke would be slower than filtering in memory *and* would mean the page
 * renders nothing useful before JavaScript arrives. Sending the full list means
 * a crawler — and a reader whose JavaScript failed — gets every post, which is
 * exactly what an index page owes them. When the blog outgrows this the filter
 * moves to the server and these signatures stay the same.
 *
 * Nothing in this module may import from `$lib/server`: it is loaded into the
 * browser bundle by both index pages.
 */

/**
 * Text prepared for comparison.
 *
 * `toLowerCase` then NFKD with the combining marks stripped, which folds
 * `café` onto `cafe` so a search for one finds the other. Ge'ez is untouched by
 * all of it — it is caseless and its characters are not decomposable — which is
 * correct rather than a gap: Amharic text compares as itself.
 */
export function normalise(value: string): string {
	return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * Does this row match what was typed?
 *
 * Every whitespace-separated word must appear somewhere in the row's searchable
 * text, in any order — so "erp payroll" finds a post titled "Payroll in a
 * multi-branch ERP". Requiring the words as one phrase would fail that, and
 * matching *any* word would return the whole blog for a two-word query.
 *
 * `haystack` is built by the caller from **both** language columns regardless
 * of which one is being displayed, so a reader browsing in Amharic who types an
 * English product name still finds the post. Search is a way of getting to
 * something you know exists; refusing to find it because it was typed in the
 * other script would be the site being pedantic at the reader's expense.
 */
export function matchesQuery(haystack: string, query: string): boolean {
	const needle = normalise(query);
	if (!needle) return true;

	const hay = normalise(haystack);
	return needle.split(/\s+/).every((word) => hay.includes(word));
}

/** Joins a row's searchable columns, dropping the nulls, into one string. */
export const searchText = (...parts: (string | null | undefined)[]): string =>
	parts.filter(Boolean).join(' ');

export type Facet = {
	/** The stable identity, matched against the URL and the row. Always the English value. */
	value: string;
	/** What the reader sees — the Amharic label when there is one. */
	label: string;
	count: number;
};

/**
 * The distinct values of one column, each with how many rows carry it.
 *
 * Keyed on the English value and never on the translated one, because the key
 * goes in the URL: `?category=Operations` has to mean the same thing in both
 * languages or a shared link would break when the recipient reads in the other.
 * The label is the translated form, so the chip reads correctly either way.
 *
 * Sorted by count and then alphabetically. Most-used first is what a reader
 * scanning a chip row wants, and the alphabetical tiebreak keeps the order
 * stable rather than letting it depend on which rows happened to load.
 */
export function facetsOf<Row>(
	rows: Row[],
	read: (row: Row) => { value: string | null | undefined; label: string } | null | undefined
): Facet[] {
	const found = new Map<string, Facet>();

	for (const row of rows) {
		const entry = read(row);
		const value = entry?.value?.trim();
		if (!entry || !value) continue;

		const existing = found.get(value);
		if (existing) {
			existing.count += 1;
		} else {
			found.set(value, { value, label: entry.label.trim() || value, count: 1 });
		}
	}

	return [...found.values()].sort(
		(a, b) => b.count - a.count || a.label.localeCompare(b.label, undefined, { numeric: true })
	);
}

/**
 * The same, for a column that holds several values per row — a project's
 * modules. One row contributes at most one to each facet's count, so a case
 * study that somehow lists "Payroll" twice does not count as two.
 */
export function multiFacetsOf<Row>(
	rows: Row[],
	read: (row: Row) => { value: string | null | undefined; label: string }[]
): Facet[] {
	const found = new Map<string, Facet>();

	for (const row of rows) {
		const seen = new Set<string>();

		for (const entry of read(row)) {
			const value = entry.value?.trim();
			if (!value || seen.has(value)) continue;
			seen.add(value);

			const existing = found.get(value);
			if (existing) {
				existing.count += 1;
			} else {
				found.set(value, { value, label: entry.label.trim() || value, count: 1 });
			}
		}
	}

	return [...found.values()].sort(
		(a, b) => b.count - a.count || a.label.localeCompare(b.label, undefined, { numeric: true })
	);
}

/**
 * One row of filter chips, as `FilterBar` draws it.
 *
 * Declared here rather than in the component because a type exported from a
 * Svelte instance script is not reachable by the pages that build these, and
 * the shape belongs with the functions that produce it either way.
 */
export type FilterGroup = {
	/** The URL key this group writes to — `category`, `industry`, `service`. */
	key: string;
	/** The group's heading, e.g. "Topic". */
	legend: string;
	facets: Facet[];
	selected: string[];
};

/**
 * A facet selection, as it travels in the URL.
 *
 * Comma-separated rather than a repeated key. Both are valid, but one
 * `?service=Payroll,Inventory` is what a person copying a link out of the
 * address bar can read and edit, and it keeps a three-facet URL to one line.
 * Values containing a comma are dropped rather than escaped — no industry or
 * module name has one, and a scheme nobody can round-trip by hand is worse than
 * a rule the dashboard can follow.
 */
export const encodeSelection = (values: string[]): string =>
	values.filter((value) => value && !value.includes(',')).join(',');

export const decodeSelection = (raw: string | null): string[] =>
	(raw ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);

/**
 * Whether a row survives a facet selection.
 *
 * An empty selection passes everything — "no filter" and "all filters" have to
 * mean the same thing, or clearing a chip row would empty the page. Several
 * selected values are OR'd: picking Payroll *and* Inventory means "case studies
 * involving either", which is what a reader clicking a second chip expects.
 * AND across two *different* facets, OR within one, is the convention every
 * faceted list uses and the only one that does not dead-end at zero results.
 */
export const passesFacet = (
	selected: string[],
	rowValues: (string | null | undefined)[]
): boolean => selected.length === 0 || rowValues.some((value) => value && selected.includes(value));

/** The sort orders the index pages offer. */
export const sortOrders = ['newest', 'oldest', 'az'] as const;
export type SortOrder = (typeof sortOrders)[number];

export const isSortOrder = (value: string | null): value is SortOrder =>
	sortOrders.includes(value as SortOrder);

/**
 * Builds the query string for the current filter state.
 *
 * Defaults are omitted rather than written out, so an unfiltered page has a
 * clean URL and the "is anything filtered?" test is simply whether this comes
 * back empty. Keys are added in a fixed order so the same state always produces
 * the same string — otherwise `replaceState` would rewrite the URL on every
 * keystroke with a differently-ordered but identical query.
 */
export function buildQuery(state: {
	q?: string;
	sort?: SortOrder;
	facets?: Record<string, string[]>;
}): string {
	const params = new URLSearchParams();

	const q = state.q?.trim();
	if (q) params.set('q', q);

	for (const [key, values] of Object.entries(state.facets ?? {})) {
		const encoded = encodeSelection(values);
		if (encoded) params.set(key, encoded);
	}

	if (state.sort && state.sort !== 'newest') params.set('sort', state.sort);

	return params.toString();
}
