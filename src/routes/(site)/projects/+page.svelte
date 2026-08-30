<script lang="ts">
	import ProjectCard from '$lib/components/site/ProjectCard.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { stagger } from '$lib/actions/reveal';
	import { SITE_URL } from '$lib/site';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.nav_projects()} · {m.site_name()}</title>
	<meta name="description" content={m.projects_intro()} />
	<meta property="og:title" content="{m.nav_projects()} · {m.site_name()}" />
	<meta property="og:description" content={m.projects_intro()} />
	<meta property="og:image" content="{SITE_URL}/longLogo.png" />
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
		<div class="grid gap-12 sm:grid-cols-2">
			{#each data.projects as project, index (project.id)}
				<ProjectCard {project} delay={stagger(index, 110)} />
			{/each}
		</div>
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
