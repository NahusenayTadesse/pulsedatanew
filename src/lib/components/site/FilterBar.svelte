<script lang="ts">
	import { Search, X, SlidersHorizontal } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';
	import { isSortOrder, type FilterGroup, type SortOrder } from '$lib/filters';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The search box, chip filters and sort control above an index page.
	 *
	 * Shared by the blog and the case-study list rather than written twice,
	 * because the two are the same interaction over different columns and the
	 * only way two copies stay identical is by not existing.
	 *
	 * It holds no state of its own beyond which groups are expanded. The page
	 * owns `q`, the selections and the sort, because the page is also what syncs
	 * them to the URL — a control that quietly kept its own copy would be a
	 * second source of truth and the two would drift the first time someone
	 * pressed Back.
	 *
	 * Everything here is a real control: the chips are `<button aria-pressed>`,
	 * not divs with click handlers, so they are reachable by keyboard and
	 * announced as toggles. The count is a live region, because on a page where
	 * typing silently removes cards the only feedback a screen-reader user gets
	 * is the one we announce.
	 */

	let {
		q = $bindable(''),
		sort = $bindable('newest'),
		groups = [],
		onToggle,
		onClear,
		shown,
		total,
		placeholder = '',
		/** Facets past this many are behind "show all", per group. */
		collapseAfter = 8
	}: {
		q?: string;
		sort?: SortOrder;
		groups?: FilterGroup[];
		/** Called with the group's key and the chip's value. The page owns the list. */
		onToggle: (key: string, value: string) => void;
		onClear: () => void;
		shown: number;
		total: number;
		placeholder?: string;
		collapseAfter?: number;
	} = $props();

	/** Which groups the reader has expanded. Keyed by group, so one stays open. */
	let expanded = $state<Record<string, boolean>>({});

	const active = $derived(
		Boolean(q.trim()) || groups.some((group) => group.selected.length > 0) || sort !== 'newest'
	);

	const sortItems = $derived([
		{ value: 'newest', name: m.filter_sort_newest() },
		{ value: 'oldest', name: m.filter_sort_oldest() },
		{ value: 'az', name: m.filter_sort_az() }
	]);

	/**
	 * The chips to draw for a group.
	 *
	 * A selected facet is always shown even when it sits past the fold of a
	 * collapsed group: hiding the filter that is currently narrowing the page
	 * would leave a reader unable to find the control that turns it off.
	 */
	function visibleFacets(group: FilterGroup) {
		if (expanded[group.key] || group.facets.length <= collapseAfter) return group.facets;

		const head = group.facets.slice(0, collapseAfter);
		const selectedTail = group.facets
			.slice(collapseAfter)
			.filter((facet) => group.selected.includes(facet.value));

		return [...head, ...selectedTail];
	}
</script>

<div class="space-y-6">
	<!-- Search and sort share a row on a wide screen and stack on a phone. -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="relative min-w-0 flex-1 basis-64">
			<Search
				class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<Input
				type="search"
				class="h-11 ps-10 pe-10"
				{placeholder}
				aria-label={placeholder || m.filter_search()}
				bind:value={q}
			/>
			{#if q}
				<!--
					Our own clear button rather than the one `type="search"` gives
					you: WebKit's is invisible in a dark theme and Firefox draws none
					at all, so on two of three browsers the box could only be emptied
					with the keyboard.
				-->
				<button
					type="button"
					onclick={() => (q = '')}
					class="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<X class="size-4" aria-hidden="true" />
					<span class="sr-only">{m.filter_clear_search()}</span>
				</button>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<SlidersHorizontal class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<!--
				`Select.Root` directly rather than `SelectComp`, which binds a plain
				`string`: `sort` is the narrower `SortOrder`, and a two-way binding
				between the two would let any string be written back into it. One-way
				value in, `onValueChange` out, with the guard on the way — which is
				the shape a widened type wants anyway.
			-->
			<Select.Root
				type="single"
				value={sort}
				onValueChange={(value) => {
					if (isSortOrder(value)) sort = value;
				}}
			>
				<Select.Trigger id="filter-sort" aria-label={m.filter_sort()} class="h-11 w-44">
					{sortItems.find((item) => item.value === sort)?.name}
				</Select.Trigger>
				<Select.Content>
					{#each sortItems as item (item.value)}
						<Select.Item value={item.value} label={item.name}>{item.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	{#each groups as group (group.key)}
		{#if group.facets.length > 1}
			<!--
				A `fieldset` with a `legend`, because that is what a group of related
				toggles is: it gives every chip in the row an accessible name that
				says which axis it filters on, so "Payroll" is heard as "Module,
				Payroll" rather than as a bare word among thirty others.
			-->
			<fieldset class="space-y-3">
				<legend class="eyebrow text-muted-foreground">{group.legend}</legend>
				<div class="flex flex-wrap gap-2">
					<!-- "All" is the way back to unfiltered, and shows the selection is off. -->
					<button
						type="button"
						aria-pressed={group.selected.length === 0}
						onclick={() => group.selected.forEach((value) => onToggle(group.key, value))}
						class={cn(
							'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
							group.selected.length === 0
								? 'border-primary bg-primary text-primary-foreground'
								: 'hover:border-primary/60 hover:text-primary'
						)}
					>
						{m.filter_all()}
					</button>

					{#each visibleFacets(group) as facet (facet.value)}
						{@const on = group.selected.includes(facet.value)}
						<button
							type="button"
							aria-pressed={on}
							onclick={() => onToggle(group.key, facet.value)}
							class={cn(
								'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
								on
									? 'border-primary bg-primary text-primary-foreground'
									: 'hover:border-primary/60 hover:text-primary'
							)}
						>
							{facet.label}
							<!--
								The count is decoration for a screen reader — the live region
								below already says how many results there are, and hearing
								"Payroll 4" on every chip is noise on the way to the one you
								want.
							-->
							<span
								class={cn(
									'font-mono text-[0.6875rem]',
									on ? 'text-primary-foreground/70' : 'text-muted-foreground'
								)}
								aria-hidden="true"
							>
								{facet.count}
							</span>
						</button>
					{/each}

					{#if group.facets.length > collapseAfter}
						<button
							type="button"
							onclick={() => (expanded[group.key] = !expanded[group.key])}
							class="rounded-full px-3.5 py-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							{expanded[group.key]
								? m.filter_show_less()
								: m.filter_show_all({ count: String(group.facets.length) })}
						</button>
					{/if}
				</div>
			</fieldset>
		{/if}
	{/each}

	<div class="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
		<!--
			`aria-live="polite"`, because filtering rewrites the page silently: a
			sighted reader sees the grid shrink as they type, and this is the only
			equivalent anyone else gets. Polite rather than assertive so it waits
			for a pause in typing instead of interrupting every keystroke.
		-->
		<p class="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
			{active
				? m.filter_showing({ shown: String(shown), total: String(total) })
				: m.filter_total({ total: String(total) })}
		</p>

		{#if active}
			<Button variant="ghost" size="sm" onclick={onClear}>
				<X class="size-3.5" aria-hidden="true" />
				{m.filter_clear_all()}
			</Button>
		{/if}
	</div>
</div>
