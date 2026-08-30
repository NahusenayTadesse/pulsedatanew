<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	/**
	 * The hero.
	 *
	 * An ERP's whole argument is that one thing that happens in the business is
	 * recorded once and read everywhere, instead of being re-keyed into five
	 * places that disagree by the end of the week. That argument is abstract in
	 * a sentence and obvious as a diagram, so the diagram is the hero rather
	 * than an illustration beside one.
	 *
	 * A sale is the example because it is the event every reader already knows,
	 * and it touches five of the nine modules — not all nine. Claiming a sale
	 * updates HR or Production would be the kind of overstatement a buyer in
	 * this market has heard before; being exactly right about five is more
	 * persuasive than being vague about nine.
	 *
	 * Selecting a ledger shows which fields of the record it reads. The
	 * connectors are borders and pseudo-elements rather than SVG so the layout
	 * reflows properly between the two-column desktop arrangement and the
	 * stacked mobile one, with no coordinates to recompute.
	 */

	type FieldKey = 'customer' | 'item' | 'quantity' | 'total' | 'branch' | 'date';

	const fields = $derived([
		{
			key: 'customer' as const,
			label: m.hero_field_customer(),
			value: m.hero_field_customer_value()
		},
		{ key: 'item' as const, label: m.hero_field_item(), value: m.hero_field_item_value() },
		{
			key: 'quantity' as const,
			label: m.hero_field_quantity(),
			value: m.hero_field_quantity_value()
		},
		{ key: 'total' as const, label: m.hero_field_total(), value: m.hero_field_total_value() },
		{ key: 'branch' as const, label: m.hero_field_branch(), value: m.hero_field_branch_value() },
		{ key: 'date' as const, label: m.hero_field_date(), value: m.hero_field_date_value() }
	]);

	const ledgers = $derived([
		{
			id: 'sales',
			name: m.module_sales(),
			effect: m.hero_effect_sales(),
			reads: ['customer', 'item', 'quantity', 'total', 'date'] as FieldKey[]
		},
		{
			id: 'inventory',
			name: m.module_inventory(),
			effect: m.hero_effect_inventory(),
			reads: ['item', 'quantity', 'branch'] as FieldKey[]
		},
		{
			id: 'finance',
			name: m.module_finance(),
			effect: m.hero_effect_finance(),
			reads: ['customer', 'total', 'date'] as FieldKey[]
		},
		{
			id: 'costing',
			name: m.module_costing(),
			effect: m.hero_effect_costing(),
			reads: ['total', 'branch'] as FieldKey[]
		},
		{
			id: 'dashboards',
			name: m.module_dashboards(),
			effect: m.hero_effect_dashboards(),
			reads: ['total', 'branch', 'date'] as FieldKey[]
		}
	]);

	let activeId: string | null = $state(null);

	const active = $derived(ledgers.find((ledger) => ledger.id === activeId) ?? null);
	const isRead = (key: FieldKey) => !active || active.reads.includes(key);
</script>

