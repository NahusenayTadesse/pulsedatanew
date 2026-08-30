<script lang="ts">
	import { Check } from '@lucide/svelte';
	import Section from '$lib/components/site/Section.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import { reveal, stagger } from '$lib/actions/reveal';
	import { SITE_URL } from '$lib/site';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The team is written here rather than kept in a table.
	 *
	 * Three people who each need a bilingual bio would be a table with six text
	 * columns that changes when the company changes, which is roughly never —
	 * and translating a bio is an editing job, not a data-entry one. In the
	 * message files it is version-controlled alongside the markup it sits in.
	 */
	const team = $derived([
		{ name: m.team_surafel_name(), role: m.team_surafel_role(), bio: m.team_surafel_bio() },
		{ name: m.team_nahusenay_name(), role: m.team_nahusenay_role(), bio: m.team_nahusenay_bio() },
		{ name: m.team_nahom_name(), role: m.team_nahom_role(), bio: m.team_nahom_bio() }
	]);

	const technicalPoints = $derived([
		m.about_technical_point_1(),
		m.about_technical_point_2(),
		m.about_technical_point_3()
	]);

	const reasons = $derived([
		{ title: m.about_why_1_title(), body: m.about_why_1_body() },
		{ title: m.about_why_2_title(), body: m.about_why_2_body() },
		{ title: m.about_why_3_title(), body: m.about_why_3_body() },
		{ title: m.about_why_4_title(), body: m.about_why_4_body() }
	]);

	/** Initials for the team avatars — no photographs have been supplied yet. */
	const initials = (name: string) =>
		name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0])
			.join('');
</script>

<svelte:head>
	<title>{m.nav_about()} · {m.site_name()}</title>
	<meta name="description" content={m.about_intro()} />
	<meta property="og:title" content="{m.nav_about()} · {m.site_name()}" />
	<meta property="og:description" content={m.about_intro()} />
	<meta property="og:image" content="{SITE_URL}/longLogo.png" />
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
	<p class="eyebrow enter mb-6 text-brand-gold" style="--enter: 0">{m.about_eyebrow()}</p>
	<h1 class="display enter max-w-3xl text-[clamp(2.25rem,6vw,4rem)]" style="--enter: 1">
		{m.about_title()}
	</h1>
	<p class="enter mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style="--enter: 2">
		{m.about_intro()}
	</p>
</section>

<!-- Mission and vision, side by side because they answer the same question at
     two horizons: what we do now, and where it goes. -->
<Section>
	<div class="grid gap-px sm:grid-cols-2 sm:gap-x-12">
		<div use:reveal class="border-t pt-6">
			<h2 class="eyebrow mb-4 text-brand-gold">{m.about_mission_title()}</h2>
			<p class="text-lg leading-relaxed text-balance">{m.about_mission_body()}</p>
		</div>
		<div use:reveal={{ delay: 110 }} class="border-t pt-6">
			<h2 class="eyebrow mb-4 text-brand-gold">{m.about_vision_title()}</h2>
			<p class="text-lg leading-relaxed text-balance">{m.about_vision_body()}</p>
		</div>
	</div>
</Section>

<Section eyebrow={m.about_technical_eyebrow()} title={m.about_technical_title()}>
	<div class="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
		<p class="text-lg leading-relaxed text-muted-foreground">{m.about_technical_body()}</p>
		<ul class="space-y-0 self-start">
			{#each technicalPoints as point, index (point)}
				<li
					use:reveal={{ delay: stagger(index, 80) }}
					class="flex items-start gap-3 border-t py-4 text-sm"
				>
					<Check class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
					<span>{point}</span>
				</li>
			{/each}
		</ul>
	</div>
</Section>

<Section eyebrow={m.about_team_eyebrow()} title={m.about_team_title()}>
	<ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each team as person, index (person.name)}
			<li use:reveal={{ delay: stagger(index, 100) }} class="card-lift border-t pt-6">
				<div
					class="display mb-5 flex size-14 items-center justify-center rounded-full bg-secondary text-lg text-secondary-foreground"
					aria-hidden="true"
				>
					{initials(person.name)}
				</div>
				<h3 class="text-base font-semibold">{person.name}</h3>
				<p class="eyebrow mt-2 text-brand-gold">{person.role}</p>
				<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
			</li>
		{/each}
	</ul>
</Section>

<Section eyebrow={m.about_why_eyebrow()} title={m.about_why_title()} lede={m.about_why_body()}>
	<div class="grid gap-x-10 gap-y-px sm:grid-cols-2">
		{#each reasons as reason, index (reason.title)}
			<div use:reveal={{ delay: stagger(index, 70) }} class="border-t py-6">
				<h3 class="text-base font-semibold">{reason.title}</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
			</div>
		{/each}
	</div>
</Section>

<CtaBand title={m.home_cta_title()} body={m.home_cta_body()} />
