<script lang="ts">
	/**
	 * The reading-progress bar on article and case-study pages.
	 *
	 * Driven by a scroll listener rather than a scroll-linked CSS animation
	 * because `animation-timeline: scroll()` is still not in Safari, and this is
	 * a two-line listener that runs on the compositor anyway — the only thing it
	 * writes is a CSS custom property consumed by a `scaleX`.
	 *
	 * `passive: true` so it can never delay a scroll, and the write is coalesced
	 * into an animation frame so a fast wheel does not queue dozens of layout
	 * reads.
	 */
	let progress = $state(0);

	$effect(() => {
		let frame = 0;

		const measure = () => {
			frame = 0;
			const scrollable = document.documentElement.scrollHeight - innerHeight;
			// A page shorter than the viewport has no progress to report; showing a
			// full bar on it would be a lie about a page with nothing to scroll.
			progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};

		measure();
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', onScroll, { passive: true });

		return () => {
			if (frame) cancelAnimationFrame(frame);
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', onScroll);
		};
	});
</script>

<div class="track" aria-hidden="true">
	<div class="bar" style="transform: scaleX({progress})"></div>
</div>

<style>
	.track {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		/* Above the sticky header, which sits at z-50. */
		z-index: 60;
		pointer-events: none;
	}

	.bar {
		height: 100%;
		transform-origin: left center;
		background: linear-gradient(to right, var(--brand-teal), var(--brand-gold));
		/* No transition: the bar should track the scroll exactly. Easing it would
		   make it lag behind the thumb, which reads as jank rather than polish. */
	}

	:global([dir='rtl']) .bar {
		transform-origin: right center;
	}
</style>
