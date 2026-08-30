<script lang="ts">
	import { Mail, MapPin, Phone } from '@lucide/svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { CONTACT } from '$lib/site';
	import * as m from '$lib/paraglide/messages';
	import Logo from './Logo.svelte';
	import NewsletterForm from './NewsletterForm.svelte';

	const year = new Date().getFullYear();

	const company = $derived([
		{ href: '/about', label: m.nav_about() },
		{ href: '/projects', label: m.nav_projects() },
		{ href: '/blogs', label: m.nav_blogs() },
		{ href: '/contact', label: m.nav_contact() }
	]);

	const solutions = $derived([
		m.service_implementation(),
		m.service_licensing(),
		m.service_web(),
		m.service_support()
	]);
</script>

<footer class="border-t">
	<div class="mx-auto max-w-6xl px-5 py-14 sm:px-8">
		<div class="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
			<div class="space-y-5">
				<Logo class="h-8" />
				<p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
					{m.site_tagline()}
				</p>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li class="flex items-start gap-2.5">
						<MapPin class="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
						<span>{m.contact_address_value()}</span>
					</li>
					{#if CONTACT.email}
						<li class="flex items-start gap-2.5">
							<Mail class="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
							<a href="mailto:{CONTACT.email}" class="transition-colors hover:text-foreground">
								{CONTACT.email}
							</a>
						</li>
					{/if}
					{#if CONTACT.phone}
						<li class="flex items-start gap-2.5">
							<Phone class="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
							<a href="tel:{CONTACT.phoneHref}" class="transition-colors hover:text-foreground">
								{CONTACT.phone}
							</a>
						</li>
					{/if}
				</ul>
			</div>

			<nav aria-labelledby="footer-company">
				<h2 id="footer-company" class="eyebrow mb-4 text-muted-foreground">
					{m.footer_company()}
				</h2>
				<ul class="space-y-2.5 text-sm">
					{#each company as link (link.href)}
						<li>
							<a
								href={localizeHref(link.href)}
								class="text-muted-foreground transition-colors hover:text-foreground"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div>
				<h2 class="eyebrow mb-4 text-muted-foreground">{m.footer_solutions()}</h2>
				<ul class="space-y-2.5 text-sm text-muted-foreground">
					{#each solutions as item (item)}
						<li>{item}</li>
					{/each}
				</ul>
			</div>

			<div>
				<h2 class="eyebrow mb-4 text-muted-foreground">{m.footer_connect()}</h2>
				<NewsletterForm />
			</div>
		</div>

		<div
			class="mt-12 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
		>
			<p>{m.footer_rights({ year: String(year) })}</p>
			<p class="font-mono">{m.footer_built()}</p>
		</div>
	</div>
</footer>
