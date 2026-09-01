<script lang="ts">
	import { page } from '$app/state';
	import {
		Briefcase,
		ExternalLink,
		FileText,
		Inbox,
		LayoutDashboard,
		LogOut,
		Mails,
		Menu,
		Send,
		Users
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';
	import Logo from '$lib/components/site/Logo.svelte';
	import ThemeToggle from '$lib/components/site/ThemeToggle.svelte';
	import { cn } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages';

	let { children, data } = $props();

	let menuOpen = $state(false);

	const links = $derived([
		{ href: '/dashboard', label: m.dash_overview(), icon: LayoutDashboard, exact: true },
		{ href: '/dashboard/projects', label: m.dash_projects(), icon: Briefcase },
		{ href: '/dashboard/blogs', label: m.dash_blogs(), icon: FileText },
		{ href: '/dashboard/team', label: m.dash_team(), icon: Users },
		{
			href: '/dashboard/enquiries',
			label: m.dash_enquiries(),
			icon: Inbox,
			badge: data.unreadEnquiries
		},
		{ href: '/dashboard/email', label: m.dash_compose(), icon: Send, exact: true },
		{ href: '/dashboard/email/sent', label: m.dash_mail_sent(), icon: Mails }
	]);

	const path = $derived(deLocalizeHref(page.url.pathname));
	const isActive = (link: { href: string; exact?: boolean }) =>
		link.exact ? path === link.href : path.startsWith(link.href);
</script>

<svelte:head>
	<title>{m.dash_title()} · {m.site_name()}</title>
	<!-- Belt and braces alongside the `X-Robots-Tag` header in hooks.server.ts. -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#snippet nav()}
	<nav class="flex flex-col gap-1" aria-label={m.dash_title()}>
		{#each links as link (link.href)}
			{@const Icon = link.icon}
			<a
				href={localizeHref(link.href)}
				onclick={() => (menuOpen = false)}
				aria-current={isActive(link) ? 'page' : undefined}
				class={cn(
					'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
					isActive(link)
						? 'bg-secondary text-secondary-foreground'
						: 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
				)}
			>
				<Icon class="size-4 shrink-0" aria-hidden="true" />
				<span class="flex-1">{link.label}</span>
				{#if link.badge}
					<span
						class="rounded-full bg-brand-gold px-1.5 py-0.5 text-[0.6875rem] font-semibold text-black"
					>
						{link.badge}
					</span>
				{/if}
			</a>
		{/each}
	</nav>
{/snippet}

{#snippet account()}
	<div class="space-y-3 border-t pt-4">
		<p class="px-3 text-xs text-muted-foreground">
			{m.dash_signed_in_as({ name: data.user.name })}
		</p>
		<div class="flex flex-wrap gap-2 px-3">
			<Button href={localizeHref('/')} variant="outline" size="sm" target="_blank">
				<ExternalLink class="size-3.5" aria-hidden="true" />
				{m.dash_view_site()}
			</Button>
			<!-- POST, so no prefetch or embedded image can sign anyone out. -->
			<form method="POST" action={localizeHref('/logout')}>
				<Button type="submit" variant="ghost" size="sm">
					<LogOut class="size-3.5" aria-hidden="true" />
					{m.dash_sign_out()}
				</Button>
			</form>
		</div>
	</div>
{/snippet}

<div class="flex min-h-dvh">
	<!-- Desktop sidebar -->
	<aside class="hidden w-60 shrink-0 flex-col justify-between border-e p-4 lg:flex">
		<div class="space-y-6">
			<Logo class="h-7" />
			{@render nav()}
		</div>
		{@render account()}
	</aside>

	<div class="flex min-w-0 flex-1 flex-col">
		<header
			class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur"
		>
			<Sheet.Root bind:open={menuOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="lg:hidden">
							<Menu class="size-5" />
							<span class="sr-only">{m.nav_open_menu()}</span>
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="left" class="w-72 p-4">
					<Sheet.Header class="p-0">
						<Sheet.Title class="sr-only">{m.dash_title()}</Sheet.Title>
					</Sheet.Header>
					<div class="mt-6 space-y-6">
						<Logo class="h-7" />
						{@render nav()}
					</div>
					<div class="mt-8">{@render account()}</div>
				</Sheet.Content>
			</Sheet.Root>

			<span class="font-mono text-xs tracking-wider text-muted-foreground uppercase lg:hidden">
				{m.dash_title()}
			</span>

			<div class="ms-auto">
				<ThemeToggle />
			</div>
		</header>

		<main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
