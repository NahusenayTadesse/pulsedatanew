<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { getLocale } from '$lib/paraglide/runtime';
	import Header from '$lib/components/site/Header.svelte';
	import Footer from '$lib/components/site/Footer.svelte';
	import Ambient from '$lib/components/site/Ambient.svelte';
	import Seo from '$lib/components/site/Seo.svelte';
	import * as m from '$lib/paraglide/messages';

	let { children } = $props();

	/*
	 * This layout is the public site's chrome and nothing else uses it. The
	 * dashboard and the login page sit outside the `(site)` group precisely so
	 * they do not inherit a marketing header, a footer full of service links, or
	 * the drifting background — none of which belong around an enquiry inbox.
	 */

	/**
	 * Cross-fade between pages, using the browser's View Transitions API.
	 *
	 * Progressive by construction: where the API is missing — Firefox at the
	 * time of writing — this returns immediately and navigation is the ordinary
	 * instant swap, with nothing to polyfill and no library shipped. The
	 * animation itself is declared in `layout.css` against the
	 * `::view-transition-*` pseudo-elements.
	 *
	 * Reduced motion is honoured there rather than here, so the transition is
	 * still *started* and the promise still resolves — skipping it in JS risks
	 * leaving the old page's snapshot on screen if a navigation is interrupted.
	 */
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Seo />

<Ambient />

<a
	href="#main"
	class="sr-only rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100]"
>
	{m.nav_skip_to_content()}
</a>

<div class="flex min-h-dvh flex-col">
	<Header />
	<!-- `lang` is set again here rather than relying only on `<html lang>`: the
	     `:lang(am)` type rules in layout.css key off it, and a client-side
	     navigation between locales updates this before the document attribute. -->
	<main id="main" class="flex-1" lang={getLocale()}>
		{@render children()}
	</main>
	<Footer />
</div>
