<script lang="ts">
	import { ArrowLeft, Building2, Download, Mail, Phone } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import EnquiryStatus from '$lib/components/admin/EnquiryStatus.svelte';
	import MailKind from '$lib/components/admin/MailKind.svelte';
	import EmailComposer from '$lib/components/admin/EmailComposer.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import { replySchema } from '$lib/forms/mail';
	import { formatDateTime } from '$lib/components/admin/format';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const enquiry = $derived(data.enquiry);

	const topicLabels: Record<string, () => string> = {
		erp: m.topic_erp,
		website: m.topic_website,
		demo: m.topic_demo,
		support: m.topic_support,
		partnership: m.topic_partnership,
		other: m.topic_other
	};

	const statuses = ['new', 'read', 'replied', 'archived'] as const;

	const statusLabels: Record<string, () => string> = {
		new: m.dash_enquiry_new,
		read: m.dash_enquiry_read,
		replied: m.dash_enquiry_replied,
		archived: m.dash_enquiry_archived
	};

	const statusItems = $derived(
		statuses.map((option) => ({ value: option, name: statusLabels[option]() }))
	);

	/** Held so the dropdown, which is a button and not a form control, can post. */
	let statusForm = $state<HTMLFormElement | null>(null);

	/**
	 * A prefilled reply, opened in whatever the reader uses for mail.
	 *
	 * The subject carries their own topic back so the thread is recognisable,
	 * and the body opens with their name. Sending mail from the server would
	 * mean the reply lands from a no-reply address and never appears in the
	 * sender's own Sent folder — worse for a company whose whole pitch is
	 * responsiveness.
	 */
	const mailto = $derived.by(() => {
		const topic = (topicLabels[enquiry.topic] ?? (() => enquiry.topic))();
		const subject = `Re: ${topic} · Pulsedata Solutions`;
		const greeting = enquiry.locale === 'am' ? `ውድ ${enquiry.name}፣` : `Dear ${enquiry.name},`;
		return `mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(greeting + '\n\n')}`;
	});

	const details = $derived(
		[
			{
				icon: Mail,
				label: m.contact_email_label(),
				value: enquiry.email,
				href: `mailto:${enquiry.email}`
			},
			enquiry.phone && {
				icon: Phone,
				label: m.contact_phone_label(),
				value: enquiry.phone,
				href: `tel:${enquiry.phone.replace(/[^\d+]/g, '')}`
			},
			enquiry.company && {
				icon: Building2,
				label: m.dash_field_client(),
				value: enquiry.company,
				href: null
			}
		].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string | null }[]
	);
</script>

