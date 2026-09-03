<script lang="ts">
	import PostCard from '$lib/components/site/PostCard.svelte';
	import CtaBand from '$lib/components/site/CtaBand.svelte';
	import FilterBar from '$lib/components/site/FilterBar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { stagger } from '$lib/actions/reveal';
	import { OG_IMAGE } from '$lib/seo';
	import { pick } from '$lib/i18n';
	import { facetsOf, matchesQuery, passesFacet, searchText, type FilterGroup } from '$lib/filters';
	import { filterState } from '$lib/filters.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	/**
	 * The filter state, seeded from the URL and written back to it.
	 *
	 * Two axes: what the post is about, and who wrote it. Both are declared here
	 * rather than discovered, because they are also the URL keys — `?category=`
	 * and `?author=` — and a key that appeared only when a post happened to carry
	 * that column would be a link that stopped working when it did not.
	 */
	const filters = filterState(['category', 'author']);

	/** How many posts are drawn before "show more". */
	const PAGE = 9;
	let limit = $state(PAGE);

	/**
	 * Each post's searchable text, built once per post rather than per keystroke.
	 *
	 * Both languages go in whichever one is being read — see `matchesQuery`. The
	 * body is not here: it is deliberately not loaded by `listPosts`, since
	 * shipping every article in full to filter a nine-card grid would cost more
	 * than the whole rest of the page.
	 */
	const rows = $derived(
		data.posts.map((post) => ({
			post,
			haystack: searchText(
				post.title,
				post.titleAm,
				post.excerpt,
				post.excerptAm,
				post.category,
				post.categoryAm,
				post.author,
				post.authorAm
			)
		}))
	);

	const categories = $derived(
		facetsOf(data.posts, (post) =>
			post.category ? { value: post.category, label: pick(post.category, post.categoryAm) } : null
		)
	);

	const authors = $derived(
		facetsOf(data.posts, (post) =>
			post.author ? { value: post.author, label: pick(post.author, post.authorAm) } : null
		)
	);

	const groups = $derived<FilterGroup[]>([
		{
			key: 'category',
			legend: m.blogs_category(),
			facets: categories,
			selected: filters.selected('category')
		},
		{
			key: 'author',
			legend: m.filter_author(),
			facets: authors,
			selected: filters.selected('author')
		}
	]);

	const matched = $derived(
		rows
			.filter(({ post, haystack }) => {
				if (!matchesQuery(haystack, filters.q)) return false;
				if (!passesFacet(filters.selected('category'), [post.category])) return false;
				return passesFacet(filters.selected('author'), [post.author]);
			})
			.map(({ post }) => post)
	);

	/**
	 * `publishedAt` may be null on a row that was published without a date, so it
	 * sorts to the end in both directions rather than pretending to be the epoch —
	 * the same rule `DataTable` applies, and for the same reason: a missing date
	 * is unknown, not oldest.
	 */
	const time = (value: Date | string | null) => (value ? new Date(value).getTime() : null);

	const sorted = $derived.by(() => {
		const list = [...matched];

		if (filters.sort === 'az') {
			return list.sort((a, b) =>
				pick(a.title, a.titleAm).localeCompare(pick(b.title, b.titleAm), undefined, {
					numeric: true
				})
			);
		}

		return list.sort((a, b) => {
			const left = time(a.publishedAt);
			const right = time(b.publishedAt);
			if (left == null && right == null) return 0;
			if (left == null) return 1;
			if (right == null) return -1;
			return filters.sort === 'oldest' ? left - right : right - left;
		});
	});

	/**
	 * The lead article, and only when nothing is filtered.
	 *
	 * A featured post at twice the size is an editorial statement about the blog
	 * as a whole. Once a reader has asked a question, the biggest card should be
	 * the best answer to it, not the one the company chose last month — so under
	 * a filter every result is drawn at the same size and ranked by the sort they
	 * picked.
	 */
	const unfiltered = $derived(
		!filters.q.trim() &&
			groups.every((group) => group.selected.length === 0) &&
			filters.sort === 'newest'
	);

	const lead = $derived(
		unfiltered
			? ([...sorted].sort((a, b) => Number(b.featured) - Number(a.featured))[0] ?? null)
			: null
	);

	const rest = $derived(lead ? sorted.filter((post) => post.id !== lead.id) : sorted);

	const visible = $derived(rest.slice(0, limit));

	/*
	 * Back to the first page whenever the result set changes underneath.
	 * Narrowing a search while showing 27 posts and then clearing it should not
	 * leave the reader 27 cards deep in a list they have not scrolled.
	 */
	$effect(() => {
		void sorted;
		limit = PAGE;
	});
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
	{#if data.posts.length}
		<div class="mb-12">
			<FilterBar
				bind:q={filters.q}
				bind:sort={filters.sort}
				{groups}
				onToggle={(key, value) => filters.toggle(key, value)}
				onClear={() => filters.clear()}
				shown={sorted.length}
				total={data.posts.length}
				placeholder={m.blogs_search_placeholder()}
			/>
		</div>

		{#if sorted.length === 0}
			<!-- A dead end needs a way out, and the way out is the control that
			     caused it — not a link to somewhere else on the site. -->
			<div class="rounded-lg border border-dashed p-12 text-center">
				<p class="text-lg text-muted-foreground">{m.filter_no_results()}</p>
				<Button variant="outline" class="mt-5" onclick={() => filters.clear()}>
					{m.filter_clear_all()}
				</Button>
			</div>
		{:else if lead}
			<div class="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
				<PostCard post={lead} featured level={2} />

				{#if visible.length}
					<div class="grid content-start gap-8">
						{#each visible.slice(0, 3) as post, index (post.id)}
							<PostCard {post} level={2} delay={stagger(index, 90)} />
						{/each}
					</div>
				{/if}
			</div>

			{#if visible.length > 3}
				<div class="mt-16 border-t pt-10">
					<h2 class="eyebrow mb-8 text-brand-gold">{m.blogs_all_posts()}</h2>
					<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
						{#each visible.slice(3) as post, index (post.id)}
							<PostCard {post} delay={stagger(index, 80)} />
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
				{#each visible as post, index (post.id)}
					<PostCard {post} level={2} delay={stagger(index, 80)} />
				{/each}
			</div>
		{/if}

		{#if rest.length > limit}
			<!--
				A button, not an infinite scroll. Loading on scroll takes the footer
				away from anyone trying to reach it and gives a reader no way to stop,
				and there is nothing to fetch here anyway — every post is already in
				the page, so this only decides how many are drawn.
			-->
			<div class="mt-14 flex justify-center">
				<Button variant="outline" size="lg" onclick={() => (limit += PAGE)}>
					{m.filter_show_more({ count: String(Math.min(PAGE, rest.length - limit)) })}
				</Button>
			</div>
		{/if}
	{:else}
		<p class="max-w-xl text-lg leading-relaxed text-muted-foreground">{m.blogs_empty()}</p>
	{/if}
</section>

<CtaBand title={m.home_cta_title()} body={m.home_cta_body()} />
