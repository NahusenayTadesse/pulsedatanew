<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import './layout.css';

	/**
	 * The root layout, deliberately almost empty.
	 *
	 * Everything visible — header, footer, the ambient background — belongs to
	 * the public site and lives in `(site)/+layout.svelte`. The dashboard, the
	 * login page and the file endpoints sit outside that group and inherit only
	 * what genuinely applies to every response: the stylesheet, the theme
	 * watcher and a toast host.
	 *
	 * The root layout cannot be escaped by any route, so anything put here is a
	 * decision about *every* page including the admin ones. The marketing site's
	 * footer appearing under the enquiry inbox is what happens when that is
	 * forgotten.
	 */
	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#027F81" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#12211f" media="(prefers-color-scheme: dark)" />
	<link rel="icon" href="/mainLogo.png" />
</svelte:head>

<ModeWatcher />
<Toaster position="top-center" />

{@render children()}
