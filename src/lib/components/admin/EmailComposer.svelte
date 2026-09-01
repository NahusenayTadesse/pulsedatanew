<script lang="ts">
	import { Loader, Send } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import RichTextEditor from '$lib/formComponents/RichTextEditor.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The one email composer, used by the reply on an enquiry and by the general
	 * sender.
	 *
	 * The only difference between them is whether the recipient can be typed:
	 * a reply's address comes from the enquiry row and is shown but not editable,
	 * because letting it be posted would turn an authenticated action into a
	 * relay that sends company-branded mail anywhere.
	 */
	let {
		data,
		/** The zod schema for this form — `replySchema()` or `composeSchema()`. */
		schema,
		action,
		/** Shown as a fixed recipient. Omit to let one be typed into a `to` field. */
		recipient = null,
		sendLabel,
		hint = null,
		/** False when the server has no SMTP settings; the form is then read-only. */
		mailReady = true,
		/** A secondary escape hatch, e.g. "open in my own mail app". */
		secondary = undefined
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		schema: any;
		action: string;
		recipient?: string | null;
		sendLabel: string;
		hint?: string | null;
		mailReady?: boolean;
		secondary?: import('svelte').Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data, {
		dataType: 'form',
		validators: zod4Client(schema),
		/*
		 * A sent email cannot be unsent, so the draft is cleared on success —
		 * otherwise the composer still holds the message that just went out and
		 * the obvious next action is to send it again.
		 */
		resetForm: true,
		onUpdated: ({ form: result }) => {
			if (!result.message) return;
			if (result.valid) toast.success(result.message);
			else toast.error(result.message);
		}
	});
</script>

<form method="POST" {action} use:enhance class="space-y-5">
	<Errors allErrors={$allErrors} />

	{#if !mailReady}
		<p class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
			{m.dash_mail_off()}
		</p>
	{/if}

	{#if $message}
		<p class="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm text-primary">
			{$message}
		</p>
	{/if}

	{#if recipient}
		<div class="flex items-baseline gap-3 rounded-md border bg-muted/40 px-3 py-2">
			<span class="eyebrow text-muted-foreground">{m.dash_field_to()}</span>
			<span class="truncate text-sm font-medium">{recipient}</span>
		</div>
	{:else}
		<InputComp
			name="to"
			type="email"
			label={m.dash_field_to()}
			hint={m.dash_field_to_hint()}
			required
			autocomplete="off"
			bind:value={$form.to}
			errors={$errors}
		/>
	{/if}

	<InputComp
		name="subject"
		type="text"
		label={m.dash_field_subject()}
		required
		maxlength={200}
		bind:value={$form.subject}
		errors={$errors}
	/>

	<div class="space-y-1.5">
		<!-- `for="body"` reaches the editor host, which carries that id. -->
		<label for="body" class="text-sm font-medium">
			{m.dash_field_message()}
			<span class="text-destructive" aria-hidden="true">*</span>
		</label>
		<RichTextEditor id="body" bind:value={$form.body} />
		<!-- The editor is a contenteditable, not a control: this is what actually
		     posts, and it is what a validation message can point at. -->
		<input type="hidden" name="body" value={$form.body ?? ''} />
		{#if $errors.body}
			<p class="text-sm text-destructive">{$errors.body}</p>
		{/if}
	</div>

	{#if hint}
		<p class="text-xs text-muted-foreground">{hint}</p>
	{/if}

	<div class="flex flex-wrap items-center gap-3">
		<Button type="submit" disabled={$submitting || !mailReady}>
			{#if $submitting}
				<Loader class="size-4 animate-spin" aria-hidden="true" />
			{:else}
				<Send class="size-4" aria-hidden="true" />
			{/if}
			{sendLabel}
		</Button>
		{@render secondary?.()}
	</div>
</form>
