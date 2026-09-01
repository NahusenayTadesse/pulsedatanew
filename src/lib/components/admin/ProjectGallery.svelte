<script lang="ts">
	import { ImagePlus, Loader, Save, Trash2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import BilingualField from '$lib/components/admin/BilingualField.svelte';
	import { assetUrl } from '$lib/assets';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The case study's image gallery.
	 *
	 * Deliberately *not* part of the project's own Superforms form, and
	 * deliberately not a `Repeater`. The other child lists — modules and outcomes
	 * — are short text rows replaced wholesale on save, which is fine because
	 * re-writing a text row costs nothing. An image row owns a file: replacing
	 * the list wholesale would mean deleting and re-uploading every image on
	 * every save of the project, and a failed save would take the files with it.
	 *
	 * So each image is its own small form against its own action. Adding,
	 * editing and removing are three separate operations, which is also how a
	 * person thinks about a gallery.
	 */
	let {
		images,
		/** False on the create screen: there is no project id to attach a file to yet. */
		enabled = true
	}: {
		images: {
			id: number;
			image: string;
			alt: string | null;
			altAm: string | null;
			caption: string | null;
			captionAm: string | null;
		}[];
		enabled?: boolean;
	} = $props();

	let adding = $state(false);
	let savingId = $state<number | null>(null);

	/**
	 * Bumped after a successful add, to remount the upload form.
	 *
	 * A form reset clears the native `<input type="file">`, but `FileUpload`
	 * keeps its own preview state — so the picker still showed the file that had
	 * just been uploaded, and clicking Add again would have uploaded it twice.
	 * Remounting is the honest fix: the component is genuinely finished with.
	 */
	let addKey = $state(0);
</script>

<section class="space-y-5 rounded-lg border p-5" aria-labelledby="gallery">
	<header>
		<h2 id="gallery" class="text-sm font-medium">{m.dash_gallery()}</h2>
		<p class="mt-1 text-xs text-muted-foreground">{m.dash_gallery_intro()}</p>
	</header>

	{#if !enabled}
		<p class="rounded-md border border-brand-gold/40 bg-brand-gold/10 p-3 text-sm">
			{m.dash_gallery_save_first()}
		</p>
	{:else}
		{#if images.length}
			<ul class="space-y-5">
				{#each images as image, index (image.id)}
					<li class="grid gap-4 border-t pt-5 sm:grid-cols-[12rem_1fr]">
						<img
							src={assetUrl(image.image)}
							alt={image.alt ?? ''}
							loading="lazy"
							class="w-full rounded-md border bg-muted object-cover"
						/>

						<div class="space-y-4">
							<!-- One form per row, so saving a caption never touches another
							     image and never re-uploads a file. -->
							<form
								method="POST"
								action="?/updateImage"
								use:enhance={() => {
									savingId = image.id;
									return async ({ update }) => {
										await update({ reset: false });
										savingId = null;
									};
								}}
								class="space-y-4"
							>
								<input type="hidden" name="id" value={image.id} />

								<BilingualField
									name="alt"
									id={`alt-${image.id}`}
									label={m.dash_gallery_alt()}
									hint={m.dash_gallery_alt_hint()}
									value={image.alt ?? ''}
									valueAm={image.altAm ?? ''}
								/>

								<BilingualField
									name="caption"
									id={`caption-${image.id}`}
									label={m.dash_gallery_caption()}
									hint={m.dash_gallery_caption_hint()}
									value={image.caption ?? ''}
									valueAm={image.captionAm ?? ''}
								/>

								<div class="flex flex-wrap items-end gap-3">
									<InputComp
										name="sortOrder"
										id={`sortOrder-${image.id}`}
										type="number"
										label={m.dash_gallery_position()}
										value={index}
										className="w-24"
									/>
									<Button
										type="submit"
										size="sm"
										variant="outline"
										disabled={savingId === image.id}
									>
										{#if savingId === image.id}
											<Loader class="size-3.5 animate-spin" aria-hidden="true" />
										{:else}
											<Save class="size-3.5" aria-hidden="true" />
										{/if}
										{m.dash_save()}
									</Button>
								</div>
							</form>

							<!-- Its own form: a delete nested inside the edit form would post
							     both, and a confirmed destructive action should carry nothing
							     but the id of the thing being destroyed. -->
							<AlertDialog.Root>
								<AlertDialog.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											type="button"
											size="sm"
											variant="ghost"
											class="text-destructive"
										>
											<Trash2 class="size-3.5" aria-hidden="true" />
											{m.dash_delete()}
										</Button>
									{/snippet}
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>{m.dash_gallery_delete_title()}</AlertDialog.Title>
										<AlertDialog.Description>
											{m.dash_gallery_delete_body()}
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>{m.dash_cancel()}</AlertDialog.Cancel>
										<form method="POST" action="?/deleteImage" use:enhance>
											<input type="hidden" name="id" value={image.id} />
											<Button type="submit" variant="destructive">{m.dash_delete()}</Button>
										</form>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-sm text-muted-foreground">{m.dash_gallery_empty()}</p>
		{/if}

		{#key addKey}
			<form
				method="POST"
				action="?/addImage"
				enctype="multipart/form-data"
				use:enhance={() => {
					adding = true;
					return async ({ update, result }) => {
						await update();
						adding = false;
						if (result.type === 'success') addKey += 1;
					};
				}}
				class="space-y-4 border-t pt-5"
			>
				<InputComp
					name="image"
					type="file"
					label={m.dash_gallery_file()}
					accept="image/*"
					required
				/>

				<BilingualField
					name="alt"
					id="new-alt"
					label={m.dash_gallery_alt()}
					hint={m.dash_gallery_alt_hint()}
				/>

				<BilingualField name="caption" id="new-caption" label={m.dash_gallery_caption()} />

				<Button type="submit" disabled={adding}>
					{#if adding}
						<Loader class="size-4 animate-spin" aria-hidden="true" />
						{m.dash_gallery_adding()}
					{:else}
						<ImagePlus class="size-4" aria-hidden="true" />
						{m.dash_gallery_add()}
					{/if}
				</Button>
			</form>
		{/key}
	{/if}
</section>
