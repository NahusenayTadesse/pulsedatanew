<script lang="ts">
	import { ImageOff, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import type { Column } from '$lib/components/admin/table';
	import { assetUrl } from '$lib/assets';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.quotes)[number];

	const columns: Column<Row>[] = [
		{
			key: 'author',
			header: m.dash_field_quote_author(),
			sort: (row) => row.sortOrder,
			search: (row) =>
				`${row.authorName} ${row.authorNameAm ?? ''} ${row.company ?? ''} ${row.companyAm ?? ''} ${row.projectName ?? ''} ${row.quote}`,
			cell: author
		},
		{ key: 'quote', header: m.dash_field_quote(), cell: quote },
		{ key: 'status', header: m.dash_field_status(), sort: (row) => row.status, cell: status },
		{ key: 'actions', header: '', cell: actions, class: 'text-end' }
	];
</script>

{#snippet author(row: Row)}
	<div class="flex items-center gap-3">
		{#if row.logo}
			<!-- Contained, not cropped: a logo is a shape, and `object-cover` would
			     cut the ends off a wordmark. -->
			<img
				src={assetUrl(row.logo)}
				alt=""
				width="32"
				height="32"
				class="size-8 shrink-0 rounded-md border bg-background object-contain p-1"
			/>
		{:else}
			<span
				class="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground"
			>
				<ImageOff class="size-3.5" aria-hidden="true" />
				<span class="sr-only">{m.dash_no_logo()}</span>
			</span>
		{/if}
		<span class="min-w-0">
			<a
				href={localizeHref(`/dashboard/testimonials/${row.id}`)}
				class="block font-medium hover:text-primary hover:underline"
			>
				{row.authorName}
			</a>
			{#if row.company}
				<span class="block text-xs text-muted-foreground">{row.company}</span>
			{/if}
			<!--
				Keyed off the quote, as the team list's marker is keyed off the
				biography: a name is very often written the same in both scripts, so
				flagging a missing `author_name_am` would mark every row and say
				nothing about whether there is anything left to translate.
			-->
			{#if !row.quoteAm}
				<span class="block text-xs text-muted-foreground">{m.dash_untranslated()}</span>
			{/if}
		</span>
	</div>
{/snippet}

{#snippet quote(row: Row)}
	<p class="line-clamp-2 max-w-md text-sm text-muted-foreground">{row.quote}</p>
	{#if row.projectName}
		<!-- Says where else the quote appears, which is otherwise only visible by
		     opening it. -->
		<p class="mt-1 font-mono text-xs text-muted-foreground">{row.projectName}</p>
	{/if}
{/snippet}

{#snippet status(row: Row)}
	<StatusBadge status={row.status} />
{/snippet}

{#snippet actions(row: Row)}
	<Button href={localizeHref(`/dashboard/testimonials/${row.id}`)} variant="outline" size="sm">
		{m.dash_edit()}
	</Button>
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="text-sm text-muted-foreground">{m.dash_empty_testimonials()}</p>
		<Button href={localizeHref('/dashboard/testimonials/new')} class="mt-5">
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_testimonial()}
		</Button>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display text-2xl">{m.dash_testimonials()}</h1>
		<Button href={localizeHref('/dashboard/testimonials/new')}>
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_testimonial()}
		</Button>
	</div>

	<p class="max-w-2xl text-sm text-muted-foreground">{m.dash_testimonials_intro()}</p>

	<DataTable rows={data.quotes} {columns} {empty} />
</div>
