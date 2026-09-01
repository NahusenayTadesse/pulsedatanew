<script lang="ts">
	import { page } from '$app/state';
	import { ArrowRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	const isMissing = $derived(page.status === 404);

	const title = $derived(isMissing ? m.error_404_title() : m.error_500_title());
	const body = $derived(isMissing ? m.error_404_body() : m.error_500_body());

	/**
	 * A 404 that offers only "go home" makes the visitor start again.
	 *
	 * These are the four places anyone arriving on a dead link could plausibly
	 * have been going, so the page is a junction rather than a dead end. They
	 * are only worth showing when the page is missing — on a 500 the rest of the
	 * site may be just as broken, and inviting more navigation is misleading.
	 */
	const destinations = $derived([
		{ href: '/projects', label: m.nav_projects() },
		{ href: '/blogs', label: m.nav_blogs() },
		{ href: '/about', label: m.nav_about() },
		{ href: '/contact', label: m.nav_contact() }
	]);
</script>

<svelte:head>
	<title>{title} · {m.site_name()}</title>
	<!--
		An error page must never be indexed. SvelteKit already sends the real
		status code, which is what a crawler acts on, but a soft 404 rendered at
		a URL that returned 200 — a redirect chain, a proxy — would otherwise be
		fair game.
	-->
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-32">
	<p class="eyebrow enter text-brand-gold" style="--enter: 0">{page.status}</p>

	<h1 class="display enter mt-6 text-4xl sm:text-5xl" style="--enter: 1">{title}</h1>

	<p class="enter mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground" style="--enter: 2">
		{body}
	</p>

	<div class="enter mt-9 flex flex-wrap items-center gap-3" style="--enter: 3">
		<Button href={localizeHref('/')}>{m.error_go_home()}</Button>
		{#if !isMissing}
			<!-- A reload is the only useful action on a server error, and it is the
			     one thing a link cannot do. -->
			<Button variant="outline" onclick={() => location.reload()}>{m.error_try_again()}</Button>
		{/if}
	</div>

	{#if isMissing}
		<nav class="enter mt-16 border-t pt-8" style="--enter: 4" aria-labelledby="error-where">
			<h2 id="error-where" class="eyebrow mb-5 text-muted-foreground">{m.error_404_where()}</h2>

			<ul class="grid gap-x-8 gap-y-3 sm:grid-cols-2">
				{#each destinations as destination (destination.href)}
					<li>
						<a
							href={localizeHref(destination.href)}
							class="group flex items-center justify-between border-b py-3 text-base transition-colors hover:text-primary"
						>
							{destination.label}
							<ArrowRight
								class="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
								aria-hidden="true"
							/>
						</a>
					</li>
				{/each}
			</ul>

			<p class="mt-8 text-sm text-muted-foreground">
				<a href={localizeHref('/contact')} class="underline hover:text-foreground">
					{m.error_contact_cta()}
				</a>
			</p>
		</nav>
	{/if}
</div>
