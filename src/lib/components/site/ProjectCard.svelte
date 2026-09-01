<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { assetUrl } from '$lib/assets';
	import { pick } from '$lib/i18n';
	import type { ProjectCard } from '$lib/server/content';
	import { reveal } from '$lib/actions/reveal';
	import * as m from '$lib/paraglide/messages';

	let {
		project,
		delay = 0,
		/**
		 * The heading level this card's title uses.
		 *
		 * A card is a heading in the page outline, not a decoration, so the level
		 * has to match where the list sits: directly under the page's `h1` it is
		 * an `h2`, and inside a section that has its own `h2` it is an `h3`.
		 * Hard-coding `h3` skipped a level on every index page — invisible on
		 * screen, and the thing that makes heading navigation useless for anyone
		 * moving through the page with a screen reader.
		 */
		level = 3
	}: { project: ProjectCard; delay?: number; level?: 2 | 3 } = $props();

	const name = $derived(pick(project.name, project.nameAm));
	const client = $derived(pick(project.client, project.clientAm));
	const summary = $derived(pick(project.summary, project.summaryAm));
	const industry = $derived(pick(project.industry, project.industryAm));
	const cover = $derived(assetUrl(project.coverImage));
	const alt = $derived(pick(project.coverImageAlt, project.coverImageAltAm) || '');
</script>

<article use:reveal={{ delay }} class="group card-lift">
	<a
		href={localizeHref(`/projects/${project.slug}`)}
		class="block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:outline-none"
	>
		<div class="mb-5 aspect-[16/10] overflow-hidden rounded-lg border bg-muted">
			{#if cover}
				<img
					src={cover}
					{alt}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				/>
			{/if}
		</div>

		<!--
			The metadata row is the site's structural device: a mono label naming
			what the value is, then the value. It is the same shape as a field in
			the hero's record, which is the point — this is a company that turns
			operations into labelled records, and the pages are built that way too.
		-->
		<dl class="mb-4 flex flex-wrap gap-x-6 gap-y-1">
			{#if client}
				<div>
					<dt class="eyebrow text-muted-foreground">{m.projects_client()}</dt>
					<dd class="mt-1 text-sm font-medium">{client}</dd>
				</div>
			{/if}
			{#if industry}
				<div>
					<dt class="eyebrow text-muted-foreground">{m.projects_industry()}</dt>
					<dd class="mt-1 text-sm font-medium">{industry}</dd>
				</div>
			{/if}
			{#if project.year}
				<div>
					<dt class="eyebrow text-muted-foreground">{m.projects_year()}</dt>
					<dd class="mt-1 font-mono text-sm font-medium">{project.year}</dd>
				</div>
			{/if}
		</dl>

		<svelte:element
			this={`h${level}`}
			class="display text-2xl transition-colors group-hover:text-primary"
		>
			{name}
		</svelte:element>

		{#if summary}
			<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
		{/if}

		<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
			{m.cta_view_case_study()}
			<ArrowUpRight
				class="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
				aria-hidden="true"
			/>
		</span>
	</a>
</article>
