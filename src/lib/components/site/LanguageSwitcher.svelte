<script lang="ts">
	import { page } from '$app/state';
	import { Languages } from '@lucide/svelte';
	import {
		getLocale,
		locales,
		localizeHref,
		deLocalizeHref,
		type Locale
	} from '$lib/paraglide/runtime';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as m from '$lib/paraglide/messages';

	const names: Record<string, string> = { en: 'English', am: 'አማርኛ' };
	const current = $derived(getLocale());

	/**
	 * The same page in the other language, not the home page.
	 *
	 * `deLocalizeHref` first, so switching from `/am/blogs/x` produces
	 * `/blogs/x` and not `/am/am/blogs/x`. Search is carried across because a
	 * filtered project list should survive the switch.
	 */
	const hrefFor = (locale: Locale) =>
		localizeHref(deLocalizeHref(page.url.pathname), { locale }) + page.url.search;

	/*
	 * Switching locale is a full document navigation — `data-sveltekit-reload`
	 * on the links below, and no click handler at all.
	 *
	 * It has to be. The locale is resolved on the server: the middleware in
	 * `hooks.server.ts` reads it from the URL and `transformPageChunk` writes it
	 * into `<html lang>` and `dir`. Paraglide's message functions are plain
	 * calls, not stores, so nothing in an already-rendered page re-runs when the
	 * URL changes underneath it. A client-side `goto` therefore did exactly what
	 * it was asked and nothing more: the address bar said `/am`, the page stayed
	 * in English, and one reload later it was Amharic — which is precisely the
	 * bug this replaced.
	 *
	 * The cost is a document request on a control almost nobody presses twice,
	 * and the gain is that `lang` — what a screen reader uses to pick a voice —
	 * can never disagree with the words on the page.
	 */
</script>

<div
	class="inline-flex items-center rounded-full border border-input p-0.5"
	role="group"
	aria-label={m.language_switch()}
>
	<Languages class="mx-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
	{#each locales as locale (locale)}
		<Button
			variant="ghost"
			size="sm"
			href={hrefFor(locale)}
			data-sveltekit-reload
			aria-current={locale === current ? 'true' : undefined}
			class="h-6 rounded-full px-2.5 text-xs font-medium {locale === current
				? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
				: 'text-muted-foreground'}"
		>
			{names[locale] ?? locale}
		</Button>
	{/each}
</div>
