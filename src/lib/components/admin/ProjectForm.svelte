<script lang="ts">
	import { Loader, Save, Trash2 } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import BilingualField from '$lib/components/admin/BilingualField.svelte';
	import PublishPanel from '$lib/components/admin/PublishPanel.svelte';
	import Repeater from '$lib/components/admin/Repeater.svelte';
	import { projectSchema, slugify } from '$lib/forms/admin';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let {
		data,
		coverImage = null,
		clientLogo = null,
		deletable = false
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any;
		coverImage?: string | null;
		clientLogo?: string | null;
		deletable?: boolean;
	} = $props();

	const schema = projectSchema();

	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data, {
		dataType: 'json',
		validators: zod4Client(schema),
		invalidateAll: false,
		onUpdated: ({ form: result }) => {
			if (result.message) toast.success(result.message);
		}
	});

	let slugTouched = $state(Boolean($form.slug));

	/*
	 * Fill the slug from the name while nobody has touched it, then stop.
	 *
	 * Once a slug has been typed — or the item has been published under one —
	 * re-naming must not move the page: every existing link to it would
	 * break silently, and the person editing a headline has no reason to expect
	 * that. So this is a convenience for the first draft and nothing after it.
	 */
	$effect(() => {
		if (slugTouched) return;

		const suggestion = slugify($form.name ?? '');

		/*
		 * The equality check is load-bearing, not tidiness.
		 *
		 * Reading `$form.name` subscribes this effect to the whole form store,
		 * and writing `$form.slug` changes that same store — so an unconditional
		 * write re-triggers the effect, which writes again, forever. The page
		 * pinned a core and never settled, which is subtle to notice by eye
		 * because the rendered output is correct the entire time.
		 *
		 * Comparing first means the second run is a no-op and the loop converges.
		 */
		if (suggestion && $form.slug !== suggestion) $form.slug = suggestion;
	});
</script>

