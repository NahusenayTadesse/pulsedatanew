<script lang="ts">
	import PostCard from '$lib/components/site/PostCard.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import { stagger } from '$lib/actions/reveal';
	import { OG_IMAGE } from '$lib/seo';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.nav_blogs()} · {m.site_name()}</title>
	<meta name="description" content={m.blogs_intro()} />
	<meta property="og:title" content="{m.nav_blogs()} · {m.site_name()}" />
	<meta property="og:description" content={m.blogs_intro()} />
	<meta property="og:image" content={OG_IMAGE} />
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
	<p class="eyebrow enter mb-6 text-brand-gold" style="--enter: 0">{m.blogs_eyebrow()}</p>
	<h1 class="display enter max-w-3xl text-[clamp(2.25rem,6vw,4rem)]" style="--enter: 1">
		{m.blogs_title()}
	</h1>
	<p class="enter mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style="--enter: 2">
		{m.blogs_intro()}
	</p>
</section>

<section class="mx-auto max-w-6xl border-t px-5 py-16 sm:px-8 sm:py-20">
	{#if data.lead}
		<div class="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
			<PostCard post={data.lead} featured level={2} />

			{#if data.rest.length}
				<div class="grid content-start gap-8">
					{#each data.rest.slice(0, 3) as post, index (post.id)}
						<PostCard {post} level={2} delay={stagger(index, 90)} />
					{/each}
				</div>
			{/if}
		</div>

		{#if data.rest.length > 3}
			<div class="mt-16 border-t pt-10">
				<h2 class="eyebrow mb-8 text-brand-gold">{m.blogs_all_posts()}</h2>
				<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.rest.slice(3) as post, index (post.id)}
						<PostCard {post} delay={stagger(index, 80)} />
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<p class="max-w-xl text-lg leading-relaxed text-muted-foreground">{m.blogs_empty()}</p>
	{/if}
</section>

<CtaBand title={m.home_cta_title()} body={m.home_cta_body()} />
