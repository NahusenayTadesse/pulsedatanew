<!--
	The page's atmosphere.

	Three layers, in order of loudness:

	1. **Ledger rules** — faint horizontal hairlines, the paper this company's
	   whole product replaces. Static, because a moving grid is a distraction
	   rather than an atmosphere, and because a repeating gradient costs nothing
	   when it never repaints.
	2. **Two auras**, one teal and one gold, drifting on long unequal cycles so
	   they never fall back into the same arrangement and the loop cannot be
	   spotted. This is the only thing on the page that moves by itself.
	3. **A vignette** that fades the whole thing out toward the footer, so the
	   effect belongs to the top of the page where the hero is, and content
	   further down sits on plain ground.

	It is fixed, behind everything, and `pointer-events: none`, so it never
	participates in layout, hit-testing or scrolling. Only `transform` and
	`opacity` animate, which keeps the whole thing on the compositor — the point
	being that a company selling software that runs on modest hardware should not
	ship a marketing page that heats a laptop.
-->
<div class="ambient" aria-hidden="true">
	<div class="rules"></div>
	<div class="aura aura-teal"></div>
	<div class="aura aura-gold"></div>
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
	}

	.rules {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			to bottom,
			color-mix(in oklch, var(--foreground) 4%, transparent) 0 1px,
			transparent 1px 96px
		);
		/* Strongest at the top, gone by two-thirds down. */
		-webkit-mask-image: linear-gradient(to bottom, black, transparent 66%);
		mask-image: linear-gradient(to bottom, black, transparent 66%);
		opacity: 0.75;
	}

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

	/* On a phone the auras are most of the viewport and the blur is the most
	   expensive thing on screen; the rules alone carry enough texture. */
	@media (max-width: 640px) {
		.aura {
			filter: blur(60px);
			opacity: 0.6;
		}
	}
</style>
