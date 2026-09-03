<script lang="ts">
	import ProjectCard from '$lib/components/site/ProjectCard.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import FilterBar from '$lib/components/site/FilterBar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { stagger } from '$lib/actions/reveal';
	import { OG_IMAGE } from '$lib/seo';
	import { pick } from '$lib/i18n';
	import {
		facetsOf,
		matchesQuery,
		multiFacetsOf,
		passesFacet,
		searchText,
		type FilterGroup
	} from '$lib/filters';
	import { filterState } from '$lib/filters.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	/**
	 * Three axes, and they are the three questions a reader actually arrives
	 * with: is this my kind of business, did you build the part I need, and was
	 * it recent enough to count.
	 */
	const filters = filterState(['industry', 'service', 'year']);

	const PAGE = 8;
	let limit = $state(PAGE);

	const rows = $derived(
		data.projects.map((project) => ({
			project,
			haystack: searchText(
				project.name,
				project.nameAm,
				project.client,
				project.clientAm,
				project.summary,
				project.summaryAm,
				project.industry,
				project.industryAm,
				project.year,
				// The modules are searchable as well as filterable: a reader who types
				// "payroll" means the same thing as one who clicks the Payroll chip,
				// and a search that ignored them would look broken to them.
				...project.services.flatMap((service) => [service.label, service.labelAm])
			)
		}))
	);

	const industries = $derived(
		facetsOf(data.projects, (project) =>
			project.industry
				? { value: project.industry, label: pick(project.industry, project.industryAm) }
				: null
		)
	);

	const services = $derived(
		multiFacetsOf(data.projects, (project) =>
			project.services.map((service) => ({
				value: service.label,
				label: pick(service.label, service.labelAm)
			}))
		)
	);

	/** Years are rendered as typed ("2025", "2025–present"), so they facet as typed. */
	const years = $derived(
		facetsOf(data.projects, (project) =>
			project.year ? { value: project.year, label: project.year } : null
		)
	);

	const groups = $derived<FilterGroup[]>([
		{
			key: 'industry',
			legend: m.projects_industry(),
			facets: industries,
			selected: filters.selected('industry')
		},
		{
			key: 'service',
			legend: m.projects_modules(),
			facets: services,
			selected: filters.selected('service')
		},
		{ key: 'year', legend: m.projects_year(), facets: years, selected: filters.selected('year') }
	]);

	const matched = $derived(
		rows
			.filter(({ project, haystack }) => {
				if (!matchesQuery(haystack, filters.q)) return false;
				if (!passesFacet(filters.selected('industry'), [project.industry])) return false;
				if (
					!passesFacet(
						filters.selected('service'),
						project.services.map((service) => service.label)
					)
				) {
					return false;
				}
				return passesFacet(filters.selected('year'), [project.year]);
			})
			.map(({ project }) => project)
	);

	/**
	 * The year as a number, for sorting.
	 *
	 * `year` is free text because it is printed as written — "2025", "2024–25",
	 * "2025–present" — so the leading four digits are what can be compared. A
	 * value with none sorts last rather than as year zero.
	 */
	const yearOf = (value: string | null) => {
		const match = value?.match(/\d{4}/);
		return match ? Number(match[0]) : null;
	};

	const sorted = $derived.by(() => {
		const list = [...matched];

		if (filters.sort === 'az') {
			return list.sort((a, b) =>
				pick(a.name, a.nameAm).localeCompare(pick(b.name, b.nameAm), undefined, { numeric: true })
			);
		}

		return list.sort((a, b) => {
			const left = yearOf(a.year);
			const right = yearOf(b.year);
			if (left == null && right == null) return 0;
			if (left == null) return 1;
			if (right == null) return -1;
			return filters.sort === 'oldest' ? left - right : right - left;
		});
	});

	const visible = $derived(sorted.slice(0, limit));

	$effect(() => {
		void sorted;
		limit = PAGE;
	});
</script>

<svelte:head>
	<title>{m.nav_projects()} · {m.site_name()}</title>
	<meta name="description" content={m.projects_intro()} />
	<meta property="og:title" content="{m.nav_projects()} · {m.site_name()}" />
	<meta property="og:description" content={m.projects_intro()} />
	<meta property="og:image" content={OG_IMAGE} />
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
	<p class="eyebrow enter mb-6 text-brand-gold" style="--enter: 0">{m.projects_eyebrow()}</p>
	<h1 class="display enter max-w-3xl text-[clamp(2.25rem,6vw,4rem)]" style="--enter: 1">
		{m.projects_title()}
	</h1>
	<p class="enter mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style="--enter: 2">
		{m.projects_intro()}
	</p>
</section>

<section class="mx-auto max-w-6xl border-t px-5 py-16 sm:px-8 sm:py-20">
	{#if data.projects.length}
		<div class="mb-12">
			<FilterBar
				bind:q={filters.q}
				bind:sort={filters.sort}
				{groups}
				onToggle={(key, value) => filters.toggle(key, value)}
				onClear={() => filters.clear()}
				shown={sorted.length}
				total={data.projects.length}
				placeholder={m.projects_search_placeholder()}
			/>
		</div>

		{#if sorted.length === 0}
			<div class="rounded-lg border border-dashed p-12 text-center">
				<p class="text-lg text-muted-foreground">{m.filter_no_results()}</p>
				<div class="mt-5 flex flex-wrap justify-center gap-3">
					<Button variant="outline" onclick={() => filters.clear()}>
						{m.filter_clear_all()}
					</Button>
					<!-- The other way out of an empty result: ask us directly. On this
					     page that is more useful than it is on the blog. -->
					<Button href={localizeHref('/contact')}>{m.cta_talk_to_us()}</Button>
				</div>
			</div>
		{:else}
			<div class="grid gap-12 sm:grid-cols-2">
				{#each visible as project, index (project.id)}
					<ProjectCard {project} level={2} delay={stagger(index, 110)} />
				{/each}
			</div>

			{#if sorted.length > limit}
				<div class="mt-14 flex justify-center">
					<Button variant="outline" size="lg" onclick={() => (limit += PAGE)}>
						{m.filter_show_more({ count: String(Math.min(PAGE, sorted.length - limit)) })}
					</Button>
				</div>
			{/if}
		{/if}
	{:else}
		<!-- An empty state is an invitation, not an apology: there is still a
		     useful next step, and it is the same one the rest of the site asks for. -->
		<div class="max-w-xl">
			<p class="text-lg leading-relaxed text-muted-foreground">{m.projects_empty()}</p>
			<Button href={localizeHref('/contact')} class="mt-6">{m.cta_talk_to_us()}</Button>
		</div>
	{/if}
</section>

<CtaBand title={m.projects_cta_title()} body={m.projects_cta_body()} />