<div class="record-flow" aria-label={m.hero_diagram_label()} role="group">
	<!-- The record -->
	<article class="record">
		<header class="record-head">
			<span class="eyebrow text-brand-gold">{m.hero_record_eyebrow()}</span>
			<span class="record-ref">{m.hero_record_ref()}</span>
		</header>
		<h2 class="record-title">{m.hero_record_title()}</h2>

		<dl class="record-fields">
			{#each fields as field (field.key)}
				<div class="field" class:dim={!isRead(field.key)} class:lit={active && isRead(field.key)}>
					<dt>{field.label}</dt>
					<dd>{field.value}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<!-- The ledgers it writes to -->
	<ul class="ledgers">
		{#each ledgers as ledger, index (ledger.id)}
			<li style="--row: {index}">
				<!-- The pulse that travels the stub from the spine to this row. It
				     fires once per row on load, in sequence, so the diagram states
				     its own argument before anyone touches it. -->
				<span class="pulse" aria-hidden="true"></span>
				<button
					type="button"
					class="ledger"
					class:active={activeId === ledger.id}
					aria-pressed={activeId === ledger.id}
					onmouseenter={() => (activeId = ledger.id)}
					onmouseleave={() => (activeId = null)}
					onfocus={() => (activeId = ledger.id)}
					onblur={() => (activeId = null)}
					onclick={() => (activeId = activeId === ledger.id ? null : ledger.id)}
				>
					<span class="ledger-name">{ledger.name}</span>
					<span class="ledger-effect">{ledger.effect}</span>
				</button>
			</li>
		{/each}
	</ul>

	<p class="caption">
		<span class="caption-main">{m.hero_diagram_caption()}</span>
		<span class="caption-hint">{m.hero_diagram_hint()}</span>
	</p>
</div>

<style>
	.record-flow {
		display: grid;
		gap: 1.5rem 0;
		container-type: inline-size;
	}

	@media (min-width: 900px) {
		.record-flow {
			/* The gap between the two columns is where the connectors live. */
			grid-template-columns: minmax(0, 22rem) 3rem minmax(0, 1fr);
			grid-template-areas: 'record spine ledgers' 'caption caption caption';
			align-items: start;
			gap: 2rem 0;
		}
		.record {
			grid-area: record;
		}
		.ledgers {
			grid-area: ledgers;
		}
		.caption {
			grid-area: caption;
		}
	}

	/* ---- the record card ---- */

	.record {
		position: relative;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		/* The gold edge marks this as the origin of everything to its right. */
		border-inline-start: 3px solid var(--brand-gold);
		animation: rise 0.5s 0.05s both cubic-bezier(0.2, 0.7, 0.3, 1);
	}

	/* A slow breath of gold along the origin edge — the record is the live thing
	   on this page, and this is the only hint of that once the pulses finish. */
	.record::before {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline-start: -3px;
		width: 3px;
		background: var(--brand-gold);
		border-start-start-radius: var(--radius-lg);
		border-end-start-radius: var(--radius-lg);
		animation: breathe 4.5s ease-in-out 1.6s infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: 0.35;
		}
		50% {
			opacity: 1;
		}
	}

	.record-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.record-ref {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}

	.record-title {
		font-family: var(--font-display);
		font-stretch: 108%;
		font-weight: 650;
		font-size: 1.25rem;
		letter-spacing: -0.015em;
		margin: 0.75rem 0 1rem;
	}

	.record-fields {
		display: grid;
		gap: 0;
		margin: 0;
	}

	.field {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.4rem 0;
		border-top: 1px solid var(--border);
		transition:
			opacity 0.25s ease,
			border-color 0.25s ease;
	}

	.field dt {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.04em;
		color: var(--muted-foreground);
		text-transform: uppercase;
	}

	:global(:lang(am)) .field dt {
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.75rem;
	}

	.field dd {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 500;
		text-align: end;
	}

	/* A field the selected ledger never reads. Dimmed, not hidden: the point is
	   that the record is whole and each ledger takes the part it needs. */
	.field.dim {
		opacity: 0.28;
	}

	/* And the ones it does read lean very slightly toward the reader. Small on
	   purpose — six fields shifting at once would be a jolt, not an emphasis. */
	.field.lit dd {
		color: var(--brand-teal);
	}

	/* ---- the ledgers ---- */

	.ledgers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
		/* The spine: one line every row connects to. */
		border-inline-start: 1px solid var(--border);
		padding-inline-start: 1.25rem;
	}

	.ledgers li {
		position: relative;
		animation: rise 0.45s both cubic-bezier(0.2, 0.7, 0.3, 1);
		animation-delay: calc(0.18s + var(--row) * 0.07s);
	}

	/* The stub from the spine to the row. */
	.ledgers li::before {
		content: '';
		position: absolute;
		inset-inline-start: -1.25rem;
		top: 1.15rem;
		width: 1.25rem;
		border-top: 1px solid var(--border);
		transition: border-color 0.25s ease;
	}

	/*
	 * A single write, travelling.
	 *
	 * It runs the stub once as its row arrives, then stops. A permanently
	 * looping pulse would turn the hero into an aquarium — the animation is
	 * making a point about one event reaching five ledgers, and a point that
	 * repeats forever stops being read as a point.
	 */
	.pulse {
		position: absolute;
		inset-inline-start: -1.25rem;
		top: 1.15rem;
		width: 0.3rem;
		height: 0.3rem;
		margin-top: -0.15rem;
		border-radius: 50%;
		background: var(--brand-gold);
		opacity: 0;
		animation: travel 0.85s cubic-bezier(0.4, 0, 0.2, 1) both;
		/* Behind the record's own delay plus this row's, so the dot leaves the
		   spine only after the card it comes from has settled. */
		animation-delay: calc(0.55s + var(--row) * 0.13s);
	}

	@keyframes travel {
		0% {
			transform: translate3d(0, 0, 0) scale(0.4);
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		85% {
			opacity: 1;
		}
		100% {
			transform: translate3d(1.1rem, 0, 0) scale(1);
			opacity: 0;
		}
	}

	/* In a right-to-left context the stub runs the other way; the logical
	   property positions it, but a raw translate would still send the dot the
	   wrong direction. */
	:global([dir='rtl']) .pulse {
		animation-name: travel-rtl;
	}

	@keyframes travel-rtl {
		0% {
			transform: translate3d(0, 0, 0) scale(0.4);
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		85% {
			opacity: 1;
		}
		100% {
			transform: translate3d(-1.1rem, 0, 0) scale(1);
			opacity: 0;
		}
	}

	.ledgers li:has(.active)::before {
		border-color: var(--brand-gold);
	}

	.ledger {
		display: block;
		width: 100%;
		text-align: start;
		padding: 0.6rem 0.85rem;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: none;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			opacity 0.2s ease;
	}

	.ledger:hover,
	.ledger.active {
		background: var(--accent);
		border-color: var(--border);
	}

	.ledger:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.ledger-name {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.ledger-effect {
		display: block;
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		margin-top: 0.1rem;
	}

	/* ---- caption ---- */

	.caption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.75rem;
		margin: 0;
		font-size: 0.8125rem;
	}

	.caption-main {
		font-weight: 600;
	}

	.caption-hint {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
