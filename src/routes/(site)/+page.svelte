<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Section from '$lib/components/site/Section.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import RecordFlow from '$lib/components/site/RecordFlow.svelte';
	import ProjectCard from '$lib/components/site/ProjectCard.svelte';
	import PostCard from '$lib/components/site/PostCard.svelte';
	import { reveal, stagger } from '$lib/actions/reveal';
	import { SITE_URL } from '$lib/site';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const modules = $derived([
		{ name: m.module_finance(), body: m.module_finance_body() },
		{ name: m.module_hr(), body: m.module_hr_body() },
		{ name: m.module_inventory(), body: m.module_inventory_body() },
		{ name: m.module_procurement(), body: m.module_procurement_body() },
		{ name: m.module_sales(), body: m.module_sales_body() },
		{ name: m.module_production(), body: m.module_production_body() },
		{ name: m.module_costing(), body: m.module_costing_body() },
		{ name: m.module_dashboards(), body: m.module_dashboards_body() },
		{ name: m.module_approvals(), body: m.module_approvals_body() }
	]);

	const services = $derived([
		{ name: m.service_implementation(), body: m.service_implementation_body() },
		{ name: m.service_licensing(), body: m.service_licensing_body() },
		{ name: m.service_web(), body: m.service_web_body() },
		{ name: m.service_support(), body: m.service_support_body() }
	]);

	const industries = $derived([
		m.industry_scalable(),
		m.industry_service(),
		m.industry_multibranch(),
		m.industry_workforce()
	]);

	const deployments = $derived([
		{
			name: m.deployment_perpetual(),
			tag: m.deployment_perpetual_tag(),
			body: m.deployment_perpetual_body(),
			points: [
				m.deployment_perpetual_1(),
				m.deployment_perpetual_2(),
				m.deployment_perpetual_3(),
				m.deployment_perpetual_4()
			]
		},
		{
			name: m.deployment_saas(),
			tag: m.deployment_saas_tag(),
			body: m.deployment_saas_body(),
			points: [
				m.deployment_saas_1(),
				m.deployment_saas_2(),
				m.deployment_saas_3(),
				m.deployment_saas_4()
			]
		}
	]);
</script>

<svelte:head>
	<title>{m.site_name()} — {m.site_tagline()}</title>
	<meta name="description" content={m.site_description()} />
	<meta property="og:title" content="{m.site_name()} — {m.site_tagline()}" />
	<meta property="og:description" content={m.site_description()} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{SITE_URL}/longLogo.png" />
</svelte:head>

<!-- Hero -->
<section class="mx-auto max-w-6xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-20">
	<!--
		The hero animates on load, not on scroll: it is already on screen, so there
		is nothing to reveal. `--enter` staggers each part down the page. This is
		the one orchestrated moment on the site; everything below it is a quieter
		version of the same idea.
	-->
	<p class="eyebrow enter mb-6 text-brand-gold" style="--enter: 0">{m.home_hero_eyebrow()}</p>

	<div class="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end">
		<h1 class="display enter text-[clamp(2.5rem,7vw,4.5rem)]" style="--enter: 1">
			{m.home_hero_title()}
		</h1>
		<div class="enter space-y-4" style="--enter: 2">
			<p class="text-lg leading-relaxed text-balance text-muted-foreground">
				{m.home_hero_body()}
			</p>
			<div class="flex flex-wrap gap-3 pt-2">
				<Button href={localizeHref('/contact')} size="lg">
					{m.cta_book_demo()}
					<ArrowRight class="size-4" aria-hidden="true" />
				</Button>
				<Button href={localizeHref('/about')} size="lg" variant="outline">
					{m.nav_about()}
				</Button>
			</div>
			<p class="pt-1 font-mono text-xs text-muted-foreground">{m.home_hero_note()}</p>
		</div>
	</div>

	<div class="enter mt-14 sm:mt-20" style="--enter: 3">
		<RecordFlow />
	</div>
