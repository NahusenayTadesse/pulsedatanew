<script lang="ts">
	import { Loader, Save, Trash2 } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import BilingualField from '$lib/components/admin/BilingualField.svelte';
	import { clientSchema } from '$lib/forms/admin';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	/**
	 * One client in the "trusted by" band.
	 *
	 * The shortest form in the dashboard, and deliberately so: adding a client is
	 * the thing most likely to be done in a hurry, between a signed permission
	 * email and the next meeting. A name, a logo and Publish is the whole of the
	 * required path; everything else on the screen is optional and says so.
	 *
	 * Built like `TestimonialForm` — a plain status select rather than
	 * `PublishPanel`, whose featured flag and publication date mean nothing for a
	 * logo — so the two screens behave identically.
	 */
	let {
		data,
		logo = null,
		projects = [],
		deletable = false
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any;
		/** The stored logo filename, for the preview. */
		logo?: string | null;
		/** Every case study, for the link. Drafts are marked rather than hidden. */
		projects?: { id: number; name: string; status: 'draft' | 'published' }[];
		deletable?: boolean;
	} = $props();

	const schema = clientSchema();

	const projectItems = $derived([
		{ value: '', name: m.dash_project_none() },
		...projects.map((project) => ({
			value: String(project.id),
			name:
				project.status === 'published' ? project.name : m.dash_project_draft({ name: project.name })
		}))
	]);

	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data, {
		dataType: 'json',
		validators: zod4Client(schema),
		// As on the other two profile forms: `resetForm` off so a save does not
		// appear to undo itself, `invalidateAll` left on so the logo preview —
		// which comes from the load function — picks up a newly uploaded file.
		resetForm: false,
		onUpdated: ({ form: result }) => {
			if (result.message) toast.success(result.message);
		}
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
				label={m.dash_field_client_name()}
				hint={m.dash_field_client_name_hint()}
				required
				bind:value={$form.name}
				bind:valueAm={$form.nameAm}
				errors={$errors}
			/>

			<BilingualField
				name="note"
				label={m.dash_field_client_note()}
				hint={m.dash_field_client_note_hint()}
				maxlength={255}
				bind:value={$form.note}
				bind:valueAm={$form.noteAm}
				errors={$errors}
			/>

			<InputComp
				name="websiteUrl"
				type="url"
				label={m.dash_field_client_site()}
				hint={m.dash_field_client_site_hint()}
				placeholder="https://"
				bind:value={$form.websiteUrl}
				errors={$errors}
			/>

			<InputComp
				name="projectId"
				type="select"
				label={m.dash_field_project()}
				hint={m.dash_field_client_project_hint()}
				placeholder={m.dash_project_none()}
				items={projectItems}
				bind:value={$form.projectId}
				errors={$errors}
			/>
		</div>

		<aside class="space-y-6 lg:sticky lg:top-20">
			<div class="space-y-5 rounded-lg border p-4">
				<InputComp
					name="status"
					type="select"
					label={m.dash_field_status()}
					items={[
						{ value: 'draft', name: m.dash_status_draft() },
						{ value: 'published', name: m.dash_status_published() }
					]}
					bind:value={$form.status}
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

			<div class="space-y-5 rounded-lg border p-4">
				<InputComp
					name="logo"
					type="file"
					label={m.dash_field_logo()}
					placeholder={m.dash_field_logo()}
					accept="image/*"
					image={logo ?? ''}
					{form}
					errors={$errors}
				/>
				<p class="text-xs text-muted-foreground">{m.dash_field_client_logo_hint()}</p>
				<BilingualField
					name="logoAlt"
					label={m.dash_field_logo_alt()}
					hint={m.dash_field_logo_alt_hint()}
					bind:value={$form.logoAlt}
					bind:valueAm={$form.logoAltAm}
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

		<Button href={localizeHref('/dashboard/clients')} variant="ghost">{m.dash_cancel()}</Button>

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
						<AlertDialog.Action type="submit" form="delete-client">
							{m.dash_delete()}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</div>
</form>

{#if deletable}
	<!-- Outside the form above, as on the team and testimonial forms: a nested
	     <form> is invalid HTML and the browser drops it, so the button is
	     associated back by id. -->
	<form id="delete-client" method="POST" action="?/delete"></form>
{/if}
