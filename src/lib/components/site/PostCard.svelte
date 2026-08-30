<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { assetUrl } from '$lib/assets';
	import { pick } from '$lib/i18n';
	import type { PostCard } from '$lib/server/content';
	import { reveal } from '$lib/actions/reveal';
	import * as m from '$lib/paraglide/messages';

	let {
		post,
		featured = false,
		/** Stagger, in milliseconds — see `stagger()` in the reveal action. */
		delay = 0
	}: { post: PostCard; featured?: boolean; delay?: number } = $props();

	const title = $derived(pick(post.title, post.titleAm));
	const excerpt = $derived(pick(post.excerpt, post.excerptAm));
	const category = $derived(pick(post.category, post.categoryAm));
	const cover = $derived(assetUrl(post.coverImage));
	const alt = $derived(pick(post.coverImageAlt, post.coverImageAltAm) || '');

	/**
	 * Dates are formatted for the reading locale, not the server's. `am-ET`
	 * gives Ge'ez month names through Intl; the Ethiopian calendar itself is a
	 * separate question and not one a blog date needs to answer.
	 */
	const published = $derived(
		post.publishedAt
			? new Intl.DateTimeFormat(getLocale() === 'am' ? 'am-ET' : 'en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				}).format(new Date(post.publishedAt))
			: ''
	);
</script>

<article use:reveal={{ delay }} class="group card-lift border-t pt-6">
	<a
		href={localizeHref(`/blogs/${post.slug}`)}
		class="block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:outline-none"
	>
		{#if cover}
			<div class="mb-5 aspect-[16/10] overflow-hidden rounded-lg bg-muted">
				<img
					src={cover}
					{alt}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				/>
			</div>
		{/if}

		<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
			{#if category}
				<span class="eyebrow text-brand-gold">{category}</span>
			{/if}
			{#if published}
				<span class="font-mono text-[0.6875rem]">{published}</span>
			{/if}
			{#if post.readingMinutes}
				<span class="font-mono text-[0.6875rem]">
					{m.blogs_reading_time({ minutes: String(post.readingMinutes) })}
				</span>
			{/if}
		</div>

		<h3
			class="display transition-colors group-hover:text-primary {featured
				? 'text-2xl sm:text-3xl'
				: 'text-xl'}"
		>
			{title}
		</h3>

		{#if excerpt}
			<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
		{/if}

		<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
			{m.cta_read_article()}
			<ArrowUpRight
				class="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
				aria-hidden="true"
			/>
		</span>
	</a>
</article>
