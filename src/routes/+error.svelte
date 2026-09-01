<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import Logo from '$lib/components/site/Logo.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The error page for everything outside the public site.
	 *
	 * The `(site)` group has its own, wrapped in the marketing header and
	 * footer. This one catches the routes that sit outside it — the dashboard,
	 * the login page, the file endpoints — which previously fell through to
	 * SvelteKit's built-in error page: unstyled black-on-white with the status
	 * code and nothing else, on the half of the site the client's own staff use.
	 *
	 * Deliberately quiet. Somebody is here because their work was interrupted,
	 * and the useful things are the status, one sentence, and a way back.
	 */

	const isMissing = $derived(page.status === 404);
	const isForbidden = $derived(page.status === 401 || page.status === 403);

	const title = $derived(
		isMissing ? m.error_404_title() : isForbidden ? m.error_403_title() : m.error_admin_title()
	);

	const body = $derived(
		isMissing ? m.error_404_body() : isForbidden ? m.error_403_body() : m.error_admin_body()
	);
</script>

<svelte:head>
	<title>{title} · {m.site_name()}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center px-5 py-16">
	<div class="w-full max-w-md">
		<Logo class="mb-10 h-7" />

		<p class="eyebrow text-brand-gold">{page.status}</p>
		<h1 class="display mt-4 text-2xl">{title}</h1>
		<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>

		<div class="mt-8 flex flex-wrap gap-3">
			{#if isForbidden}
				<Button href={localizeHref('/login')}>{m.error_sign_in()}</Button>
			{:else}
				<Button href={localizeHref('/dashboard')}>{m.error_back_dashboard()}</Button>
			{/if}
			<Button variant="ghost" href={localizeHref('/')}>{m.error_go_home()}</Button>
		</div>

		{#if page.error?.message && page.status >= 500}
			<!--
				The message SvelteKit hands the client, not the stack.
				`handleError` is what decides this string, and in production it is a
				generic one — so this is safe to show and is the only thing that
				makes two reports of "it broke" distinguishable.
			-->
			<p class="mt-10 border-t pt-4 font-mono text-xs text-muted-foreground">
				{m.error_reference()}: {page.error.message}
			</p>
		{/if}
	</div>
</div>
