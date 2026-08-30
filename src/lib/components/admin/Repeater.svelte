<script lang="ts" generics="Row extends Record<string, string>">
	import type { Snippet } from 'svelte';
	import { GripVertical, Plus, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as m from '$lib/paraglide/messages';

	/**
	 * A list of rows the editor can add to and remove from — the modules a
	 * project delivered, the outcomes it produced.
	 *
	 * It always keeps one empty row at the end so there is somewhere to type
	 * without first clicking "Add". The cost of that affordance is that an
	 * untouched repeater posts a row of empty strings, which is why the action
	 * drops blank rows rather than rejecting the save (`withContent`).
	 *
	 * Rows are moved with buttons rather than dragged. Drag-and-drop here would
	 * need a pointer, and this form is edited on a phone as often as a laptop;
	 * two buttons work with a thumb, a keyboard and a screen reader alike.
	 */
	let {
		label,
		hint = '',
		rows = $bindable(),
		blank,
		row: rowSnippet
	}: {
		label: string;
		hint?: string;
		rows: Row[];
		/** A fresh empty row. A function, so each call gets its own object. */
		blank: () => Row;
		/**
		 * Renders one row. Receives the row, a setter for it, and its index.
		 *
		 * The setter is not a convenience — it is the only thing that works.
		 * `rows` is bound through to a Superforms store, and `bind:value={row.label}`
		 * mutates the object *inside* the array without ever reassigning the
		 * array, so the store is never notified and the posted payload still
		 * contains the blank rows the form started with. The save appeared to
		 * succeed and silently wrote nothing.
		 *
		 * Going through `set` reassigns `rows`, which propagates through
		 * `bind:rows` to the store, and also re-runs the trailing-blank-row effect
		 * below.
		 */
		row: Snippet<[Row, (patch: Partial<Row>) => void, number]>;
	} = $props();

	/**
	 * Guarantees exactly one trailing blank row.
	 *
	 * Runs after every change rather than only on "Add": filling the last row is
	 * the common way to add one, and having to click Add afterwards to get the
	 * next box is the friction this component exists to remove.
	 */
	$effect(() => {
		const last = rows.at(-1);
		const lastIsBlank = last && Object.values(last).every((value) => !value?.trim());
		if (!lastIsBlank) rows = [...rows, blank()];
	});

	/** Replaces one row with a patched copy, so `rows` gets a new identity. */
	function setRow(index: number, patch: Partial<Row>) {
		rows = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
	}

	function remove(index: number) {
		rows = rows.filter((_, i) => i !== index);
		if (rows.length === 0) rows = [blank()];
	}

	function move(index: number, delta: number) {
		const target = index + delta;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		rows = next;
	}
</script>

<div class="space-y-3">
	<div>
		<Label class="text-sm">{label}</Label>
		{#if hint}<p class="mt-1 text-xs text-muted-foreground">{hint}</p>{/if}
	</div>

	<ul class="space-y-2">
		{#each rows as row, index (index)}
			<li class="flex items-start gap-2 rounded-md border p-2">
				<div class="flex flex-col pt-1.5" aria-hidden="true">
					<GripVertical class="size-3.5 text-muted-foreground" />
				</div>

				<div class="min-w-0 flex-1">
					{@render rowSnippet(row, (patch) => setRow(index, patch), index)}
				</div>

				<div class="flex flex-col gap-1">
					<button
						type="button"
						onclick={() => move(index, -1)}
						disabled={index === 0}
						class="rounded px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
						aria-label="Move up"
					>
						↑
					</button>
					<button
						type="button"
						onclick={() => move(index, 1)}
						disabled={index === rows.length - 1}
						class="rounded px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
						aria-label="Move down"
					>
						↓
					</button>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="size-8 shrink-0 text-muted-foreground hover:text-destructive"
					onclick={() => remove(index)}
				>
					<X class="size-3.5" aria-hidden="true" />
					<span class="sr-only">{m.dash_remove_row()}</span>
				</Button>
			</li>
		{/each}
	</ul>

	<Button type="button" variant="outline" size="sm" onclick={() => (rows = [...rows, blank()])}>
		<Plus class="size-3.5" aria-hidden="true" />
		{m.dash_add_row()}
	</Button>
</div>
