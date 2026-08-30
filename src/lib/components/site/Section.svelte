<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * The page's structural unit.
	 *
	 * Every section is an eyebrow, a heading and an optional standfirst above
	 * its content, on the same 6xl measure. The eyebrow is set in mono and reads
	 * as a field name rather than as a caption — the whole site is about records
	 * with labels, and the chrome says so quietly on every page.
	 */
	let {
		eyebrow = '',
		title = '',
		lede = '',
		id = undefined,
		bordered = true,
		class: className = '',
		headerClass = '',
		children,
		aside
	}: {
		eyebrow?: string;
		title?: string;
		lede?: string;
		id?: string;
		/** A hairline above the section. Off for the first one after a hero. */
		bordered?: boolean;
		class?: string;
		headerClass?: string;
		children: Snippet;
		/** Sits opposite the heading — a link, a count, a control. */
		aside?: Snippet;
	} = $props();

	const headingId = $derived(id ? `${id}-title` : undefined);
</script>

<section
	{id}
	aria-labelledby={headingId}
	class={cn('mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20', bordered && 'border-t', className)}
>
	{#if eyebrow || title || lede}
		<div
			use:reveal
			class={cn('mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4', headerClass)}
		>
			<div class="max-w-2xl">
				{#if eyebrow}
					<p class="eyebrow mb-4 text-brand-gold">{eyebrow}</p>
				{/if}
				{#if title}
					<h2 id={headingId} class="display text-3xl sm:text-4xl">{title}</h2>
				{/if}
				{#if lede}
					<p class="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>
				{/if}
			</div>
			{#if aside}
				<div class="shrink-0">{@render aside()}</div>
			{/if}
		</div>
	{/if}

	{@render children()}
</section>
