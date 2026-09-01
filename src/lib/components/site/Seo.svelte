<script lang="ts">
	import { page } from '$app/state';
	import { getLocale } from '$lib/paraglide/runtime';
	import { seoUrls } from '$lib/seo';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The canonical and `hreflang` tags, on every public page.
	 *
	 * Rendered from `page.url` rather than taking a path, so a page cannot
	 * declare a canonical that disagrees with the address it was served at —
	 * the mistake that quietly de-indexes a section.
	 *
	 * Sits in `(site)/+layout.svelte`, which is also why it is not in the root
	 * layout: the dashboard and login are `noindex`, and pointing a crawler at
	 * canonical URLs for them would be working against that.
	 */
	const { canonical, alternates } = $derived(seoUrls(page.url.pathname));

	/** `am_ET` / `en_US`: Open Graph wants a territory, `hreflang` does not. */
	const ogLocale = $derived(getLocale() === 'am' ? 'am_ET' : 'en_US');
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
	<!-- The same URL again for social cards: a share of `/am/about` should not
	     resolve back to the English page, and vice versa. -->
	<meta property="og:url" content={canonical} />
	{#each alternates as alternate (alternate.hreflang)}
		<link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />
	{/each}

	<meta property="og:site_name" content={m.site_name()} />
	<meta property="og:locale" content={ogLocale} />
	<meta property="og:locale:alternate" content={ogLocale === 'am_ET' ? 'en_US' : 'am_ET'} />

	<!--
		The card type, set once for the whole site.

		`summary_large_image` is what turns a share into a full-width card instead
		of a thumbnail beside two lines of text. There is deliberately no
		`twitter:image` here: X falls back to `og:image`, which every page already
		sets to either its own cover or the 1200x630 house card — a second tag
		would be one more thing to keep in step for no gain.
	-->
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
