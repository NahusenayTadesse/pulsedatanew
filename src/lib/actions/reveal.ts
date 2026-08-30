import type { Action } from 'svelte/action';

/**
 * Scroll-triggered entrance.
 *
 * Three rules shape this.
 *
 * 1. **The hidden state is applied by JavaScript, never by the stylesheet.**
 *    The action adds `reveal-init` on mount and the CSS only hides an element
 *    that carries it. So a reader with JavaScript disabled or still loading
 *    sees the finished page rather than a blank one — the failure mode of a
 *    CSS-first reveal is an invisible site, which is not a failure mode worth
 *    having for a decoration.
 *
 * 2. **Reduced motion is honoured before anything is hidden**, not by making
 *    the transition instant afterwards. Someone who asked the OS for less
 *    motion gets a page that was simply never animated.
 *
 * 3. **One observer for the whole document**, not one per element. A page with
 *    sixty revealing items would otherwise create sixty observers, and the
 *    browser is far better at batching a single one.
 */

type RevealOptions = {
	/** Milliseconds to wait after the element enters. Used for stagger. */
	delay?: number;
	/** Travel distance in pixels. 0 fades without moving. */
	y?: number;
	/** Re-hide when scrolled back past. Off by default — it reads as a glitch. */
	repeat?: boolean;
};

const REVEALED = 'reveal-in';
const INIT = 'reveal-init';

let observer: IntersectionObserver | null = null;
const settings = new WeakMap<Element, RevealOptions>();

/**
 * Elements observed but not yet revealed.
 *
 * Needed because an IntersectionObserver only reports *threshold crossings*.
 * Jump from the top of a long page to the bottom — the End key, an anchor
 * link, a restored scroll position — and everything in between goes from
 * "below the viewport" to "above the viewport" without ever being computed as
 * intersecting. No callback is delivered for any of it, and every one of those
 * elements would sit at opacity 0 for the life of the page.
 *
 * So a scroll sweep backs the observer up. It is attached only while something
 * is still pending and removes itself the moment the set empties, which on a
 * normal read-down-the-page visit is almost immediately.
 */
const pending = new Set<HTMLElement>();
let sweepFrame = 0;
let sweeping = false;

/** Reveal with no animation — for something the reader has already passed. */
function showInstantly(el: HTMLElement) {
	el.style.transitionDuration = '0ms';
	show(el);
}

function sweep() {
	sweepFrame = 0;

	for (const el of pending) {
		// `bottom <= 0` means entirely above the viewport: scrolled past.
		if (el.getBoundingClientRect().bottom <= 0) {
			showInstantly(el);
			observer?.unobserve(el);
			pending.delete(el);
		}
	}

	if (pending.size === 0) stopSweeping();
}

function onScroll() {
	if (!sweepFrame) sweepFrame = requestAnimationFrame(sweep);
}

function startSweeping() {
	if (sweeping) return;
	sweeping = true;
	addEventListener('scroll', onScroll, { passive: true });
}

function stopSweeping() {
	if (!sweeping) return;
	sweeping = false;
	removeEventListener('scroll', onScroll);
	if (sweepFrame) {
		cancelAnimationFrame(sweepFrame);
		sweepFrame = 0;
	}
}

function prefersReducedMotion() {
	return (
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

function show(el: Element) {
	const delay = settings.get(el)?.delay ?? 0;
	if (delay > 0) {
		// A CSS delay rather than a timer: the browser owns the scheduling, and
		// nothing is left pending if the element is removed mid-stagger.
		(el as HTMLElement).style.transitionDelay = `${delay}ms`;
	}
	el.classList.add(REVEALED);
}

function getObserver() {
	if (observer) return observer;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const repeat = settings.get(entry.target)?.repeat ?? false;

				if (entry.isIntersecting) {
					show(entry.target);
					if (!repeat) {
						observer?.unobserve(entry.target);
						pending.delete(entry.target as HTMLElement);
					}
					continue;
				}

				/*
				 * Not intersecting, and already above the viewport — the reader has
				 * jumped past it: an anchor link, the End key, or a restored scroll
				 * position. It must be shown anyway, and shown *immediately*, since
				 * animating something the reader has already scrolled past is both
				 * pointless and, if they scroll back up, visible as a glitch.
				 *
				 * Without this the element never intersects at all and stays at
				 * opacity 0 for the life of the page, which is how a decoration
				 * turns into missing content.
				 */
				if (!repeat && entry.boundingClientRect.top < 0) {
					showInstantly(entry.target as HTMLElement);
					observer?.unobserve(entry.target);
					pending.delete(entry.target as HTMLElement);
					continue;
				}

				if (repeat) entry.target.classList.remove(REVEALED);
			}

			if (pending.size === 0) stopSweeping();
		},
		{
			/*
			 * A negative bottom margin so an element has to come properly into
			 * view before it animates, rather than firing while it is still a
			 * sliver at the edge of the screen — which on a fast scroll means the
			 * animation has finished before the reader arrives at it.
			 */
			rootMargin: '0px 0px -12% 0px',
			threshold: 0.05
		}
	);

	return observer;
}

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options = {}) => {
	if (prefersReducedMotion()) return;

	settings.set(node, options);

	if (options.y !== undefined) node.style.setProperty('--reveal-y', `${options.y}px`);
	node.classList.add(INIT);

	/*
	 * An element already on screen at first paint is shown on the next frame
	 * rather than waiting for the observer's first callback. Without this the
	 * top of the page holds its hidden state for a beat after load, which is
	 * the one place a visitor is certain to be looking.
	 */
	requestAnimationFrame(() => {
		const box = node.getBoundingClientRect();

		if (box.top < innerHeight && box.bottom > 0) {
			// On screen at first paint: animate it now rather than waiting for the
			// observer's first callback, which would hold the top of the page in
			// its hidden state for a beat.
			show(node);
		} else if (box.bottom <= 0) {
			// Already above the viewport on load — a deep link with a hash, or a
			// browser-restored position. Show it with no animation at all.
			node.style.transitionDuration = '0ms';
			show(node);
		} else {
			getObserver().observe(node);
			pending.add(node);
			startSweeping();
		}
	});

	return {
		update(next = {}) {
			settings.set(node, next);
			if (next.y !== undefined) node.style.setProperty('--reveal-y', `${next.y}px`);
		},
		destroy() {
			observer?.unobserve(node);
			settings.delete(node);
			pending.delete(node);
			if (pending.size === 0) stopSweeping();
		}
	};
};

/**
 * The stagger helper: `stagger(i)` for a list, so items arrive in sequence.
 *
 * Capped, because a nine-item grid at 70ms each would leave the last card
 * waiting well over half a second after the first — long enough to read as the
 * page being slow rather than as an effect.
 */
export const stagger = (index: number, step = 60, max = 320) => Math.min(index * step, max);
