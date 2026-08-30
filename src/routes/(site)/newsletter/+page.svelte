<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	/**
	 * Only ever seen without JavaScript: with it, the footer's form enhances and
	 * the confirmation appears in place. `load` redirects a direct visit away.
	 */
	let { form } = $props();
</script>

<svelte:head><title>{m.newsletter_submit()} · {m.site_name()}</title></svelte:head>

<div class="mx-auto flex max-w-xl flex-col items-start gap-6 px-5 py-24 sm:px-8">
	<Check class="size-8 text-primary" aria-hidden="true" />
	<h1 class="display text-3xl">{form?.message ?? m.newsletter_success()}</h1>
	<Button href={localizeHref('/')}>{m.error_go_home()}</Button>
</div>
