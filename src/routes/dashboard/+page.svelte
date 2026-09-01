<script lang="ts">
	import { ArrowRight, Briefcase, FileText, Inbox, PenLine } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import EnquiryStatus from '$lib/components/admin/EnquiryStatus.svelte';
	import TrafficPanel from '$lib/components/admin/TrafficPanel.svelte';
	import { formatDateTime } from '$lib/components/admin/format';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const stats = $derived([
		{ label: m.dash_stat_projects(), value: data.stats.projects, icon: Briefcase },
		{ label: m.dash_stat_articles(), value: data.stats.posts, icon: FileText },
		{ label: m.dash_stat_new_enquiries(), value: data.stats.enquiries, icon: Inbox },
		{ label: m.dash_stat_drafts(), value: data.stats.drafts, icon: PenLine }
	]);
</script>

<div class="space-y-10">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<h1 class="display text-2xl">{m.dash_overview()}</h1>
		<div class="flex flex-wrap gap-2">
			<Button href={localizeHref('/dashboard/projects/new')} size="sm" variant="outline">
				{m.dash_new_project()}
			</Button>
			<Button href={localizeHref('/dashboard/blogs/new')} size="sm">
				{m.dash_new_article()}
			</Button>
		</div>
	</div>

	<dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat (stat.label)}
			{@const Icon = stat.icon}
			<div class="rounded-lg border p-5">
				<div class="flex items-center justify-between">
					<dt class="eyebrow text-muted-foreground">{stat.label}</dt>
					<Icon class="size-4 text-muted-foreground" aria-hidden="true" />
				</div>
				<dd class="display mt-3 text-3xl tabular-nums">{stat.value}</dd>
			</div>
		{/each}
	</dl>

	<TrafficPanel traffic={data.traffic} series={data.series} startedAt={data.startedAt} />

	<section aria-labelledby="recent">
		<div class="mb-4 flex items-center justify-between">
			<h2 id="recent" class="text-base font-semibold">{m.dash_recent_enquiries()}</h2>
			<Button href={localizeHref('/dashboard/enquiries')} size="sm" variant="ghost">
				{m.dash_enquiry_all()}
				<ArrowRight class="size-3.5" aria-hidden="true" />
			</Button>
		</div>

		{#if data.recent.length}
			<ul class="divide-y rounded-lg border">
				{#each data.recent as enquiry (enquiry.id)}
					<li>
						<a
							href={localizeHref(`/dashboard/enquiries/${enquiry.id}`)}
							class="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 transition-colors hover:bg-secondary/50"
						>
							<span class="min-w-0 flex-1">
								<span class="block truncate text-sm font-medium">{enquiry.name}</span>
								<span class="block truncate text-xs text-muted-foreground">{enquiry.email}</span>
							</span>
							<EnquiryStatus status={enquiry.status} />
							<span class="font-mono text-xs text-muted-foreground">
								{formatDateTime(enquiry.createdAt)}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-lg border p-8 text-center text-sm text-muted-foreground">
				{m.dash_nothing_yet()}
			</p>
		{/if}
	</section>
</div>
