import type { Snippet } from 'svelte';

/** One column of the dashboard's list table. See `DataTable.svelte`. */
export type Column<Row> = {
	key: string;
	header: string;
	/** Makes the header sortable; returns the value to sort on. */
	sort?: (row: Row) => string | number | null | undefined;
	/** Makes the row findable; returns the text the search box matches against. */
	search?: (row: Row) => string | null | undefined;
	cell: Snippet<[Row]>;
	class?: string;
};
