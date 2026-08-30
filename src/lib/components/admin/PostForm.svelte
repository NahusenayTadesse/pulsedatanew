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
	import PublishPanel from '$lib/components/admin/PublishPanel.svelte';
	import { postSchema, slugify } from '$lib/forms/admin';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let {
		data,
		/** The stored cover filename, so the upload field can preview it. */
		coverImage = null,
		/** Only an existing article can be deleted. */
		deletable = false
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any;
		coverImage?: string | null;
		deletable?: boolean;
	} = $props();

	const schema = postSchema();

	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data, {
		dataType: 'form',
		validators: zod4Client(schema),
		// The action redirects to the saved article on create, so re-running the
		// list load behind it would be wasted work.
		invalidateAll: false,
		onUpdated: ({ form: result }) => {
			if (result.message) toast.success(result.message);
		}
	});

	/**
	 * The slug is suggested from the title, and only while it is still untouched.
	 *
	 * Once someone has typed a slug — or an article has been published under one
	 * — retitling must not move the page: every existing link to it would break
	 * silently. So this fills a blank field and then gets out of the way.
	 */
	let slugTouched = $state(Boolean($form.slug));

	/*
	 * Fill the slug from the title while nobody has touched it, then stop.
	 *
	 * Once a slug has been typed — or the item has been published under one —
	 * re-titling must not move the page: every existing link to it would
	 * break silently, and the person editing a headline has no reason to expect
	 * that. So this is a convenience for the first draft and nothing after it.
	 */
	$effect(() => {
		if (slugTouched) return;

		const suggestion = slugify($form.title ?? '');

		/*
		 * The equality check is load-bearing, not tidiness.
		 *
		 * Reading `$form.title` subscribes this effect to the whole form store,
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
		<!-- The article itself -->
		<div class="space-y-6">
			<BilingualField
				name="title"
				label={m.dash_field_title()}
				required
				bind:value={$form.title}
				bind:valueAm={$form.titleAm}
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

			<BilingualField
				name="excerpt"
				type="textarea"
				label={m.dash_field_excerpt()}
				hint={m.dash_field_excerpt_hint()}
				rows={3}
				maxlength={600}
				bind:value={$form.excerpt}
				bind:valueAm={$form.excerptAm}
				errors={$errors}
			/>

			<BilingualField
				name="body"
				type="richtext"
				label={m.dash_field_body()}
				required
				bind:value={$form.body}
				bind:valueAm={$form.bodyAm}
				errors={$errors}
			/>
		</div>

		<!-- Publishing and metadata -->
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
			</div>

			<div class="space-y-5 rounded-lg border p-4">
				<BilingualField
					name="category"
					label={m.dash_field_category()}
					bind:value={$form.category}
					bind:valueAm={$form.categoryAm}
					errors={$errors}
				/>

				<BilingualField
					name="author"
					label={m.dash_field_author()}
					bind:value={$form.author}
					bind:valueAm={$form.authorAm}
					errors={$errors}
				/>

				<InputComp
					name="readingMinutes"
					type="number"
					label={m.dash_field_reading()}
					hint={m.dash_field_reading_hint()}
					bind:value={$form.readingMinutes}
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

		<Button href={localizeHref('/dashboard/blogs')} variant="ghost">{m.dash_cancel()}</Button>

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
						<!--
							Its own form, posting to a named action. A nested <form> is
							invalid HTML and the browser drops it, so the delete button has
							to sit outside the edit form's element — `form="delete-form"`
							associates it back across the DOM.
						-->
						<AlertDialog.Action type="submit" form="delete-form">
							{m.dash_delete()}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</div>
</form>

{#if deletable}
	<form id="delete-form" method="POST" action="?/delete"></form>
{/if}