<form method="POST" action="?/save" enctype="multipart/form-data" use:enhance class="space-y-8">
	<Errors allErrors={$allErrors} />

	{#if $message}
		<p class="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm text-primary">
			{$message}
		</p>
	{/if}

	<div class="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
		<div class="space-y-6">
			<BilingualField
				name="name"
				label={m.dash_field_name()}
				required
				bind:value={$form.name}
				bind:valueAm={$form.nameAm}
				errors={$errors}
			/>

			<InputComp
				name="slug"
				type="text"
				label={m.dash_field_slug()}
				hint={m.dash_field_slug_hint()}
				required
				bind:value={$form.slug}
				errors={$errors}
				oninput={() => (slugTouched = true)}
			/>

			<div class="grid gap-6 sm:grid-cols-2">
				<BilingualField
					name="client"
					label={m.dash_field_client()}
					bind:value={$form.client}
					bind:valueAm={$form.clientAm}
					errors={$errors}
				/>
				<BilingualField
					name="industry"
					label={m.dash_field_industry()}
					bind:value={$form.industry}
					bind:valueAm={$form.industryAm}
					errors={$errors}
				/>
			</div>

			<BilingualField
				name="summary"
				type="textarea"
				label={m.dash_field_summary()}
				hint={m.dash_field_excerpt_hint()}
				rows={3}
				maxlength={600}
				bind:value={$form.summary}
				bind:valueAm={$form.summaryAm}
				errors={$errors}
			/>

			<BilingualField
				name="body"
				type="richtext"
				label={m.dash_field_body()}
				bind:value={$form.body}
				bind:valueAm={$form.bodyAm}
				errors={$errors}
			/>

			<Repeater
				label={m.dash_services()}
				hint={m.dash_services_hint()}
				bind:rows={$form.services}
				blank={() => ({ label: '', labelAm: '' })}
			>
				{#snippet row(service, set)}
					<div class="grid gap-2 sm:grid-cols-2">
						<Input
							placeholder={m.dash_lang_en()}
							value={service.label}
							oninput={(event) => set({ label: event.currentTarget.value })}
						/>
						<Input
							placeholder={m.dash_lang_am()}
							value={service.labelAm}
							oninput={(event) => set({ labelAm: event.currentTarget.value })}
							lang="am"
						/>
					</div>
				{/snippet}
			</Repeater>

			<Repeater
				label={m.dash_outcomes()}
				hint={m.dash_outcomes_hint()}
				bind:rows={$form.outcomes}
				blank={() => ({ value: '', label: '', labelAm: '' })}
			>
				{#snippet row(outcome, set)}
					<div class="grid gap-2 sm:grid-cols-[8rem_1fr_1fr]">
						<Input
							placeholder={m.dash_outcome_value()}
							value={outcome.value}
							oninput={(event) => set({ value: event.currentTarget.value })}
						/>
						<Input
							placeholder={m.dash_outcome_label()}
							value={outcome.label}
							oninput={(event) => set({ label: event.currentTarget.value })}
						/>
						<Input
							placeholder={m.dash_lang_am()}
							value={outcome.labelAm}
							oninput={(event) => set({ labelAm: event.currentTarget.value })}
							lang="am"
						/>
					</div>
				{/snippet}
			</Repeater>
		</div>

		<aside class="space-y-6 lg:sticky lg:top-20">
			<PublishPanel
				bind:status={$form.status}
				bind:featured={$form.featured}
				bind:publishedAt={$form.publishedAt}
				errors={$errors}
			/>

			<div class="space-y-5 rounded-lg border p-4">
				<InputComp
					name="coverImage"
					type="file"
					label={m.dash_field_cover()}
					placeholder={m.dash_field_cover()}
					accept="image/*"
					image={coverImage ?? ''}
					{form}
					errors={$errors}
				/>
				<BilingualField
					name="coverImageAlt"
					label={m.dash_field_cover_alt()}
					hint={m.dash_field_cover_alt_hint()}
					bind:value={$form.coverImageAlt}
					bind:valueAm={$form.coverImageAltAm}
					errors={$errors}
				/>
				<InputComp
					name="clientLogo"
					type="file"
					label={m.dash_field_client_logo()}
					placeholder={m.dash_field_client_logo()}
					accept="image/*"
					image={clientLogo ?? ''}
					{form}
					errors={$errors}
				/>
			</div>

			<div class="space-y-5 rounded-lg border p-4">
				<InputComp
					name="year"
					type="text"
					label={m.dash_field_year()}
					placeholder="2025"
					bind:value={$form.year}
					errors={$errors}
				/>
				<InputComp
					name="websiteUrl"
					type="url"
					label={m.dash_field_website()}
					hint={m.dash_field_website_hint()}
					placeholder="https://"
					bind:value={$form.websiteUrl}
					errors={$errors}
				/>
				<InputComp
					name="sortOrder"
					type="number"
					label={m.dash_field_sort()}
					hint={m.dash_field_sort_hint()}
					bind:value={$form.sortOrder}
					errors={$errors}
				/>
			</div>
		</aside>
	</div>

	<div class="flex flex-wrap items-center gap-3 border-t pt-6">
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<Loader class="size-4 animate-spin" aria-hidden="true" />
				{m.dash_saving()}
			{:else}
				<Save class="size-4" aria-hidden="true" />
				{m.dash_save()}
			{/if}
		</Button>

		<Button href={localizeHref('/dashboard/projects')} variant="ghost">{m.dash_cancel()}</Button>

		{#if deletable}
			<AlertDialog.Root>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" class="ms-auto text-destructive">
							<Trash2 class="size-4" aria-hidden="true" />
							{m.dash_delete()}
						</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>{m.dash_delete_confirm_title()}</AlertDialog.Title>
						<AlertDialog.Description>{m.dash_delete_confirm_body()}</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>{m.dash_cancel()}</AlertDialog.Cancel>
						<AlertDialog.Action type="submit" form="delete-project">
							{m.dash_delete()}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</div>
</form>

{#if deletable}
	<!-- Outside the edit form: a nested <form> is invalid HTML and the browser
	     drops it, so the dialog's button is associated back by id. -->
	<form id="delete-project" method="POST" action="?/delete"></form>
{/if}
