<!--
	The hero's field: the coloured ground the headline sits on.

	Five parts, and each one is doing a job rather than decorating:

	1. **A mesh** of four blurred blobs — teal, gold, deep teal, cream — drifting
	   and swelling on four unequal cycles. Because none of the durations share a
	   factor, the arrangement never repeats within a visit, so the field reads as
	   weather rather than as a loop.
	2. **The arc** — one stroked curve leaving the bottom-left and climbing off
	   the top-right, in a gold-to-teal gradient. It draws itself once on load,
	   and thereafter a short bright dash runs along it every few seconds: a
	   record moving through the system, which is the same sentence the diagram
	   below the fold says at length.
	3. **The orb** — a glass sphere with a rim light and two inner rings, floating
	   slowly. It is the one soft, round, physical thing on a site otherwise made
	   of hairlines and right angles, and it is what stops the field from being
	   just a gradient.
	4. **The cue** — a hairline centred on the band with a chevron falling down
	   it. A hero that fills the screen has to say that something follows it, and
	   it has to say so unmistakably.
	5. **The seam** — a gradient hairline along the bottom edge, so the band ends
	   on a deliberate line rather than fading out and leaving the page unsure
	   where the hero stopped.

	Light mode is daylight on paper: the mesh is a wash, the orb is a soap bubble.
	Dark mode is an instrument at night: the same mesh at lower alpha over ink,
	the orb lit from its rim inward rather than filled.

	Everything animates on `transform` and `opacity` except the arc's dash, which
	is one 2px path and cheap. The whole layer is `aria-hidden` and
	`pointer-events: none`; the reduced-motion block in `layout.css` collapses
	every duration here, which leaves the arc drawn and the mesh parked — a still
	field, never a blank one.
-->
<div class="field" aria-hidden="true">
	<div class="blob blob-teal"></div>
	<div class="blob blob-gold"></div>
	<div class="blob blob-deep"></div>
	<div class="blob blob-cream"></div>

	<div class="orb">
		<span class="ring ring-1"></span>
		<span class="ring ring-2"></span>
		<span class="glint"></span>
	</div>

	<!--
		`preserveAspectRatio="none"` lets the curve span any width, and
		`vector-effect: non-scaling-stroke` keeps the line 2px while it does —
		without the second, a wide viewport would stretch the stroke into a smear.
		`pathLength` normalises the dash maths to 1000 units, so the dashes below
		mean the same thing at every size.
	-->
	<svg class="arc" viewBox="0 0 1440 620" preserveAspectRatio="none" focusable="false">
		<defs>
			<linearGradient id="arc-stroke" x1="0" y1="1" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--brand-gold)" stop-opacity="0.15" />
				<stop offset="45%" stop-color="var(--brand-gold)" />
				<stop offset="100%" stop-color="var(--brand-teal)" />
			</linearGradient>
			<linearGradient id="arc-run" x1="0" y1="1" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--brand-teal)" />
				<stop offset="100%" stop-color="var(--brand-gold)" />
			</linearGradient>
		</defs>

		<path
			class="arc-line"
			pathLength="1000"
			d="M -60 660 C 420 640, 900 600, 1180 340 S 1420 -40 1520 -140"
			fill="none"
			stroke="url(#arc-stroke)"
			stroke-width="2"
			vector-effect="non-scaling-stroke"
		/>
		<path
			class="arc-run"
			pathLength="1000"
			d="M -60 660 C 420 640, 900 600, 1180 340 S 1420 -40 1520 -140"
			fill="none"
			stroke="url(#arc-run)"
			stroke-width="3"
			vector-effect="non-scaling-stroke"
		/>
	</svg>

	<!-- The scroll cue: a hairline with a chevron falling down it. -->
	<div class="cue-rail">
		<span class="cue">
			<!--
				An inline chevron rather than the `ChevronDown` used elsewhere on the
				site: Svelte's scoped styles do not reach inside a child component, so
				an icon component here could be positioned but not animated without
				`:global`. Two lines of SVG cost less than that exception.
			-->
			<svg class="cue-chevron" viewBox="0 0 18 10" fill="none" focusable="false">
				<path
					d="M1.25 1.25L9 9L16.75 1.25"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
	</div>

	<div class="seam"></div>
</div>

