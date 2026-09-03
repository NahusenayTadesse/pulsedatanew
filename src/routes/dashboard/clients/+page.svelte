<script lang="ts">
	import { ExternalLink, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import type { Column } from '$lib/components/admin/table';
	import { assetUrl } from '$lib/assets';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.clients)[number];

	const columns: Column<Row>[] = [
		{
			key: 'client',
			header: m.dash_field_client_name(),
			sort: (row) => row.sortOrder,
			search: (row) =>
				`${row.name} ${row.nameAm ?? ''} ${row.note ?? ''} ${row.noteAm ?? ''} ${row.projectName ?? ''}`,
			cell: client
		},
		{ key: 'note', header: m.dash_field_client_note(), cell: note },
		{ key: 'status', header: m.dash_field_status(), sort: (row) => row.status, cell: status },
		{ key: 'actions', header: '', cell: actions, class: 'text-end' }
	];
</script>

{#snippet client(row: Row)}
	<div class="flex items-center gap-3">
		<!--
			Contained, not cropped, and on a light square: a logo is a shape, and
			`object-cover` would cut the ends off a wordmark. The white ground is
			there because most client marks are drawn for light backgrounds and
			would vanish against a dark dashboard.
		-->
		<img
			src={assetUrl(row.logo)}
			alt=""
			width="40"
			height="40"
			class="size-10 shrink-0 rounded-md border bg-white object-contain p-1"
		/>
		<span class="min-w-0">
			<a
				href={localizeHref(`/dashboard/clients/${row.id}`)}
				class="block font-medium hover:text-primary hover:underline"
			>
				{row.name}
			</a>
			{#if row.projectName}
				<span class="block text-xs text-muted-foreground">{row.projectName}</span>
			{/if}
			<!-- Keyed off the note, as the testimonial list's marker is keyed off the
			     quote: a company name is very often written the same in both scripts,
			     so flagging a missing `name_am` would mark every row and say nothing. -->
			{#if row.note && !row.noteAm}
				<span class="block text-xs text-muted-foreground">{m.dash_untranslated()}</span>
			{/if}
		</span>
	</div>
{/snippet}

{#snippet note(row: Row)}
	{#if row.note}
		<p class="line-clamp-2 max-w-md text-sm text-muted-foreground">{row.note}</p>
	{/if}
	{#if row.websiteUrl}
		<a
			href={row.websiteUrl}
			target="_blank"
			rel="noreferrer noopener"
			class="mt-1 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
		>
			<ExternalLink class="size-3" aria-hidden="true" />
			{row.websiteUrl.replace(/^https?:\/\//, '')}
		</a>
	{/if}
{/snippet}

{#snippet status(row: Row)}
	<StatusBadge status={row.status} />
{/snippet}

{#snippet actions(row: Row)}
	<Button href={localizeHref(`/dashboard/clients/${row.id}`)} variant="outline" size="sm">
		{m.dash_edit()}
	</Button>
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="text-sm text-muted-foreground">{m.dash_empty_clients()}</p>
		<Button href={localizeHref('/dashboard/clients/new')} class="mt-5">
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_client()}
		</Button>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display text-2xl">{m.dash_clients()}</h1>
		<Button href={localizeHref('/dashboard/clients/new')}>
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_client()}
		</Button>
	</div>

	<p class="max-w-2xl text-sm text-muted-foreground">{m.dash_clients_intro()}</p>

	<DataTable rows={data.clients} {columns} {empty} />
</div>
