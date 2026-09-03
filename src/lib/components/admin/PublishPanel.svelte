<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import type { FieldErrors } from '$lib/formComponents/types';
	import * as m from '$lib/paraglide/messages';

	/**
	 * Status, featured and publish date — the three controls that decide whether
	 * and when something is public. Grouped into one panel because they only
	 * make sense read together: "published" with a future date is scheduled, not
	 * live, and that is not obvious if the two sit in different parts of a form.
	 */
	let {
		status = $bindable(),
		featured = $bindable(),
		publishedAt = $bindable(),
		errors = undefined
	}: {
		status?: string;
		featured?: boolean;
		publishedAt?: string;
		errors?: FieldErrors;
	} = $props();

	const scheduled = $derived(
		status === 'published' && publishedAt && new Date(publishedAt).getTime() > Date.now()
	);
</script>

<div class="space-y-5 rounded-lg border p-4">
	<InputComp
		name="status"
		type="select"
		label={m.dash_field_status()}
		items={[
			{ value: 'draft', name: m.dash_status_draft() },
			{ value: 'published', name: m.dash_status_published() }
		]}
		bind:value={status}
		{errors}
	/>

	<div class="flex items-start justify-between gap-4">
		<div class="space-y-1">
			<Label for="featured" class="text-sm">{m.dash_field_featured()}</Label>
			<p class="text-xs text-muted-foreground">{m.dash_field_featured_hint()}</p>
		</div>
		<Switch id="featured" name="featured" bind:checked={featured} />
	</div>

	<div class="space-y-2">
		<Label for="publishedAt" class="text-sm">{m.dash_field_published_at()}</Label>
		<Input id="publishedAt" name="publishedAt" type="date" bind:value={publishedAt} />
		<p class="text-xs text-muted-foreground">{m.dash_field_published_at_hint()}</p>

		{#if scheduled}
			<!-- Said plainly, because "Published" plus a future date looks live and
			     is not; someone would otherwise go looking for the missing page. -->
			<p class="rounded-md border border-brand-gold/40 bg-brand-gold/10 p-2 text-xs">
				{m.dash_scheduled_note()}
			</p>
		{/if}

		{#each (errors?.publishedAt as string[] | undefined) ?? [] as error (error)}
			<p class="text-xs text-destructive">{error}</p>
		{/each}
	</div>
</div>