</section>

<!-- The nine modules -->
<Section
	id="modules"
	eyebrow={m.home_modules_eyebrow()}
	title={m.home_modules_title()}
	lede={m.home_modules_body()}
>
	<ul class="grid gap-x-8 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
		{#each modules as module, index (module.name)}
			<li use:reveal={{ delay: stagger(index, 45) }} class="border-t py-5">
				<h3 class="text-sm font-semibold">{module.name}</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{module.body}</p>
			</li>
		{/each}
	</ul>
</Section>

<!-- Deployment models -->
<Section
	eyebrow={m.home_deployment_eyebrow()}
	title={m.home_deployment_title()}
	lede={m.home_deployment_body()}
>
	<div class="grid gap-6 lg:grid-cols-2">
		{#each deployments as model, index (model.name)}
			<div
				use:reveal={{ delay: stagger(index, 110) }}
				class="rounded-lg border p-6 sm:p-8 {index === 0
					? 'border-brand-gold/50'
					: 'border-primary/40'}"
			>
				<div class="flex flex-wrap items-baseline justify-between gap-3">
					<h3 class="display text-2xl">{model.name}</h3>
					<span class="eyebrow text-muted-foreground">{model.tag}</span>
				</div>
				<p class="mt-4 text-sm leading-relaxed text-muted-foreground">{model.body}</p>
				<ul class="mt-6 space-y-0">
					{#each model.points as point (point)}
						<li class="flex items-baseline gap-3 border-t py-2.5 text-sm">
							<span
								class="{index === 0 ? 'bg-brand-gold' : 'bg-primary'} size-1 shrink-0 rounded-full"
								aria-hidden="true"
							></span>
							<span>{point}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	<p class="mt-6 text-sm text-muted-foreground">{m.deployment_footnote()}</p>
</Section>

<!-- Services -->
<Section eyebrow={m.home_services_eyebrow()} title={m.home_services_title()}>
	<div class="grid gap-x-10 gap-y-px sm:grid-cols-2">
		{#each services as service, index (service.name)}
			<div use:reveal={{ delay: stagger(index, 60) }} class="border-t py-6">
				<h3 class="text-base font-semibold">{service.name}</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{service.body}</p>
			</div>
		{/each}
	</div>
</Section>

<!-- Industries -->
<Section
	eyebrow={m.home_industries_eyebrow()}
	title={m.home_industries_title()}
	lede={m.home_industries_body()}
>
	<ul class="flex flex-wrap gap-2">
		{#each industries as industry, index (industry)}
			<li
				use:reveal={{ delay: stagger(index, 70), y: 8 }}
				class="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
			>
				{industry}
			</li>
		{/each}
	</ul>
</Section>

<!-- Selected work -->
{#if data.projects.length}
	<Section eyebrow={m.home_work_eyebrow()} title={m.home_work_title()} lede={m.home_work_body()}>
		{#snippet aside()}
			<Button href={localizeHref('/projects')} variant="outline" size="sm">
				{m.cta_see_all_projects()}
			</Button>
		{/snippet}
		<div class="grid gap-10 sm:grid-cols-2">
			{#each data.projects as project, index (project.id)}
				<ProjectCard {project} delay={stagger(index, 110)} />
			{/each}
		</div>
	</Section>
{/if}

<!-- Insights -->
{#if data.posts.length}
	<Section
		eyebrow={m.home_insights_eyebrow()}
		title={m.home_insights_title()}
		lede={m.home_insights_body()}
	>
		{#snippet aside()}
			<Button href={localizeHref('/blogs')} variant="outline" size="sm">
				{m.cta_all_articles()}
			</Button>
		{/snippet}
		<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.posts as post, index (post.id)}
				<PostCard {post} delay={stagger(index, 90)} />
			{/each}
		</div>
	</Section>
{/if}

<CtaBand title={m.home_cta_title()} body={m.home_cta_body()} />
