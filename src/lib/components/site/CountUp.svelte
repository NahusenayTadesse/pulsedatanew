<script lang="ts">
	/**
	 * A figure that counts up the first time it is scrolled into view.
	 *
	 * The outcome values on a case study are written as free text — "1",
	 * "24/7", "6 branches" — because that is what they honestly are. So this
	 * parses a leading number and animates only that, leaving any prefix or
	 * suffix in place: "24/7" animates the 24 and keeps the "/7", and a value
	 * with no number at all is simply printed. A component that demanded clean
	 * integers would push the copy toward numbers that count nicely rather than
	 * numbers that are true.
	 */
	let { value, duration = 1100 }: { value: string; duration?: number } = $props();

	const match = $derived(value.match(/^(\D*?)(\d[\d,]*)(.*)$/s));
	const prefix = $derived(match?.[1] ?? '');
	const target = $derived(match ? Number(match[2].replace(/,/g, '')) : null);
	const suffix = $derived(match?.[3] ?? '');
	/** Preserve a thousands separator if the written figure had one. */
	const grouped = $derived(Boolean(match?.[2].includes(',')));

	let shown = $state<number | null>(null);
	const display = $derived(
		shown === null ? null : grouped ? shown.toLocaleString() : String(shown)
	);

	/**
	 * Deliberately a plain variable, not `$state`.
	 *
	 * Nothing renders it, and making it reactive is actively harmful here: the
	 * effect below reads it, the observer callback writes it, so the write
	 * invalidates the effect, Svelte tears it down, and the teardown cancels the
	 * very animation frame the callback had just scheduled. The counter would
	 * freeze on its first value — which is exactly what it did.
	 */
	let started = false;

	let el = $state<HTMLElement>();

	$effect(() => {
		if (!el || started || target === null) return;

		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			shown = target;
			started = true;
			return;
		}

		// Declared out here so the teardown below can cancel a count that is still
		// running — otherwise navigating away mid-animation leaves a rAF loop
		// writing to a destroyed component's state.
		let frame = 0;

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return;
				started = true;
				observer.disconnect();

				let begin = 0;
				const step = (now: number) => {
					if (!begin) begin = now;
					const t = Math.min(1, (now - begin) / duration);
					shown = Math.round(target * (1 - Math.pow(1 - t, 3)));
					frame = t < 1 ? requestAnimationFrame(step) : 0;
				};
				shown = 0;
				frame = requestAnimationFrame(step);
			},
			{ threshold: 0.4 }
		);

		observer.observe(el);

		return () => {
			observer.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<!--
	`tabular-nums` so the figure does not jitter horizontally as digits change
	width mid-count, which is the thing that makes a cheap counter look cheap.
-->
<span bind:this={el} class="tabular-nums">
	{#if target === null || display === null}
		{value}
	{:else}
		{prefix}{display}{suffix}
	{/if}
</span>
