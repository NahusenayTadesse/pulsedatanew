<script lang="ts">
	import { ExternalLink, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import { formatDate } from '$lib/components/admin/format';
	import type { Column } from '$lib/components/admin/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.posts)[number];

	const columns: Column<Row>[] = [
		{
			key: 'title',
			header: m.dash_field_title(),
			sort: (row) => row.title,
			search: (row) => `${row.title} ${row.titleAm ?? ''} ${row.slug}`,
			cell: title
		},
		{
			key: 'category',
			header: m.dash_field_category(),
			sort: (row) => row.category,
			cell: category
		},
		{ key: 'status', header: m.dash_field_status(), sort: (row) => row.status, cell: status },
		{
			key: 'publishedAt',
			header: m.dash_field_published_at(),
			// Sorted on the timestamp, displayed as a date: sorting the formatted
			// string would order "1 March" before "2 February".
			sort: (row) => (row.publishedAt ? new Date(row.publishedAt).getTime() : null),
			cell: published
		},
		{ key: 'actions', header: '', cell: actions, class: 'text-end' }
	];
</script>

{#snippet title(row: Row)}
	<a
		href={localizeHref(`/dashboard/blogs/${row.id}`)}
		class="font-medium hover:text-primary hover:underline"
	>
		{row.title}
	</a>
	{#if row.titleAm}
		<span class="mt-0.5 block text-xs text-muted-foreground" lang="am">{row.titleAm}</span>
	{:else}
		<span class="mt-0.5 block text-xs text-muted-foreground">{m.dash_untranslated()}</span>
	{/if}
{/snippet}

{#snippet category(row: Row)}
	<span class="text-sm text-muted-foreground">{row.category ?? '—'}</span>
{/snippet}

{#snippet status(row: Row)}
	<StatusBadge status={row.status} featured={row.featured} />
{/snippet}

{#snippet published(row: Row)}
	<span class="font-mono text-xs text-muted-foreground">{formatDate(row.publishedAt)}</span>
{/snippet}

{#snippet actions(row: Row)}
	<div class="flex items-center justify-end gap-1">
		{#if row.status === 'published'}
			<Button
				href={localizeHref(`/blogs/${row.slug}`)}
				target="_blank"
				variant="ghost"
				size="icon"
				title={m.dash_view_site()}
			>
				<ExternalLink class="size-3.5" aria-hidden="true" />
				<span class="sr-only">{m.dash_view_site()}</span>
			</Button>
		{/if}
		<Button href={localizeHref(`/dashboard/blogs/${row.id}`)} variant="outline" size="sm">
			{m.dash_edit()}
		</Button>
	</div>
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="text-sm text-muted-foreground">{m.dash_empty_blogs()}</p>
		<Button href={localizeHref('/dashboard/blogs/new')} class="mt-5">
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_article()}
		</Button>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display text-2xl">{m.dash_blogs()}</h1>
		<Button href={localizeHref('/dashboard/blogs/new')}>
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_article()}
		</Button>
	</div>

	<DataTable rows={data.posts} {columns} {empty} />
</div>
