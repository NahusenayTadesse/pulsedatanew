<script lang="ts">
	import { page } from '$app/state';
	import { Menu } from '@lucide/svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref, deLocalizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	let open = $state(false);

	const links = $derived([
		{ href: '/', label: m.nav_home() },
		{ href: '/about', label: m.nav_about() },
		{ href: '/projects', label: m.nav_projects() },
		{ href: '/blogs', label: m.nav_blogs() },
		{ href: '/contact', label: m.nav_contact() }
	]);

	/**
	 * Compared with the locale stripped, so `/am/projects` marks Projects active
	 * exactly as `/projects` does. A section stays active on its detail pages —
	 * a reader on `/blogs/some-post` should still see where they are.
	 */
	const path = $derived(deLocalizeHref(page.url.pathname));
	const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
</script>

<header
	class="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
		<Logo class="h-7 sm:h-8" />

		<nav class="ms-auto hidden items-center gap-1 lg:flex" aria-label={m.nav_menu()}>
			{#each links as link (link.href)}
				<a
					href={localizeHref(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none {isActive(
						link.href
					)
						? 'text-foreground'
						: 'text-muted-foreground'}"
				>
					{link.label}
					{#if isActive(link.href)}
						<!-- The active marker is gold, the one place in the chrome it appears:
						     it is the page you are on, which is worth exactly one accent. -->
						<span
							class="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-gold"
							aria-hidden="true"
						></span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="ms-auto flex items-center gap-2 lg:ms-0">
			<div class="hidden sm:block"><LanguageSwitcher /></div>
			<ThemeToggle />
			<Button href={localizeHref('/contact')} size="sm" class="hidden lg:inline-flex">
				{m.cta_book_demo()}
			</Button>

			<Sheet.Root bind:open>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="lg:hidden">
							<Menu class="size-5" />
							<span class="sr-only">{m.nav_open_menu()}</span>
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-full max-w-sm">
					<Sheet.Header>
						<Sheet.Title class="sr-only">{m.nav_menu()}</Sheet.Title>
					</Sheet.Header>
					<nav class="flex flex-col gap-1 px-4" aria-label={m.nav_menu()}>
						{#each links as link (link.href)}
							<a
								href={localizeHref(link.href)}
								onclick={() => (open = false)}
								aria-current={isActive(link.href) ? 'page' : undefined}
								class="display border-b py-4 text-2xl transition-colors {isActive(link.href)
									? 'text-primary'
									: 'hover:text-primary'}"
							>
								{link.label}
							</a>
						{/each}
					</nav>
					<div class="mt-6 flex flex-col gap-4 px-4">
						<Button href={localizeHref('/contact')} onclick={() => (open = false)}>
							{m.cta_book_demo()}
						</Button>
						<LanguageSwitcher />
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>
