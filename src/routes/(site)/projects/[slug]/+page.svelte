<script lang="ts">
	import { ArrowLeft, ExternalLink } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { assetUrl } from '$lib/assets';
	import { pick, isTranslated } from '$lib/i18n';
	import ProjectCard from '$lib/components/site/ProjectCard.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import ScrollProgress from '$lib/components/site/ScrollProgress.svelte';
	import CountUp from '$lib/components/site/CountUp.svelte';
	import { reveal, stagger } from '$lib/actions/reveal';
	import { SITE_URL } from '$lib/site';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const p = $derived(data.project);
	const name = $derived(pick(p.name, p.nameAm));
	const client = $derived(pick(p.client, p.clientAm));
	const summary = $derived(pick(p.summary, p.summaryAm));
	const industry = $derived(pick(p.industry, p.industryAm));
	const cover = $derived(assetUrl(p.coverImage));
	const coverAlt = $derived(pick(p.coverImageAlt, p.coverImageAltAm) || '');
	const body = $derived(getLocale() === 'am' && data.bodyHtmlAm ? data.bodyHtmlAm : data.bodyHtml);
	const translated = $derived(isTranslated(p.bodyAm));
</script>

<svelte:head>
	<title>{name} · {m.site_name()}</title>
	<meta name="description" content={summary} />
	<meta property="og:title" content="{name} · {m.site_name()}" />
	<meta property="og:description" content={summary} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content={cover ? `${SITE_URL}${cover}` : `${SITE_URL}/longLogo.png`} />
</svelte:head>

<ScrollProgress />

<article>
	<header class="mx-auto max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-16">
		<a
			href={localizeHref('/projects')}
			class="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="size-3.5" aria-hidden="true" />
			{m.cta_back_to_projects()}
		</a>

		<h1 class="display enter max-w-3xl text-[clamp(2.25rem,6vw,4rem)]" style="--enter: 1">
			{name}
		</h1>

		{#if summary}
			<p
				class="enter mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
				style="--enter: 2"
			>
				{summary}
			</p>
		{/if}

		<dl class="mt-10 grid gap-x-8 gap-y-6 border-t pt-6 sm:grid-cols-3">
			{#if client}
				<div>
					<dt class="eyebrow text-muted-foreground">{m.projects_client()}</dt>
					<dd class="mt-2 text-sm font-medium">{client}</dd>
				</div>
			{/if}
			{#if industry}
				<div>
					<dt class="eyebrow text-muted-foreground">{m.projects_industry()}</dt>
					<dd class="mt-2 text-sm font-medium">{industry}</dd>
				</div>
			{/if}
			{#if p.year}
				<div>
					<dt class="eyebrow text-muted-foreground">{m.projects_year()}</dt>
					<dd class="mt-2 font-mono text-sm font-medium">{p.year}</dd>
				</div>
			{/if}
			{#if p.services.length}
				<!-- Full width rather than a fourth column: the chips stack into a tall
				     narrow strip there and leave the other three fields sitting above a
				     hole. Across the row they wrap into one or two lines. -->
				<div class="sm:col-span-3">
					<dt class="eyebrow text-muted-foreground">{m.projects_modules()}</dt>
					<dd class="mt-2 flex flex-wrap gap-1.5">
						{#each p.services as service (service.id)}
							<span class="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
								{pick(service.label, service.labelAm)}
							</span>
						{/each}
					</dd>
				</div>
			{/if}
		</dl>

		{#if p.websiteUrl}
			<Button href={p.websiteUrl} target="_blank" rel="noopener" variant="outline" class="mt-8">
				{m.cta_visit_website()}
				<ExternalLink class="size-3.5" aria-hidden="true" />
			</Button>
		{/if}
	</header>

	{#if cover}
		<div use:reveal={{ y: 20 }} class="mx-auto max-w-6xl px-5 sm:px-8">
			<img
				src={cover}
				alt={coverAlt}
				class="aspect-[16/9] w-full rounded-lg border bg-muted object-cover"
			/>
		</div>
	{/if}

	{#if p.outcomes.length}
		<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8" aria-labelledby="outcomes">
			<h2 id="outcomes" class="eyebrow mb-8 text-brand-gold">{m.projects_outcomes()}</h2>
			<dl class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
				{#each p.outcomes as outcome, index (outcome.id)}
					<div use:reveal={{ delay: stagger(index, 120) }} class="border-t pt-5">
						<dt class="display text-3xl text-brand-gold sm:text-4xl">
							<CountUp value={outcome.value} />
						</dt>
						<dd class="mt-2 text-sm leading-relaxed text-muted-foreground">
							{pick(outcome.label, outcome.labelAm)}
						</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/if}

	{#if body}
		<div class="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
			{#if !translated}
				<p class="mb-8 border-s-2 border-brand-gold ps-4 text-sm text-muted-foreground">
					{m.translation_pending()}
				</p>
			{/if}
			<!-- The only `@html` on the site. Its input is `renderRichText`, which
			     sanitises with DOMPurify before returning. -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="prose">{@html body}</div>
		</div>
	{/if}

	{#if p.images.length}
		<section class="mx-auto max-w-6xl border-t px-5 py-16 sm:px-8" aria-labelledby="gallery">
			<h2 id="gallery" class="eyebrow mb-8 text-brand-gold">{m.projects_gallery()}</h2>
			<div class="grid gap-6 sm:grid-cols-2">
				{#each p.images as image, index (image.id)}
					<figure use:reveal={{ delay: stagger(index, 90) }} class="card-lift">
						<img
							src={assetUrl(image.image)}
							alt={pick(image.alt, image.altAm) || ''}
							loading="lazy"
							class="w-full rounded-lg border bg-muted object-cover"
						/>
						{#if image.caption}
							<figcaption class="mt-2 text-xs text-muted-foreground">
								{pick(image.caption, image.captionAm)}
							</figcaption>
						{/if}
					</figure>
				{/each}
			</div>
		</section>
	{/if}
</article>

{#if data.related.length}
	<section class="mx-auto max-w-6xl border-t px-5 py-16 sm:px-8" aria-labelledby="related">
		<h2 id="related" class="eyebrow mb-8 text-brand-gold">{m.projects_related()}</h2>
		<div class="grid gap-12 sm:grid-cols-2">
			{#each data.related as project, index (project.id)}
				<ProjectCard {project} delay={stagger(index, 110)} />
			{/each}
		</div>
	</section>
{/if}

<CtaBand title={m.projects_cta_title()} body={m.projects_cta_body()} />
