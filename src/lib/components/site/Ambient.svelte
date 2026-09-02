<!--
	The page's atmosphere: a ledger that is quietly alive.

	The company sells software that turns paper records into moving data, so the
	background is exactly that picture. Six layers, in order of loudness:

	1. **The ledger** — hairline rules and column dividers, drifting downward by
	   exactly one tile per cycle so the loop is seamless and the page reads as a
	   sheet being fed slowly through a machine.
	2. **Traces** — thin comet-like streaks falling down the ledger's columns:
	   single records moving through the system. Each has its own column, speed
	   and negative delay, so they never fall in step.
	3. **Pulses** — three rings expanding from one point off the right edge, on a
	   long stagger. The brand is called Pulse; this is the heartbeat, and it is
	   the only rhythmic thing here.
	4. **Two auras**, teal and gold, drifting on long unequal cycles (34s against
	   47s) so they only realign after several minutes and the loop cannot be
	   spotted.
	5. **Sparks** — a handful of points that catch the light at grid crossings.
	   Nearly invisible on paper, distinctly stellar on ink.
	6. **Grain** — one static SVG turbulence tile. It is what stops the gradients
	   above from banding, and it gives light mode its paper and dark mode its
	   film.

	Light and dark are not the same effect at two brightnesses. Light mode is a
	printed sheet: ink rules, dark grain, traces that read as pencil. Dark mode is
	an instrument display: the rules turn teal, the grain inverts to light
	speckle, the traces gain a bloom, and the sparks come out.

	The whole thing is fixed, behind everything, `pointer-events: none` and
	`contain: strict`, so it never participates in layout, hit-testing or
	scrolling, and nothing it does can invalidate the content above it. Only
	`transform` and `opacity` are animated, which keeps every layer on the
	compositor — a company selling software that runs on modest hardware should
	not ship a marketing page that heats a laptop.

	Reduced motion removes it entirely, from `layout.css`, and `e2e/motion.e2e.ts`
	holds that to account.
-->
<script lang="ts">
	/*
	 * The traces and sparks are data rather than markup because the only thing
	 * that differs between them is three numbers, and thirty lines of near
	 * identical CSS rules is how a background layer becomes unmaintainable.
	 *
	 * `left`/`top` are percentages, `delay` is negative so every trace is already
	 * mid-flight on the first frame — a page that opens with all the streaks
	 * queued at the top edge announces itself, which is the opposite of ambient.
	 */
	const traces = [
		{ left: 12, duration: 15, delay: -2, length: 30 },
		{ left: 27, duration: 22, delay: -11, length: 22 },
		{ left: 46, duration: 18, delay: -7, length: 26 },
		{ left: 63, duration: 26, delay: -19, length: 34 },
		{ left: 78, duration: 20, delay: -4, length: 24 },
		{ left: 91, duration: 29, delay: -14, length: 28 }
	];

	const sparks = [
		{ left: 18, top: 22, delay: 0, size: 3 },
		{ left: 34, top: 61, delay: 2.6, size: 2 },
		{ left: 55, top: 15, delay: 5.1, size: 2 },
		{ left: 69, top: 44, delay: 1.3, size: 3 },
		{ left: 84, top: 70, delay: 3.9, size: 2 },
		{ left: 8, top: 52, delay: 6.4, size: 2 }
	];
</script>

