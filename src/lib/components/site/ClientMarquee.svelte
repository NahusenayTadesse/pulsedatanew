<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import { assetUrl } from '$lib/assets';
	import { pick } from '$lib/i18n';
	import type { ClientLogo } from '$lib/server/content';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The "trusted by" band: a slow, continuous run of client marks.
	 *
	 * Four decisions shape it.
	 *
	 * 1. **CSS, not JavaScript.** The whole effect is one keyframe translating a
	 *    duplicated track by exactly its own width. No library, no
	 *    requestAnimationFrame loop, no resize observer — and it keeps running
	 *    while the main thread is busy, which is the one thing a hand-rolled
	 *    scroller never manages on a mid-range phone.
	 *
	 * 2. **The duplicate is `aria-hidden`.** The seamless loop needs the list
	 *    twice; a reader using a screen reader needs it once. Without this the
	 *    band announces every client name twice in a row, which sounds like a
	 *    bug because it is one.
	 *
	 * 3. **It stops when asked.** On hover, on focus anywhere inside — so a
	 *    keyboard user tabbing to a logo is not chasing it across the screen —
	 *    and permanently under `prefers-reduced-motion`, where the track becomes
	 *    an ordinary horizontal scroller the reader moves themselves. A band of
	 *    logos is decoration; it does not get to overrule an accessibility
	 *    setting.
	 *
	 * 4. **Marks sit on a light tile.** Client logos arrive as whatever the
	 *    client has — usually dark ink on transparency — and half of them would
	 *    disappear against this site's dark theme. A tile is the only treatment
	 *    that is correct for a logo we have not seen yet, and it is the same
	 *    choice the dashboard's list already makes.
	 *
	 * Below a handful of logos there is nothing to scroll and the band renders as
	 * a plain centred row: a marquee of three marks reads as a mistake.
	 */
	let {
		clients,
		/**
		 * Seconds for one full pass.
		 *
		 * Scaled by the number of logos rather than fixed, so twenty marks do not
		 * blur past at the speed three do — the pixels-per-second stays roughly
		 * constant however many there are.
		 */
		secondsPerLogo = 4
	}: { clients: ClientLogo[]; secondsPerLogo?: number } = $props();

	/** Below this the band is a static row; above it, a marquee. */
	const MIN_TO_SCROLL = 6;

	const entries = $derived(
		clients.map((client) => {
			const name = pick(client.name, client.nameAm);
			return {
				id: client.id,
				name,
				note: pick(client.note, client.noteAm),
				src: assetUrl(client.logo),
				/** The client's name is the whole of what a logo's alt text should say. */
				alt: pick(client.logoAlt, client.logoAltAm) || name,
				/**
				 * The case study wins over the client's own site: a reader who clicks a
				 * logo on our page is asking what we did for them, not who they are.
				 * A draft case study is not a destination, so it falls through.
				 */
				href:
					client.projectSlug && client.projectStatus === 'published'
						? localizeHref(`/projects/${client.projectSlug}`)
						: (client.websiteUrl ?? null),
				external: !(client.projectSlug && client.projectStatus === 'published')
			};
		})
	);

	const scrolls = $derived(entries.length >= MIN_TO_SCROLL);
	const duration = $derived(entries.length * secondsPerLogo);
</script>

{#snippet mark(entry: (typeof entries)[number])}
	<li class="shrink-0">
		{#if entry.href}
			<a
				href={entry.href}
				target={entry.external ? '_blank' : undefined}
				rel={entry.external ? 'noreferrer noopener' : undefined}
				title={entry.note || entry.name}
				class="client-tile block rounded-lg border bg-white p-4 transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				<img
					src={entry.src}
					alt={entry.alt}
					loading="lazy"
					class="h-10 w-auto max-w-[10rem] object-contain sm:h-12"
				/>
			</a>
		{:else}
			<div class="client-tile rounded-lg border bg-white p-4">
				<img
					src={entry.src}
					alt={entry.alt}
					loading="lazy"
					class="h-10 w-auto max-w-[10rem] object-contain sm:h-12"
				/>
			</div>
		{/if}
	</li>
{/snippet}

<section aria-labelledby="trusted-by-title" class="mx-auto max-w-6xl border-t px-5 py-14 sm:px-8">
	<h2 id="trusted-by-title" class="eyebrow mb-8 text-center text-muted-foreground">
		{m.clients_trusted_by()}
	</h2>

	{#if scrolls}
		<!--
			The mask fades the marks into the page edges instead of letting them be
			chopped by `overflow: hidden`, which is what makes a loop look like a
			loop rather than like content being cut off.
		-->
		<div class="marquee" style="--marquee-duration: {duration}s">
			<ul class="marquee__track">
				{#each entries as entry (entry.id)}
					{@render mark(entry)}
				{/each}
			</ul>
			<!-- The second copy exists only to make the seam invisible. Nothing in
			     it is content, so nothing in it is announced or focusable. -->
			<ul class="marquee__track" aria-hidden="true" inert>
				{#each entries as entry (entry.id)}
					{@render mark(entry)}
				{/each}
			</ul>
		</div>
	{:else}
		<ul class="flex flex-wrap items-center justify-center gap-4">
			{#each entries as entry (entry.id)}
				{@render mark(entry)}
			{/each}
		</ul>
	{/if}
</section>

<style>
	/*
	 * Scoped here rather than in `layout.css`: this is the only thing on the
	 * site that scrolls itself, and the rules are meaningless anywhere else.
	 */
	.marquee {
		display: flex;
		gap: 1rem;
		overflow: hidden;
		/* Both properties: `mask` is standard and `-webkit-mask` is what Safari
		   still needs for a gradient mask on a flow element. */
		-webkit-mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
		mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
	}

	.marquee__track {
		display: flex;
		flex-shrink: 0;
		gap: 1rem;
		/* `min-width: 100%` guarantees the two tracks together always overflow the
		   container, so there is never a gap at the seam on a wide screen with
		   few logos. */
		min-width: 100%;
		align-items: center;
		animation: marquee var(--marquee-duration, 40s) linear infinite;
	}

	/*
	 * `-100%` of the track, plus the gap between the two tracks, is exactly
	 * where the second copy started — which is what makes the reset invisible.
	 */
	@keyframes marquee {
		to {
			transform: translateX(calc(-100% - 1rem));
		}
	}

	/* Stopped, not slowed: someone reaching for a logo has decided to read the
	   band, and a slower-moving target is still a moving target. */
	.marquee:hover .marquee__track,
	.marquee:focus-within .marquee__track {
		animation-play-state: paused;
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee {
			/* An ordinary scroller the reader drives. `overflow-x: auto` rather than
			   `hidden`, or the logos past the fold would be unreachable. */
			overflow-x: auto;
			scroll-snap-type: x proximity;
			-webkit-mask-image: none;
			mask-image: none;
		}

		.marquee__track {
			animation: none;
		}

		.marquee__track[inert] {
			/* The duplicate exists only to hide the animation's seam. With no
			   animation it is just the same logos a second time. */
			display: none;
		}
	}

	.client-tile {
		/* A consistent height so a tall logo and a wide one sit on the same line
		   rather than stepping the row. */
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 9rem;
		min-height: 5.5rem;
		scroll-snap-align: start;
	}
</style>
