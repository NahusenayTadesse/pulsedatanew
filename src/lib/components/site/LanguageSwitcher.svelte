<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
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

	/**
	 * A full navigation rather than a client-side one.
	 *
	 * The document's `lang` and `dir` are set by the server via
	 * `transformPageChunk`, so a client-side `goto` would move to the Amharic
	 * URL while leaving `<html lang="en">` behind — which is what a screen
	 * reader uses to choose a voice.
	 */
	function switchTo(locale: Locale) {
		if (locale === current) return;
		goto(hrefFor(locale), { invalidateAll: true });
	}
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
			onclick={(event: MouseEvent) => {
				event.preventDefault();
				switchTo(locale);
			}}
			aria-current={locale === current ? 'true' : undefined}
			class="h-6 rounded-full px-2.5 text-xs font-medium {locale === current
				? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
				: 'text-muted-foreground'}"
		>
			{names[locale] ?? locale}
		</Button>
	{/each}
</div>
