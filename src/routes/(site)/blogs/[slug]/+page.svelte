<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { page } from '$app/state';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { assetUrl } from '$lib/assets';
	import { pick, isTranslated } from '$lib/i18n';
	import PostCard from '$lib/components/site/PostCard.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import ScrollProgress from '$lib/components/site/ScrollProgress.svelte';
	import { reveal, stagger } from '$lib/actions/reveal';
	import { SITE_URL } from '$lib/site';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const post = $derived(data.post);
	const title = $derived(pick(post.title, post.titleAm));
	const category = $derived(pick(post.category, post.categoryAm));
	const author = $derived(pick(post.author, post.authorAm));
	const cover = $derived(assetUrl(post.coverImage));
	const coverAlt = $derived(pick(post.coverImageAlt, post.coverImageAltAm) || '');
	const body = $derived(getLocale() === 'am' && data.bodyHtmlAm ? data.bodyHtmlAm : data.bodyHtml);
	const translated = $derived(isTranslated(post.bodyAm));
	const description = $derived(pick(data.fallbackExcerpt, post.excerptAm));

	const published = $derived(
		post.publishedAt
			? new Intl.DateTimeFormat(getLocale() === 'am' ? 'am-ET' : 'en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				}).format(new Date(post.publishedAt))
			: ''
	);

	const canonical = $derived(`${SITE_URL}${page.url.pathname}`);
</script>

<svelte:head>
	<title>{title} · {m.site_name()}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content={cover ? `${SITE_URL}${cover}` : `${SITE_URL}/longLogo.png`} />
	{#if post.publishedAt}
		<meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />
	{/if}
</svelte:head>

<ScrollProgress />

<article class="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-16">
	<a
		href={localizeHref('/blogs')}
		class="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-3.5" aria-hidden="true" />
		{m.cta_back_to_blogs()}
	</a>

	<header class="max-w-3xl">
		<div class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
			{#if category}<span class="eyebrow text-brand-gold">{category}</span>{/if}
			{#if published}<span class="font-mono text-xs">{published}</span>{/if}
			<span class="font-mono text-xs"
				>{m.blogs_reading_time({ minutes: String(data.minutes) })}</span
			>
		</div>

		<h1 class="display enter text-[clamp(2rem,5.5vw,3.5rem)]" style="--enter: 1">{title}</h1>

		{#if author}
			<p class="mt-6 text-sm text-muted-foreground">{m.blogs_by_author({ author })}</p>
		{/if}
	</header>

	{#if cover}
		<img
			use:reveal={{ y: 20 }}
			src={cover}
			alt={coverAlt}
			class="mt-10 aspect-[16/9] w-full rounded-lg border bg-muted object-cover"
		/>
	{/if}

	{#if !translated}
		<p class="mt-10 max-w-3xl border-s-2 border-brand-gold ps-4 text-sm text-muted-foreground">
			{m.translation_pending()}
		</p>
	{/if}

	<!-- The only `@html` on the site. Its input is `renderRichText`, which
	     sanitises with DOMPurify before returning. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="prose mt-10 pb-16">{@html body}</div>
</article>

{#if data.related.length}
	<section class="mx-auto max-w-6xl border-t px-5 py-16 sm:px-8" aria-labelledby="related">
		<h2 id="related" class="eyebrow mb-8 text-brand-gold">{m.blogs_related()}</h2>
		<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.related as related, index (related.id)}
				<PostCard post={related} delay={stagger(index, 90)} />
			{/each}
		</div>
	</section>
{/if}

<CtaBand title={m.home_cta_title()} body={m.home_cta_body()} />