<div class="ambient" aria-hidden="true">
	<div class="ledger"></div>

	<div class="traces">
		{#each traces as t, i (i)}
			<span
				class="trace"
				style="left: {t.left}%; height: {t.length}vh; animation-duration: {t.duration}s; animation-delay: {t.delay}s;"
			></span>
		{/each}
	</div>

	<div class="pulses">
		<span class="pulse"></span>
		<span class="pulse"></span>
		<span class="pulse"></span>
	</div>

	<div class="aura aura-teal"></div>
	<div class="aura aura-gold"></div>

	<div class="sparks">
		{#each sparks as s, i (i)}
			<span
				class="spark {i % 2 ? 'spark-teal' : 'spark-gold'}"
				style="left: {s.left}%; top: {s.top}%; width: {s.size}px; height: {s.size}px; animation-delay: {s.delay}s;"
			></span>
		{/each}
	</div>

	<div class="grain"></div>
</div>

<style>
	.ambient {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
		/* Its own stacking and paint context, so nothing here can invalidate the
		   content above it. */
		contain: strict;
		/* Everything fades out toward the bottom of the viewport. The layer is
		   fixed, so this is not "the top of the document" — it holds at every
		   scroll position, which is the point: whatever is being read sits over
		   progressively plainer ground the further down the screen it is.
		   Applied once, here, rather than six times below. */
		-webkit-mask-image: linear-gradient(to bottom, black 0%, black 42%, transparent 88%);
		mask-image: linear-gradient(to bottom, black 0%, black 42%, transparent 88%);
	}

	/* ---- 1. The ledger --------------------------------------------------- */

	.ledger {
		position: absolute;
		/* Oversized on every side so the tile it travels can never expose an edge. */
		inset: -120px 0 -120px 0;
		background-image:
			repeating-linear-gradient(
				to bottom,
				color-mix(in oklch, var(--foreground) 5%, transparent) 0 1px,
				transparent 1px 120px
			),
			repeating-linear-gradient(
				to right,
				color-mix(in oklch, var(--foreground) 3%, transparent) 0 1px,
				transparent 1px 15%
			);
		/* One tile of vertical travel per cycle, linear, so the seam is invisible
		   and the sheet never appears to stop or reverse. */
		animation: feed 24s linear infinite;
		will-change: transform;
	}

	:global(.dark) .ledger {
		background-image:
			repeating-linear-gradient(
				to bottom,
				color-mix(in oklch, var(--brand-teal) 12%, transparent) 0 1px,
				transparent 1px 120px
			),
			repeating-linear-gradient(
				to right,
				color-mix(in oklch, var(--brand-teal) 7%, transparent) 0 1px,
				transparent 1px 15%
			);
	}

	@keyframes feed {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(0, 120px, 0);
		}
	}

	/* ---- 2. Traces -------------------------------------------------------- */

	.traces {
		position: absolute;
		inset: 0;
	}

	.trace {
		position: absolute;
		top: 0;
		width: 1px;
		/* Bright at the leading edge, dissolving behind it: a comet, not a bar. */
		background: linear-gradient(
			to bottom,
			transparent,
			color-mix(in oklch, var(--brand-teal) 34%, transparent) 62%,
			color-mix(in oklch, var(--brand-teal) 72%, transparent)
		);
		animation-name: fall;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		will-change: transform;
	}

	/* Every third one runs gold, so the two brand colours are both in motion
	   without a second rule set. */
	.trace:nth-child(3n) {
		background: linear-gradient(
			to bottom,
			transparent,
			color-mix(in oklch, var(--brand-gold) 30%, transparent) 62%,
			color-mix(in oklch, var(--brand-gold) 64%, transparent)
		);
	}

	:global(.dark) .trace {
		/* On ink the streak is a light source rather than a mark, so it gains a
		   bloom. Deliberately not `mix-blend-mode: screen`: `.ambient` is its own
		   stacking context, so a child would blend against the layer's empty
		   backdrop rather than against the page, which is a no-op at best. */
		box-shadow: 0 0 12px color-mix(in oklch, var(--brand-teal) 45%, transparent);
	}

	:global(.dark) .trace:nth-child(3n) {
		box-shadow: 0 0 12px color-mix(in oklch, var(--brand-gold) 40%, transparent);
	}

	@keyframes fall {
		from {
			transform: translate3d(0, -40vh, 0);
			opacity: 0;
		}
		12% {
			opacity: 1;
		}
		88% {
			opacity: 1;
		}
		to {
			transform: translate3d(0, 130vh, 0);
			opacity: 0;
		}
	}

	/* ---- 3. Pulses -------------------------------------------------------- */

	.pulses {
		position: absolute;
		/* Anchored off the right edge and above the fold, so the rings enter the
		   hero from the side and leave through it rather than radiating out of the
		   middle of the headline. */
		top: 18vh;
		right: -6rem;
		width: 0;
		height: 0;
	}

	.pulse {
		position: absolute;
		/* Centred on the anchor: the ring grows from a point, not from a corner. */
		left: -22rem;
		top: -22rem;
		width: 44rem;
		height: 44rem;
		border-radius: 50%;
		border: 1px solid color-mix(in oklch, var(--brand-teal) 26%, transparent);
		animation: ping 9s cubic-bezier(0.16, 0.62, 0.36, 1) infinite;
		will-change: transform, opacity;
	}

	/* A third of a cycle apart each, which reads as one repeating heartbeat
	   rather than as three independent rings. */
	.pulse:nth-child(2) {
		animation-delay: 3s;
		border-color: color-mix(in oklch, var(--brand-gold) 22%, transparent);
	}
	.pulse:nth-child(3) {
		animation-delay: 6s;
	}

	:global(.dark) .pulse {
		border-color: color-mix(in oklch, var(--brand-teal) 42%, transparent);
	}
	:global(.dark) .pulse:nth-child(2) {
		border-color: color-mix(in oklch, var(--brand-gold) 34%, transparent);
	}

	@keyframes ping {
		from {
			transform: scale(0.18);
			opacity: 0;
		}
		18% {
			opacity: 1;
		}
		to {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	/* ---- 4. Auras --------------------------------------------------------- */

	.aura {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		/* Blurring an element this large is the one expensive thing here, so each
		   is promoted once and then only ever transformed. */
		will-change: transform;
	}

	.aura-teal {
		width: 44rem;
		height: 44rem;
		top: -14rem;
		right: -10rem;
		background: radial-gradient(
			circle,
			color-mix(in oklch, var(--brand-teal) 26%, transparent) 0%,
			transparent 70%
		);
		animation: drift-teal 34s ease-in-out infinite alternate;
	}

	.aura-gold {
		width: 34rem;
		height: 34rem;
		top: 24rem;
		left: -12rem;
		background: radial-gradient(
			circle,
			color-mix(in oklch, var(--brand-gold) 20%, transparent) 0%,
			transparent 70%
		);
		/* An odd, prime-ish duration against the teal's 34s: the two only realign
		   after several minutes, so the motion never reads as a loop. */
		animation: drift-gold 47s ease-in-out infinite alternate;
	}

	/* Dark mode carries far less of it — the auras read much hotter against ink,
	   and cream text over a teal glow loses contrast fast. */
	:global(.dark) .aura-teal {
		opacity: 0.55;
	}
	:global(.dark) .aura-gold {
		opacity: 0.4;
	}

	@keyframes drift-teal {
		from {
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			transform: translate3d(-7rem, 5rem, 0) scale(1.14);
		}
	}

	@keyframes drift-gold {
		from {
			transform: translate3d(0, 0, 0) scale(1.08);
		}
		to {
			transform: translate3d(6rem, -6rem, 0) scale(0.94);
		}
	}

	/* ---- 5. Sparks -------------------------------------------------------- */

	.sparks {
		position: absolute;
		inset: 0;
	}

	.spark {
		position: absolute;
		border-radius: 50%;
		opacity: 0;
		animation: twinkle 7s ease-in-out infinite;
		will-change: transform, opacity;
	}

	.spark-gold {
		background: var(--brand-gold);
		color: var(--brand-gold);
	}

	.spark-teal {
		background: var(--brand-teal);
		color: var(--brand-teal);
	}

	/* On paper a glinting dot is a printing fault, so light mode keeps them to a
	   suggestion; on ink they are the layer that makes the background feel deep. */
	:global(.dark) .spark {
		box-shadow: 0 0 8px currentColor;
		filter: brightness(1.15);
		animation-name: twinkle-bright;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0;
			transform: scale(0.6);
		}
		50% {
			opacity: 0.75;
			transform: scale(1.35);
		}
	}

	@keyframes twinkle-bright {
		0%,
		100% {
			opacity: 0;
			transform: scale(0.6);
		}
		50% {
			opacity: 1;
			transform: scale(1.5);
		}
	}

	/* ---- 6. Grain --------------------------------------------------------- */

	.grain {
		position: absolute;
		inset: 0;
		/* One 160px turbulence tile, inlined so it costs no request and cannot
		   arrive late enough to be seen appearing. Static by design: animated
		   grain is a repaint of the whole viewport on every frame. */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
		/* Dark speckles at a whisper: paper tooth. A blend mode is not an option
		   here for the reason given on `.trace` above, and at this opacity it
		   would not buy anything the alpha does not. */
		opacity: 0.055;
	}

	/* Inverted on ink, so the same tile becomes light speckle — film grain rather
	   than dirt, which is the only version of this that reads on a dark ground. */
	:global(.dark) .grain {
		filter: invert(1);
		opacity: 0.045;
	}

	/* ---- Small screens ---------------------------------------------------- */

	/*
	 * On a phone the auras are most of the viewport and the blur is the most
	 * expensive thing on screen, and six falling traces across 390px reads as
	 * rain rather than as data. The ledger and a couple of streaks carry enough.
	 */
	@media (max-width: 640px) {
		.aura {
			filter: blur(60px);
			opacity: 0.6;
		}

		.trace:nth-child(n + 4) {
			display: none;
		}

		.pulse:nth-child(3) {
			display: none;
		}

		.spark:nth-child(n + 4) {
			display: none;
		}
	}
</style>
