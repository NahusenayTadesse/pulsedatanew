<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { EmailKind } from '$lib/outbox';
	import * as m from '$lib/paraglide/messages';

	/**
	 * What kind of message a record is, and whether it left.
	 *
	 * Failed is the only state drawn in the destructive colour, and it says
	 * "failed" as well — a red pill nobody can distinguish from a grey one is
	 * not a status.
	 */
	let {
		kind,
		status,
		class: className = ''
	}: { kind: EmailKind | string; status: string; class?: string } = $props();

	const labels: Record<string, () => string> = {
		acknowledgement: m.dash_mail_kind_acknowledgement,
		notification: m.dash_mail_kind_notification,
		reply: m.dash_mail_kind_reply,
		composed: m.dash_mail_kind_composed,
		proposal: m.dash_mail_kind_proposal,
		other: m.dash_mail_kind_other
	};

	const label = $derived((labels[kind] ?? (() => String(kind)))());
	const failed = $derived(status === 'failed');
</script>

<span class="inline-flex items-center gap-1.5">
	<span
		class={cn(
			'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium',
			failed
				? 'border-destructive/40 bg-destructive/10 text-destructive'
				: 'border-transparent bg-secondary text-secondary-foreground',
			className
		)}
	>
		{label}
	</span>

	{#if failed}
		<span class="text-xs font-medium text-destructive">{m.dash_mail_failed()}</span>
	{/if}
</span>
