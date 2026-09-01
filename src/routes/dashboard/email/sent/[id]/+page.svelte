<script lang="ts">
	import { ArrowLeft, Inbox, Trash2, TriangleAlert } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import MailKind from '$lib/components/admin/MailKind.svelte';
	import { formatDateTime } from '$lib/components/admin/format';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const email = $derived(data.email);

	/** Which version is on screen. The HTML is what almost everyone received. */
	let view = $state<'html' | 'text'>('html');

	const details = $derived(
		[
			{ label: m.dash_mail_to(), value: email.recipient },
			{ label: 'Cc', value: email.cc },
			{ label: 'Bcc', value: email.bcc },
			{ label: m.dash_mail_when(), value: formatDateTime(email.createdAt) },
			{ label: m.dash_mail_sent_by_label(), value: email.sentBy },
			{ label: m.dash_mail_attachments(), value: email.attachments },
			// The id the mail server's own logs are searched by — the one thing
			// that makes "did it arrive?" answerable by the people who run it.
			{ label: m.dash_mail_message_id(), value: email.messageId, mono: true }
		].filter((row) => row.value)
	);
</script>

<div class="space-y-6">
	<a
		href={localizeHref('/dashboard/email/sent')}
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-3.5" aria-hidden="true" />
		{m.dash_mail_sent()}
	</a>

	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<h1 class="display text-2xl">{email.subject}</h1>
			<div class="mt-2">
				<MailKind kind={email.kind} status={email.status} />
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			{#if data.enquiry}
				<Button
					href={localizeHref(`/dashboard/enquiries/${data.enquiry.id}`)}
					variant="outline"
					size="sm"
				>
					<Inbox class="size-3.5" aria-hidden="true" />
					{m.dash_mail_open_enquiry({ name: data.enquiry.name })}
				</Button>
			{/if}

			<AlertDialog.Root>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="sm" class="text-destructive">
							<Trash2 class="size-3.5" aria-hidden="true" />
							{m.dash_delete()}
						</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>{m.dash_mail_delete_title()}</AlertDialog.Title>
						<AlertDialog.Description>{m.dash_mail_delete_body()}</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>{m.dash_cancel()}</AlertDialog.Cancel>
						<form method="POST" action="?/delete">
							<Button type="submit" variant="destructive">{m.dash_delete()}</Button>
						</form>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</div>
	</div>

	{#if email.status === 'failed'}
		<div class="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
			<p class="flex items-center gap-2 font-medium text-destructive">
				<TriangleAlert class="size-4 shrink-0" aria-hidden="true" />
				{m.dash_mail_failed_title()}
			</p>
			<!-- The server's own words. Paraphrasing an SMTP rejection is how a
			     fixable problem — a full mailbox, a rejected sender — becomes
			     "something went wrong". -->
			<p class="mt-2 font-mono text-xs break-words text-destructive/90">
				{email.error ?? m.dash_mail_failed_unknown()}
			</p>
		</div>
	{/if}

	<dl class="grid gap-x-6 gap-y-3 rounded-lg border p-5 sm:grid-cols-[10rem_1fr]">
		{#each details as detail (detail.label)}
			<dt class="eyebrow text-muted-foreground">{detail.label}</dt>
			<dd class={detail.mono ? 'font-mono text-xs break-all' : 'text-sm break-words'}>
				{detail.value}
			</dd>
		{/each}
	</dl>

	<div class="space-y-3">
		<div class="flex items-center gap-2" role="tablist" aria-label={m.dash_mail_view()}>
			{#each [{ id: 'html' as const, label: m.dash_mail_view_html() }, { id: 'text' as const, label: m.dash_mail_view_text() }] as tab (tab.id)}
				<button
					type="button"
					role="tab"
					aria-selected={view === tab.id}
					onclick={() => (view = tab.id)}
					class="rounded-full border px-3 py-1 text-xs font-medium transition-colors {view ===
					tab.id
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if view === 'html'}
			<!--
				The stored message is rendered in a sandboxed iframe, not with
				`{@html}`.

				This is the one place in the dashboard that displays a document
				assembled elsewhere — and for a reply it contains text a person
				typed. An empty `sandbox` attribute denies it scripts, forms,
				same-origin access and navigation, so the worst a bad record can do
				is look wrong inside its own box. `srcdoc` keeps it out of the
				dashboard's own DOM entirely, which `{@html}` could never promise.
			-->
			<iframe
				title={m.dash_mail_preview({ subject: email.subject })}
				srcdoc={email.bodyHtml}
				sandbox=""
				referrerpolicy="no-referrer"
				class="h-[42rem] w-full rounded-lg border bg-white"
			></iframe>
		{:else}
			<pre
				class="max-h-[42rem] overflow-auto rounded-lg border bg-muted/40 p-5 font-mono text-xs whitespace-pre-wrap">{email.bodyText ??
					''}</pre>
		{/if}
	</div>
</div>
