<script lang="ts">
	import { Check, Star } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages';

	/** Draft or published, plus the featured star when it applies. */
	let { status, featured = false }: { status: string; featured?: boolean } = $props();

	const published = $derived(status === 'published');
</script>

<span class="inline-flex items-center gap-1.5">
	<span
		class={cn(
			'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
			published
				? 'border-primary/30 bg-primary/15 text-primary'
				: 'border-transparent bg-muted text-muted-foreground'
		)}
	>
		{#if published}<Check class="size-3" aria-hidden="true" />{/if}
		{published ? m.dash_status_published() : m.dash_status_draft()}
	</span>

	{#if featured}
		<Star class="size-3.5 fill-brand-gold text-brand-gold" aria-label={m.dash_field_featured()} />
	{/if}
</span>