<style>
	.field {
		position: absolute;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
	}

	/* ---- The mesh --------------------------------------------------------- */

	.blob {
		position: absolute;
		border-radius: 50%;
		/* One large blur each is the expensive part of this layer, so every blob is
		   promoted once and then only ever transformed. */
		filter: blur(90px);
		will-change: transform;
	}

	.blob-teal {
		width: 46rem;
		height: 40rem;
		top: -16rem;
		right: -6rem;
		background: radial-gradient(
			circle,
			color-mix(in oklch, var(--brand-teal) 34%, transparent),
			transparent 68%
		);
		animation: swell-a 29s ease-in-out infinite alternate;
	}

	.blob-gold {
		width: 38rem;
		height: 34rem;
		top: 6rem;
		right: 18%;
		background: radial-gradient(
			circle,
			color-mix(in oklch, var(--brand-gold) 30%, transparent),
			transparent 68%
		);
		animation: swell-b 37s ease-in-out infinite alternate;
	}

	.blob-deep {
		width: 34rem;
		height: 34rem;
		bottom: -14rem;
		left: -8rem;
		background: radial-gradient(
			circle,
			color-mix(in oklch, var(--brand-teal) 26%, transparent),
			transparent 70%
		);
		animation: swell-c 43s ease-in-out infinite alternate;
	}

	.blob-cream {
		width: 30rem;
		height: 26rem;
		bottom: -6rem;
		left: 32%;
		background: radial-gradient(
			circle,
			color-mix(in oklch, var(--brand-gold) 16%, transparent),
			transparent 72%
		);
		animation: swell-d 53s ease-in-out infinite alternate;
	}

	/* Over ink the same mesh reads twice as hot, and cream text over a teal glow
	   loses contrast before it looks rich. */
	:global(.dark) .blob {
		opacity: 0.5;
	}

	@keyframes swell-a {
		from {
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			transform: translate3d(-6rem, 4rem, 0) scale(1.18);
		}
	}
	@keyframes swell-b {
		from {
			transform: translate3d(0, 0, 0) scale(1.1);
		}
		to {
			transform: translate3d(5rem, -3rem, 0) scale(0.92);
		}
	}
	@keyframes swell-c {
		from {
			transform: translate3d(0, 0, 0) scale(0.95);
		}
		to {
			transform: translate3d(7rem, -5rem, 0) scale(1.2);
		}
	}
	@keyframes swell-d {
		from {
			transform: translate3d(0, 0, 0) scale(1.05);
		}
		to {
			transform: translate3d(-8rem, -2rem, 0) scale(0.9);
		}
	}

	/* ---- The arc ---------------------------------------------------------- */

	.arc {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.arc-line {
		stroke-dasharray: 1000;
		stroke-dashoffset: 1000;
		/* `forwards`, so a curve that has finished drawing stays drawn even if the
		   duration is collapsed to nothing by the reduced-motion block. */
		animation: draw 2.4s cubic-bezier(0.22, 0.68, 0.3, 1) 0.25s forwards;
	}

	/*
	 * The record running the line: a 34-unit dash on an otherwise empty path.
	 * It starts only once the line it runs along has finished drawing, and the
	 * gap between passes is built into the cycle rather than into a delay, so
	 * there is exactly one dash on the curve at a time.
	 */
	.arc-run {
		stroke-dasharray: 34 966;
		stroke-dashoffset: 1000;
		opacity: 0;
		animation: run 6.5s cubic-bezier(0.45, 0, 0.55, 1) 2.8s infinite;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes run {
		0% {
			stroke-dashoffset: 1000;
			opacity: 0;
		}
		12% {
			opacity: 1;
		}
		58% {
			opacity: 1;
		}
		70%,
		100% {
			stroke-dashoffset: 0;
			opacity: 0;
		}
	}

	/* ---- The orb ---------------------------------------------------------- */

	.orb {
		position: absolute;
		top: 40%;
		right: 12%;
		/* Sized against the viewport, not the band: now that the hero is a full
		   screen tall, an orb fixed in rem read as a marble dropped into it. */
		width: clamp(9rem, 23vw, 21rem);
		aspect-ratio: 1;
		border-radius: 50%;
		/* Lit from the upper left, thinning to nothing at the lower right: the
		   whole illusion of a sphere is in this one gradient plus the rim below. */
		background: radial-gradient(
			circle at 32% 26%,
			rgb(255 255 255 / 0.82),
			rgb(255 255 255 / 0.26) 46%,
			transparent 72%
		);
		/* The rim, the fill light, the shaded far side and the shadow it casts —
		   all four as shadows, for the reason given on `.ring` below. */
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.55),
			inset 0 0 60px rgb(255 255 255 / 0.4),
			inset -18px -26px 60px color-mix(in oklch, var(--brand-teal) 16%, transparent),
			0 30px 70px -24px color-mix(in oklch, var(--brand-teal) 40%, transparent);
		animation: float 26s ease-in-out infinite alternate;
		will-change: transform;
	}

	/* Ink turns the bubble into a lens: no white fill, only a rim and what the
	   mesh behind it does to the light passing through. */
	:global(.dark) .orb {
		background: radial-gradient(
			circle at 34% 28%,
			color-mix(in oklch, var(--brand-teal) 26%, transparent),
			transparent 62%
		);
		box-shadow:
			inset 0 0 0 1px color-mix(in oklch, var(--brand-teal) 45%, transparent),
			inset 0 0 70px color-mix(in oklch, var(--brand-teal) 22%, transparent),
			inset -20px -28px 70px color-mix(in oklch, var(--brand-gold) 12%, transparent),
			0 30px 80px -26px color-mix(in oklch, var(--brand-teal) 30%, transparent);
	}

	/*
	 * An inset ring shadow, not a `border`.
	 *
	 * A 1px translucent white border on a large circle paints as a *dark*
	 * hairline in Chrome — the rings came out looking drawn on with a pen, which
	 * is worth knowing because the obvious fix (change the colour) does nothing:
	 * the same declaration renders correctly as white over ink. `box-shadow`
	 * takes the same alpha and puts it down as the light line it is asked for,
	 * in both themes.
	 *
	 * Plain `rgb(… / a)` rather than the `color-mix(…, transparent)` used
	 * everywhere else on the site: mixing white toward `transparent` in oklch
	 * travels through transparent black, and a hairline is exactly where that
	 * shows.
	 */
	.ring {
		position: absolute;
		border-radius: 50%;
	}

	/* Concentric, but off-centre from each other, which is what makes them read
	   as the far and near walls of a sphere rather than as flat circles. */
	.ring-1 {
		inset: 9%;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.7);
	}
	.ring-2 {
		inset: 22% 26% 18% 14%;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.45);
	}

	:global(.dark) .ring-1 {
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--brand-teal) 34%, transparent);
	}
	:global(.dark) .ring-2 {
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--brand-gold) 20%, transparent);
	}

	/* The specular highlight — small, high and soft. */
	.glint {
		position: absolute;
		top: 14%;
		left: 22%;
		width: 26%;
		height: 18%;
		border-radius: 50%;
		background: radial-gradient(ellipse, rgb(255 255 255 / 0.85), transparent 70%);
		filter: blur(6px);
	}

	:global(.dark) .glint {
		opacity: 0.45;
	}

	@keyframes float {
		from {
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			transform: translate3d(-3.5rem, -2.2rem, 0) scale(1.06);
		}
	}

	/* ---- The scroll cue --------------------------------------------------- */

	/*
	 * Centred on the band, not on the copy's margin: the cue is addressed to
	 * anyone who has reached the bottom of the screen, and the middle is where
	 * that is looked for.
	 */
	.cue-rail {
		position: absolute;
		inset-inline: 0;
		bottom: 1.75rem;
		display: flex;
		justify-content: center;
	}

	/* A hairline that fades in from nothing at the top, so it reads as the
	   beginning of a longer line running off the bottom of the screen. */
	.cue {
		position: relative;
		display: block;
		width: 1px;
		/* The rail's length lives in a custom property because the chevron's fall
		   distance is the same number, and a phone shortens both. */
		--cue-len: 3.5rem;
		height: var(--cue-len);
		background: linear-gradient(
			to bottom,
			transparent,
			color-mix(in oklch, var(--foreground) 28%, transparent)
		);
	}

	:global(.dark) .cue {
		background: linear-gradient(
			to bottom,
			transparent,
			color-mix(in oklch, var(--brand-teal) 45%, transparent)
		);
	}

	/*
	 * A chevron falling down the rail, on the same idea as the traces in the
	 * ambient layer and the dash on the arc — the site has one vocabulary for
	 * "something is moving through this", and the scroll cue speaks it too.
	 *
	 * The cycle is 3s but the chevron is only visible for the first two-thirds of
	 * it: the rest is the pause between passes, built into the keyframes rather
	 * than into a delay, which a looping animation cannot express.
	 */
	.cue-chevron {
		position: absolute;
		/* Half the chevron's width, less the rail's own 1px, centres it on the
		   line it falls down. */
		left: -8.5px;
		top: 0;
		width: 18px;
		height: 10px;
		color: var(--brand-teal);
		opacity: 0;
		animation: cue-fall 3s cubic-bezier(0.4, 0, 0.5, 1) infinite;
		will-change: transform, opacity;
	}

	:global(.dark) .cue-chevron {
		color: var(--brand-gold);
	}

	@keyframes cue-fall {
		0% {
			transform: translate3d(0, 0, 0);
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		55% {
			opacity: 1;
		}
		70%,
		100% {
			/* Stopping the chevron's own height short of the rail's end leaves it
			   sitting on the line rather than hanging off it. */
			transform: translate3d(0, calc(var(--cue-len) - 10px), 0);
			opacity: 0;
		}
	}

	/* ---- The seam --------------------------------------------------------- */

	.seam {
		position: absolute;
		inset: auto 0 0 0;
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			color-mix(in oklch, var(--brand-gold) 55%, transparent) 25%,
			color-mix(in oklch, var(--brand-teal) 60%, transparent) 70%,
			transparent
		);
	}

	/* ---- Small screens ---------------------------------------------------- */

	/*
	 * A phone is mostly hero, so the mesh is most of what is on screen and the
	 * blur is the most expensive thing running. The orb moves out from under the
	 * text — at this width it would sit behind the buttons — and shrinks to a
	 * corner detail.
	 */
	@media (max-width: 640px) {
		.blob {
			filter: blur(70px);
			opacity: 0.75;
		}

		.orb {
			top: auto;
			right: -3rem;
			bottom: 6%;
			width: 11rem;
		}

		.blob-cream {
			display: none;
		}

		/* The hero is 90dvh here and the mono note runs the width of the screen,
		   so the rail is shortened and dropped closer to the seam — at the desktop
		   length it lands on top of that line of type. */
		.cue-rail {
			bottom: 1rem;
		}

		.cue {
			--cue-len: 2.25rem;
		}
	}
</style>
