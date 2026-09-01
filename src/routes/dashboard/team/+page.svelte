<script lang="ts">
	import { Plus, UserRound } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import type { Column } from '$lib/components/admin/table';
	import { assetUrl } from '$lib/assets';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.members)[number];

	/** True when the about page will actually show portraits — the same rule. */
	const everyoneHasPhoto = $derived(
		data.members.some((member) => member.status === 'published') &&
			data.members
				.filter((member) => member.status === 'published')
				.every((member) => Boolean(member.photo))
	);

	const columns: Column<Row>[] = [
		{
			key: 'name',
			header: m.dash_field_person_name(),
			sort: (row) => row.sortOrder,
			search: (row) => `${row.name} ${row.nameAm ?? ''} ${row.role ?? ''} ${row.roleAm ?? ''}`,
			cell: person
		},
		{ key: 'role', header: m.dash_field_role(), sort: (row) => row.role, cell: role },
		{ key: 'status', header: m.dash_field_status(), sort: (row) => row.status, cell: status },
		{ key: 'actions', header: '', cell: actions, class: 'text-end' }
	];
</script>

{#snippet person(row: Row)}
	<div class="flex items-center gap-3">
		{#if row.photo}
			<img
				src={assetUrl(row.photo)}
				alt=""
				width="32"
				height="32"
				class="size-8 shrink-0 rounded-full border object-cover"
			/>
		{:else}
			<span
				class="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground"
			>
				<UserRound class="size-3.5" aria-hidden="true" />
				<span class="sr-only">{m.dash_no_photo()}</span>
			</span>
		{/if}
		<span class="min-w-0">
			<a
				href={localizeHref(`/dashboard/team/${row.id}`)}
				class="block font-medium hover:text-primary hover:underline"
			>
				{row.name}
			</a>
			<!--
				The translation marker is keyed off the biography, not the name.
				Most Ethiopian names are written the same in both scripts, so
				flagging a missing `name_am` marked every row "English only" and said
				nothing about whether anything actually needed translating.
			-->
			{#if row.nameAm}
				<span class="block text-xs text-muted-foreground" lang="am">{row.nameAm}</span>
			{:else if !row.bioAm && !row.roleAm}
				<span class="block text-xs text-muted-foreground">{m.dash_untranslated()}</span>
			{/if}
		</span>
	</div>
{/snippet}

{#snippet role(row: Row)}
	<span class="text-sm text-muted-foreground">{row.role ?? '—'}</span>
{/snippet}

{#snippet status(row: Row)}
	<StatusBadge status={row.status} />
{/snippet}

{#snippet actions(row: Row)}
	<Button href={localizeHref(`/dashboard/team/${row.id}`)} variant="outline" size="sm">
		{m.dash_edit()}
	</Button>
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="text-sm text-muted-foreground">{m.dash_empty_team()}</p>
		<Button href={localizeHref('/dashboard/team/new')} class="mt-5">
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_member()}
		</Button>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display text-2xl">{m.dash_team()}</h1>
		<Button href={localizeHref('/dashboard/team/new')}>
			<Plus class="size-4" aria-hidden="true" />
			{m.dash_new_member()}
		</Button>
	</div>

	<!--
		Says out loud what the about page is doing, because the rule is otherwise
		invisible: uploading one portrait changes nothing until the last person
		has one, and that is a confusing thing to discover by refreshing the site.
	-->
	{#if data.members.some((member) => member.status === 'published')}
		<p
			class="rounded-md border p-3 text-sm {everyoneHasPhoto
				? 'border-primary/40 bg-primary/5'
				: 'border-brand-gold/40 bg-brand-gold/10'}"
		>
			{everyoneHasPhoto ? m.dash_photos_on() : m.dash_photos_off()}
		</p>
	{/if}

	<DataTable rows={data.members} {columns} {empty} />
</div>
