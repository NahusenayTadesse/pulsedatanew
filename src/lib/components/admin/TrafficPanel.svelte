<script lang="ts">
	import { Activity, Eye, Users } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The visitor counter, drawn from the site's own `page_views` table.
	 *
	 * One series — views per day — so there is no legend to draw: the heading
	 * names what the bars are. Visitors are a *different measure on a different
	 * scale*, so they are a tile and a tooltip line rather than a second axis;
	 * two y-scales on one chart is the one thing a chart like this must not do.
	 *
	 * Days with no traffic are real zeros and are drawn as such — `dailyViews`
	 * fills the gaps precisely so a quiet weekend does not disappear into a
	 * straight line between the days on either side of it.
	 */
	let {
		traffic,
		series,
		startedAt
	}: {
		traffic: {
			today: number;
			week: number;
			month: number;
			visitorsWeek: number;
			topPages: { path: string; views: number }[];
			referrers: { host: string; views: number }[];
		};
		series: { day: string; views: number; visitors: number }[];
		startedAt: number;
	} = $props();

	/** The tallest bar sets the scale; a flat run of zeros must not divide by it. */
	const peak = $derived(Math.max(1, ...series.map((day) => day.views)));

	const dayLabel = (day: string) =>
		new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(day));

	/** "3 days", "7 hours" — coarse on purpose; the exact second means nothing. */
	const since = $derived.by(() => {
		const seconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(seconds / 3600);
		if (hours >= 48) return m.dash_uptime_days({ n: Math.floor(hours / 24) });
		if (hours >= 1) return m.dash_uptime_hours({ n: hours });
		// "0 minutes" is not a duration anybody says out loud.
		return minutes >= 1 ? m.dash_uptime_minutes({ n: minutes }) : m.dash_uptime_moments();
	});

	const tiles = $derived([
		{ label: m.dash_traffic_today(), value: traffic.today, icon: Eye },
		{ label: m.dash_traffic_week(), value: traffic.week, icon: Eye },
		{ label: m.dash_traffic_visitors(), value: traffic.visitorsWeek, icon: Users },
		{ label: m.dash_traffic_month(), value: traffic.month, icon: Activity }
	]);
</script>

<section class="space-y-5" aria-labelledby="traffic">
	<div class="flex flex-wrap items-baseline justify-between gap-3">
		<h2 id="traffic" class="text-base font-semibold">{m.dash_traffic()}</h2>
		<p class="text-xs text-muted-foreground">{m.dash_traffic_note()}</p>
	</div>

	<dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each tiles as tile (tile.label)}
			{@const Icon = tile.icon}
			<div class="rounded-lg border p-5">
				<div class="flex items-center justify-between">
					<dt class="eyebrow text-muted-foreground">{tile.label}</dt>
					<Icon class="size-4 text-muted-foreground" aria-hidden="true" />
				</div>
				<dd class="display mt-3 text-3xl tabular-nums">{tile.value}</dd>
			</div>
		{/each}
	</dl>

	<!--
		Two rows rather than two columns of unequal height. The chart is a fixed
		40 units tall: stretched to match a column of three cards beside it, a
		single busy day became a 400-pixel slab, which reads as a design element
		rather than a measurement.
	-->
	<div class="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
		<div class="rounded-lg border p-5">
			<h3 class="text-sm font-medium">{m.dash_traffic_chart()}</h3>

			<!--
				Bars are plain elements, not an SVG chart library: fourteen numbers do
				not justify a dependency, and a div with a height is legible in the DOM
				inspector when a number looks wrong.
			-->
			<ul class="mt-5 flex h-40 items-end gap-[2px]">
				{#each series as day (day.day)}
					<li class="group relative flex h-full flex-1 flex-col justify-end">
						<div
							class="w-full rounded-t bg-brand-teal/85 transition-colors group-hover:bg-brand-teal"
							style="height: {Math.max(day.views ? 3 : 1, (day.views / peak) * 100)}%"
						></div>

						<!-- The hover layer. `hidden` until hover so it never overlaps the
						     bars, and the same text is in the visually-hidden list below so
						     a screen reader gets the series without pointing at it. -->
						<div
							class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap shadow-sm group-hover:block"
						>
							<span class="font-medium">{dayLabel(day.day)}</span>
							<span class="block text-muted-foreground">
								{m.dash_traffic_tooltip({ views: day.views, visitors: day.visitors })}
							</span>
						</div>
					</li>
				{/each}
			</ul>

			<div class="mt-2 flex justify-between text-xs text-muted-foreground">
				<span>{dayLabel(series[0]?.day ?? '')}</span>
				<span>{dayLabel(series.at(-1)?.day ?? '')}</span>
			</div>

			<!-- Identity by colour alone would exclude a screen reader entirely; the
			     numbers themselves are the fallback, not a description of them. -->
			<ul class="sr-only">
				{#each series as day (day.day)}
					<li>
						{dayLabel(day.day)}: {m.dash_traffic_tooltip({
							views: day.views,
							visitors: day.visitors
						})}
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-lg border p-5">
			<h3 class="text-sm font-medium">{m.dash_uptime()}</h3>
			<p class="mt-3 flex items-center gap-2 text-sm">
				<!-- A dot plus a word: status must never be colour alone. -->
				<span class="size-2 rounded-full bg-primary" aria-hidden="true"></span>
				{m.dash_uptime_running({ since })}
			</p>
			<p class="mt-2 text-xs text-muted-foreground">{m.dash_uptime_hint()}</p>
			<a
				href="/health"
				target="_blank"
				rel="noopener"
				class="mt-2 inline-block font-mono text-xs text-primary hover:underline"
			>
				/health
			</a>
		</div>
	</div>

	<div class="grid gap-5 sm:grid-cols-2">
		<div class="rounded-lg border p-5">
			<h3 class="text-sm font-medium">{m.dash_traffic_pages()}</h3>
			{#if traffic.topPages.length}
				<ol class="mt-3 space-y-2">
					{#each traffic.topPages as page (page.path)}
						<li class="flex items-baseline justify-between gap-3 text-sm">
							<span class="min-w-0 truncate font-mono text-xs">{page.path}</span>
							<span class="text-muted-foreground tabular-nums">{page.views}</span>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="mt-3 text-sm text-muted-foreground">{m.dash_nothing_yet()}</p>
			{/if}
		</div>

		<div class="rounded-lg border p-5">
			<h3 class="text-sm font-medium">{m.dash_traffic_referrers()}</h3>
			{#if traffic.referrers.length}
				<ol class="mt-3 space-y-2">
					{#each traffic.referrers as referrer (referrer.host)}
						<li class="flex items-baseline justify-between gap-3 text-sm">
							<span class="min-w-0 truncate">{referrer.host}</span>
							<span class="text-muted-foreground tabular-nums">{referrer.views}</span>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="mt-3 text-sm text-muted-foreground">{m.dash_traffic_no_referrers()}</p>
			{/if}
		</div>
	</div>
</section>
