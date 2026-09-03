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
	import SocialLinks from '$lib/components/admin/SocialLinks.svelte';
	import { teamSchema } from '$lib/forms/admin';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	/**
	 * One person on the about page.
	 *
	 * Shorter than the article and project forms because a profile is shorter:
	 * a name, a role, a bio, a portrait and a list of links. The publish switch
	 * is a plain select rather than `PublishPanel`, which carries a "featured"
	 * flag and a publication date that mean nothing for a person.
	 */
	let {
		data,
		photo = null,
		deletable = false
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any;
		photo?: string | null;
		deletable?: boolean;
	} = $props();

	const schema = teamSchema();

	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data, {
		dataType: 'json',
		validators: zod4Client(schema),
		/*
		 * Keep what was just saved on screen.
		 *
		 * Superforms resets to the data the form was *loaded* with by default, so
		 * a save appeared to undo itself: the link that had just been written to
		 * the database vanished from the field, and the only way to see it again
		 * was to reload.
		 *
		 * `invalidateAll` is left on for the opposite reason — the portrait
		 * preview is `data.photo`, which comes from the load function, so without
		 * re-running it an uploaded photograph does not appear until a reload
		 * either.
		 */
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
				label={m.dash_field_person_name()}
				required
				bind:value={$form.name}
				bind:valueAm={$form.nameAm}
				errors={$errors}
			/>

			<BilingualField
				name="role"
				label={m.dash_field_role()}
				hint={m.dash_field_role_hint()}
				bind:value={$form.role}
				bind:valueAm={$form.roleAm}
				errors={$errors}
			/>

			<BilingualField
				name="bio"
				type="textarea"
				label={m.dash_field_bio()}
				hint={m.dash_field_bio_hint()}
				rows={5}
				maxlength={1200}
				bind:value={$form.bio}
				bind:valueAm={$form.bioAm}
				errors={$errors}
			/>

			<SocialLinks
				bind:rows={$form.links}
				errors={$errors.links}
				label={m.dash_socials()}
				hint={m.dash_socials_hint()}
				idPrefix="member-link"
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
					name="photo"
					type="file"
					label={m.dash_field_photo()}
					placeholder={m.dash_field_photo()}
					accept="image/*"
					image={photo ?? ''}
					{form}
					errors={$errors}
				/>
				<!-- The rule the about page applies, said where it is acted on. -->
				<p class="text-xs text-muted-foreground">{m.dash_field_photo_hint()}</p>
				<BilingualField
					name="photoAlt"
					label={m.dash_field_photo_alt()}
					hint={m.dash_field_photo_alt_hint()}
					bind:value={$form.photoAlt}
					bind:valueAm={$form.photoAltAm}
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

		<Button href={localizeHref('/dashboard/team')} variant="ghost">{m.dash_cancel()}</Button>

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
						<AlertDialog.Action type="submit" form="delete-member">
							{m.dash_delete()}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</div>
</form>

{#if deletable}
	<!-- Outside the form above: a nested <form> is invalid HTML and the browser
	     drops it, so the dialog's button is associated back by id. -->
	<form id="delete-member" method="POST" action="?/delete"></form>
{/if}
