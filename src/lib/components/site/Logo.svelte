<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The wordmark, which is two different files rather than one recoloured.
	 *
	 * `longLogo.png` is teal-on-light and `longLogoforDark.png` is gold-on-dark;
	 * they are not the same artwork tinted, so swapping the source is the only
	 * honest way to do it. Both are rendered and one is hidden by CSS so the
	 * correct mark is already painted before hydration decides which — a logo
	 * that flickers on every load is worse than either version.
	 */
	let { variant = 'long', class: className = '' }: { variant?: 'long' | 'mark'; class?: string } =
		$props();

	const light = $derived(variant === 'long' ? '/longLogo.png' : '/mainLogo.png');
	const dark = $derived(variant === 'long' ? '/longLogoforDark.png' : '/mainLogoforDark.png');
</script>

<a
	href={localizeHref('/')}
	class="inline-flex shrink-0 items-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:outline-none {className}"
	aria-label={m.site_name()}
>
	<img src={light} alt={m.site_name()} class="h-full w-auto object-contain dark:hidden" />
	<img
		src={dark}
		alt={m.site_name()}
		class="hidden h-full w-auto object-contain dark:block"
		aria-hidden="true"
	/>
</a>