<div class="mx-auto max-w-3xl space-y-8">
	<a
		href={localizeHref('/dashboard/enquiries')}
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-3.5" aria-hidden="true" />
		{m.dash_enquiries()}
	</a>

	<header class="space-y-4">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="display text-2xl">{enquiry.name}</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					{(topicLabels[enquiry.topic] ?? (() => enquiry.topic))()}
					· {formatDateTime(enquiry.createdAt)}
				</p>
			</div>
			<EnquiryStatus status={enquiry.status} />
		</div>

		{#if enquiry.locale === 'am'}
			<p class="rounded-md border border-brand-gold/40 bg-brand-gold/10 p-3 text-sm">
				{m.dash_enquiry_language_note()}
			</p>
		{/if}
	</header>

	<dl class="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
		{#each details as detail (detail.label)}
			{@const Icon = detail.icon}
			<div class="flex items-start gap-2.5">
				<Icon class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				<div class="min-w-0">
					<dt class="eyebrow text-muted-foreground">{detail.label}</dt>
					<dd class="mt-1 truncate text-sm">
						{#if detail.href}
							<a href={detail.href} class="hover:text-primary hover:underline">{detail.value}</a>
						{:else}
							{detail.value}
						{/if}
					</dd>
				</div>
			</div>
		{/each}
	</dl>

	<section aria-labelledby="message">
		<h2 id="message" class="eyebrow mb-3 text-muted-foreground">{m.dash_enquiry_message()}</h2>
		<!--
			`white-space: pre-wrap` rather than any HTML: this is text a stranger
			typed into a public form, and it is rendered as text. The line breaks
			they wrote are preserved and nothing else about it is interpreted.
		-->
		<p
			class="rounded-lg border p-5 text-sm leading-relaxed whitespace-pre-wrap"
			lang={enquiry.locale}
		>
			{enquiry.message}
		</p>
	</section>

	{#if enquiry.attachment}
		<section aria-labelledby="attachment">
			<h2 id="attachment" class="eyebrow mb-3 text-muted-foreground">
				{m.dash_enquiry_attachment()}
			</h2>
			<Button
				href={localizeHref(`/dashboard/enquiries/${enquiry.id}/attachment`)}
				variant="outline"
				download
			>
				<Download class="size-4" aria-hidden="true" />
				{enquiry.attachmentName ?? m.dash_enquiry_download()}
			</Button>
		</section>
	{/if}

	<!--
		What has actually been sent about this enquiry.
		
		Above the reply box, because it answers the question somebody has before
		they start typing: has this already been answered, and did that answer
		leave the building? The status pill only records that a button was
		pressed.
	-->
	{#if data.correspondence.length}
		<section aria-labelledby="correspondence" class="border-t pt-6">
			<h2 id="correspondence" class="display mb-4 text-lg">{m.dash_mail_correspondence()}</h2>
			<ul class="divide-y rounded-lg border">
				{#each data.correspondence as item (item.id)}
					<li>
						<a
							href={localizeHref(`/dashboard/email/sent/${item.id}`)}
							class="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 transition-colors hover:bg-secondary/50"
						>
							<span class="min-w-0 flex-1 truncate text-sm font-medium">{item.subject}</span>
							<MailKind kind={item.kind} status={item.status} />
							<span class="font-mono text-xs text-muted-foreground">
								{formatDateTime(item.createdAt)}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section aria-labelledby="reply" class="border-t pt-6">
		<h2 id="reply" class="display mb-1 text-lg">{m.dash_enquiry_reply()}</h2>
		<p class="mb-5 text-sm text-muted-foreground">{m.dash_reply_hint()}</p>

		<EmailComposer
			data={data.form}
			schema={replySchema()}
			action="?/reply"
			recipient="{enquiry.name} <{enquiry.email}>"
			sendLabel={m.dash_reply_send()}
			mailReady={data.mailReady}
		>
			{#snippet secondary()}
				<!-- Still here on purpose. Sending from the server means the reply
				     never appears in the writer's own Sent folder, and sometimes the
				     right answer is a thread in their own mail client. -->
				<a href={mailto} class="text-sm text-muted-foreground underline hover:text-foreground">
					{m.dash_reply_open_client()}
				</a>
			{/snippet}
		</EmailComposer>
	</section>

	<div class="flex flex-wrap items-center gap-3 border-t pt-6">
		<form
			method="POST"
			action="?/status"
			use:enhance
			bind:this={statusForm}
			class="ms-auto flex items-center gap-2"
		>
			<label for="status" class="text-xs text-muted-foreground">{m.dash_enquiry_mark()}</label>
			<SelectComp
				id="status"
				name="status"
				items={statusItems}
				value={enquiry.status}
				onValueChange={async () => {
					// The hidden input that carries the value is written on the next
					// flush; submitting before it lands would post the old status.
					await tick();
					statusForm?.requestSubmit();
				}}
				triggerClass="w-40"
			/>
			<!-- Submits on change with JS; this is what makes it work without. The
			     dropdown itself needs JS, so without it the button posts whatever
			     status the record already has — harmless, and the page still reads. -->
			<noscript><Button type="submit" size="sm">{m.dash_save()}</Button></noscript>
		</form>
	</div>
</div>
