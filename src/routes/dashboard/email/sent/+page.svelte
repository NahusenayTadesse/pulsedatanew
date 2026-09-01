<script lang="ts">
	import { Paperclip, PenLine, TriangleAlert } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import MailKind from '$lib/components/admin/MailKind.svelte';
	import { formatDateTime } from '$lib/components/admin/format';
	import type { Column } from '$lib/components/admin/table';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	type Row = (typeof data.emails)[number];

	const failed = $derived(data.emails.filter((email) => email.status === 'failed').length);

	const columns: Column<Row>[] = [
		{
			key: 'createdAt',
			header: m.dash_mail_when(),
			sort: (row) => new Date(row.createdAt).getTime(),
			cell: when
		},
		{
			key: 'recipient',
			header: m.dash_mail_to(),
			sort: (row) => row.recipient,
			search: (row) => `${row.recipient} ${row.subject} ${row.sentBy ?? ''}`,
			cell: recipient
		},
		{ key: 'subject', header: m.dash_mail_subject(), sort: (row) => row.subject, cell: subject },
		{ key: 'kind', header: m.dash_mail_kind(), sort: (row) => row.kind, cell: kind }
	];
</script>

{#snippet when(row: Row)}
	<span class="font-mono text-xs whitespace-nowrap text-muted-foreground">
		{formatDateTime(row.createdAt)}
	</span>
{/snippet}

{#snippet recipient(row: Row)}
	<a
		href={localizeHref(`/dashboard/email/sent/${row.id}`)}
		class="font-medium break-all hover:text-primary hover:underline"
	>
		{row.recipient}
	</a>
	{#if row.sentBy}
		<span class="mt-0.5 block text-xs text-muted-foreground">
			{m.dash_mail_sent_by({ name: row.sentBy })}
		</span>
	{/if}
{/snippet}

{#snippet subject(row: Row)}
	<span class="flex items-center gap-2">
		<span class="min-w-0 truncate text-sm">{row.subject}</span>
		{#if row.attachments}
			<Paperclip class="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span class="sr-only">{m.dash_mail_has_attachment()}</span>
		{/if}
	</span>
{/snippet}

{#snippet kind(row: Row)}
	<MailKind kind={row.kind} status={row.status} />
{/snippet}

{#snippet empty()}
	<div class="rounded-lg border border-dashed p-12 text-center">
		<p class="text-sm text-muted-foreground">{m.dash_mail_empty()}</p>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="display text-2xl">{m.dash_mail_sent()}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{m.dash_mail_sent_intro()}</p>
		</div>
		<Button href={localizeHref('/dashboard/email')} variant="outline">
			<PenLine class="size-4" aria-hidden="true" />
			{m.dash_compose()}
		</Button>
	</div>

	<!-- Failures first, because they are the reason this screen is worth having:
	     a message that never left is invisible in a mailbox. -->
	{#if failed}
		<p
			class="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
		>
			<TriangleAlert class="size-4 shrink-0" aria-hidden="true" />
			{m.dash_mail_failed_count({ n: failed })}
		</p>
	{/if}

	<DataTable
		rows={data.emails}
		{columns}
		{empty}
		searchPlaceholder={m.dash_mail_search()}
		pageSize={25}
	/>
</div>
