<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from 'svelte';
	import type { Column } from './table';
	import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The dashboard's list table.
	 *
	 * Deliberately not the 400-line tanstack table from `../dana`. That one
	 * carries PDF export, resizable panes, column visibility menus and a mobile
	 * split view — all of which earn their place in a shop's order history and
	 * none of which three admin screens with tens of rows will ever use.
	 *
	 * What is here is what those screens actually need: search, sortable
	 * headers, and pagination that only appears once there is more than one page
	 * of anything. Sorting and filtering happen in the browser because the whole
	 * table is already in memory — a company that has published a thousand blog
	 * posts can move this to the server, and until then a round trip per click
	 * would be slower and more code.
	 */
	let {
		rows,
		columns,
		pageSize = 15,
		empty,
		searchPlaceholder = ''
	}: {
		rows: T[];
		columns: Column<T>[];
		pageSize?: number;
		empty?: Snippet;
		searchPlaceholder?: string;
	} = $props();

	let query = $state('');
	let sortKey = $state<string | null>(null);
	let sortAsc = $state(true);
	let page = $state(1);

	const searchable = $derived(columns.filter((column) => column.search));

	const filtered = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return rows;
		return rows.filter((row) =>
			searchable.some((column) => (column.search?.(row) ?? '').toLowerCase().includes(needle))
		);
	});

	const sorted = $derived.by(() => {
		const column = columns.find((c) => c.key === sortKey);
		if (!column?.sort) return filtered;

		// A copy, because sorting the derived array in place would mutate the
		// filtered result and make the sort order depend on how often it ran.
		return [...filtered].sort((a, b) => {
			const left = column.sort!(a);
			const right = column.sort!(b);

			// Empty values sort last in both directions: a row missing a date is
			// not "the oldest", it is unknown, and burying it under the reversal
			// is what someone scanning the list expects.
			if (left == null && right == null) return 0;
			if (left == null) return 1;
			if (right == null) return -1;

			const order =
				typeof left === 'number' && typeof right === 'number'
					? left - right
					: String(left).localeCompare(String(right), undefined, { numeric: true });

			return sortAsc ? order : -order;
		});
	});

	const pages = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));
	// Clamped rather than reset: filtering down to fewer pages while on page 4
	// should land on the last page, not silently show an empty table.
	const current = $derived(Math.min(page, pages));
	const visible = $derived(sorted.slice((current - 1) * pageSize, current * pageSize));

	function toggleSort(column: Column<T>) {
		if (!column.sort) return;
		if (sortKey === column.key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = column.key;
			sortAsc = true;
		}
		page = 1;
	}
</script>

{#if rows.length === 0}
	{@render empty?.()}
{:else}
	<div class="space-y-4">
		{#if searchable.length}
			<div class="relative max-w-sm">
				<Search
					class="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					type="search"
					class="ps-9"
					placeholder={searchPlaceholder || m.dash_search()}
					aria-label={m.dash_search()}
					bind:value={query}
					oninput={() => (page = 1)}
				/>
			</div>
		{/if}

		<div class="overflow-x-auto rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						{#each columns as column (column.key)}
							<Table.Head class={column.class}>
								{#if column.sort}
									<button
										type="button"
										class="inline-flex items-center gap-1 font-medium hover:text-foreground"
										onclick={() => toggleSort(column)}
										aria-label="{column.header}: sort"
									>
										{column.header}
										{#if sortKey !== column.key}
											<ChevronsUpDown class="size-3 opacity-40" aria-hidden="true" />
										{:else if sortAsc}
											<ChevronUp class="size-3" aria-hidden="true" />
										{:else}
											<ChevronDown class="size-3" aria-hidden="true" />
										{/if}
									</button>
								{:else}
									{column.header}
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each visible as row, index (index)}
						<Table.Row>
							{#each columns as column (column.key)}
								<Table.Cell class={column.class}>{@render column.cell(row)}</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="py-10 text-center text-muted-foreground">
								{m.dash_no_results()}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
			<span>{m.dash_rows({ count: String(sorted.length), total: String(rows.length) })}</span>

			{#if pages > 1}
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={current <= 1}
						onclick={() => (page = current - 1)}
					>
						{m.dash_previous()}
					</Button>
					<span>{m.dash_page({ page: String(current), pages: String(pages) })}</span>
					<Button
						variant="outline"
						size="sm"
						disabled={current >= pages}
						onclick={() => (page = current + 1)}
					>
						{m.dash_next()}
					</Button>
				</div>
			{/if}
		</div>
	</div>
{/if}
