<script lang="ts">
	import { Paperclip } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import EnquiryStatus from '$lib/components/admin/EnquiryStatus.svelte';
	import { formatDateTime } from '$lib/components/admin/format';
	import type { Column } from '$lib/components/admin/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { cn } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.enquiries)[number];

	const topicLabels: Record<string, () => string> = {
		erp: m.topic_erp,
		website: m.topic_website,
		demo: m.topic_demo,
		support: m.topic_support,
		partnership: m.topic_partnership,
		other: m.topic_other
	};

	/**
	 * Three views over the same rows, not three queries.
	 *
	 * "Demo requests" is the one the executive manager actually opens the
	 * dashboard for — a booking is an enquiry whose topic is `demo`, and it
	 * deserves to be one click away rather than something to notice in a list.
	 */
	let filter = $state<'all' | 'demo' | 'unread'>('all');

	const filters = $derived([
		{ id: 'all' as const, label: m.dash_enquiry_all(), count: data.enquiries.length },
		{
			id: 'demo' as const,
			label: m.dash_enquiry_demo_filter(),
			count: data.enquiries.filter((row) => row.topic === 'demo').length
		},
		{
			id: 'unread' as const,
			label: m.dash_enquiry_unread(),
			count: data.enquiries.filter((row) => row.status === 'new').length
		}
	]);

	const rows = $derived(
		filter === 'demo'
			? data.enquiries.filter((row) => row.topic === 'demo')
			: filter === 'unread'
				? data.enquiries.filter((row) => row.status === 'new')
				: data.enquiries
	);

	const columns: Column<Row>[] = [
		{
			key: 'from',
			header: m.dash_enquiry_from(),
			sort: (row) => row.name,
			search: (row) => `${row.name} ${row.email} ${row.company ?? ''}`,
			cell: from
		},
		{ key: 'topic', header: m.dash_enquiry_topic(), sort: (row) => row.topic, cell: topic },
		{ key: 'status', header: m.dash_enquiry_status(), sort: (row) => row.status, cell: status },
		{
			key: 'createdAt',
			header: m.dash_enquiry_received(),
			sort: (row) => new Date(row.createdAt).getTime(),
			cell: received
		},
		{ key: 'actions', header: '', cell: actions, class: 'text-end' }
	];
</script>

{#snippet from(row: Row)}
	<a
		href={localizeHref(`/dashboard/enquiries/${row.id}`)}
		class={cn('hover:text-primary hover:underline', row.status === 'new' && 'font-semibold')}
	>
		{row.name}
	</a>
	<span class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
		{row.company || row.email}
		{#if row.attachment}
			<Paperclip class="size-3" aria-label={m.dash_enquiry_attachment()} />
		{/if}
	</span>
{/snippet}

{#snippet topic(row: Row)}
	<span class="text-sm">{(topicLabels[row.topic] ?? (() => row.topic))()}</span>
	{#if row.locale === 'am'}
		<!-- Flagged in the list, because it changes who on the team should reply. -->
		<span class="mt-0.5 block font-mono text-[0.6875rem] text-brand-gold">አማርኛ</span>
	{/if}
{/snippet}

{#snippet status(row: Row)}
	<EnquiryStatus status={row.status} />
{/snippet}

{#snippet received(row: Row)}
	<span class="font-mono text-xs whitespace-nowrap text-muted-foreground">
		{formatDateTime(row.createdAt)}
	</span>
{/snippet}

{#snippet actions(row: Row)}
	<Button href={localizeHref(`/dashboard/enquiries/${row.id}`)} variant="outline" size="sm">
		{m.cta_read_more()}
	</Button>
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="mx-auto max-w-sm text-sm text-muted-foreground">{m.dash_empty_enquiries()}</p>
	</div>
{/snippet}

<div class="space-y-6">
	<h1 class="display text-2xl">{m.dash_enquiries()}</h1>

	{#if data.enquiries.length}
		<div class="flex flex-wrap gap-1 border-b">
			{#each filters as tab (tab.id)}
				<button
					type="button"
					onclick={() => (filter = tab.id)}
					aria-current={filter === tab.id ? 'true' : undefined}
					class={cn(
						'-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
						filter === tab.id
							? 'border-brand-gold text-foreground'
							: 'border-transparent text-muted-foreground hover:text-foreground'
					)}
				>
					{tab.label}
					<span class="ms-1.5 font-mono text-xs text-muted-foreground">{tab.count}</span>
				</button>
			{/each}
		</div>
	{/if}

	<DataTable {rows} {columns} {empty} />
</div>
