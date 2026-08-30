<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	const isMissing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{isMissing ? m.error_404_title() : m.error_500_title()} · {m.site_name()}</title>
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col items-start gap-6 px-5 py-28 sm:px-8">
	<p class="eyebrow text-brand-gold">{page.status}</p>
	<h1 class="display text-4xl sm:text-5xl">
		{isMissing ? m.error_404_title() : m.error_500_title()}
	</h1>
	<p class="text-lg text-muted-foreground">
		{isMissing ? m.error_404_body() : m.error_500_body()}
	</p>
	<Button href={localizeHref('/')}>{m.error_go_home()}</Button>
</div>
