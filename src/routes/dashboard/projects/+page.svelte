<script lang="ts">
	import { ExternalLink, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import type { Column } from '$lib/components/admin/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.projects)[number];

	const columns: Column<Row>[] = [
		{
			key: 'name',
			header: m.dash_field_name(),
			sort: (row) => row.name,
			search: (row) => `${row.name} ${row.nameAm ?? ''} ${row.client ?? ''} ${row.slug}`,
			cell: name
		},
		{ key: 'client', header: m.dash_field_client(), sort: (row) => row.client, cell: client },
		{ key: 'year', header: m.dash_field_year(), sort: (row) => row.year, cell: year },
		{ key: 'status', header: m.dash_field_status(), sort: (row) => row.status, cell: status },
		{ key: 'actions', header: '', cell: actions, class: 'text-end' }
	];
</script>

{#snippet name(row: Row)}
	<a
		href={localizeHref(`/dashboard/projects/${row.id}`)}
		class="font-medium hover:text-primary hover:underline"
	>
		{row.name}
	</a>
	{#if row.nameAm}
		<span class="mt-0.5 block text-xs text-muted-foreground" lang="am">{row.nameAm}</span>
	{:else}
		<span class="mt-0.5 block text-xs text-muted-foreground">{m.dash_untranslated()}</span>
	{/if}
{/snippet}

{#snippet client(row: Row)}
	<span class="text-sm text-muted-foreground">{row.client ?? '—'}</span>
{/snippet}

{#snippet year(row: Row)}
	<span class="font-mono text-xs text-muted-foreground">{row.year ?? '—'}</span>
{/snippet}

{#snippet status(row: Row)}
	<StatusBadge status={row.status} featured={row.featured} />
{/snippet}

{#snippet actions(row: Row)}
	<div class="flex items-center justify-end gap-1">
		{#if row.status === 'published'}
			<Button
				href={localizeHref(`/projects/${row.slug}`)}
				target="_blank"
				variant="ghost"
				size="icon"
				title={m.dash_view_site()}
			>
				<ExternalLink class="size-3.5" aria-hidden="true" />
				<span class="sr-only">{m.dash_view_site()}</span>
			</Button>
		{/if}
		<Button href={localizeHref(`/dashboard/projects/${row.id}`)} variant="outline" size="sm">
			{m.dash_edit()}
		</Button>
	</div>
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="mx-auto max-w-sm text-sm text-muted-foreground">{m.dash_empty_projects()}</p>
		<Button href={localizeHref('/dashboard/projects/new')} class="mt-5">
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_project()}
		</Button>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display text-2xl">{m.dash_projects()}</h1>
		<Button href={localizeHref('/dashboard/projects/new')}>
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_project()}
		</Button>
	</div>

	<DataTable rows={data.projects} {columns} {empty} />
</div>
