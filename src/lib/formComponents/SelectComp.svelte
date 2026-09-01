<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';
	import type { Item } from './types';

	/**
	 * A labelled dropdown, bound by value.
	 *
	 * Deliberately the plain shadcn `Select` rather than the searchable combobox
	 * the dashboards in `../dana` and `../shimeles` use: the only dropdown on
	 * this site is the contact form's six-item enquiry topic, and a search box
	 * over six options is noise. If an admin screen later needs the combobox,
	 * that component ports across with the same props.
	 *
	 * A hidden input carries the value so the field posts with a progressively
	 * enhanced form even when JavaScript never loads.
	 */
	let {
		value = $bindable(),
		items,
		name,
		id = undefined,
		placeholder = '',
		required = false,
		disabled = false,
		invalid = false,
		describedBy = undefined,
		triggerClass = ''
	}: {
		value?: string;
		items: Item[];
		name: string;
		id?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		invalid?: boolean;
		describedBy?: string;
		triggerClass?: string;
	} = $props();

	const controlId = $derived(id ?? name);
	const selected = $derived(items.find((item) => item.value === value));
</script>

<Select.Root type="single" bind:value {name} {disabled}>
	<!--
		`role="combobox"` rather than the button role bits-ui gives the trigger.
		This is a select-only combobox in ARIA 1.2 terms, and it is the role that
		actually permits `aria-required` — on a plain button that attribute is
		invalid and is dropped, so the field was never announced as required.
	-->
	<Select.Trigger
		id={controlId}
		role="combobox"
		aria-invalid={invalid || undefined}
		aria-describedby={describedBy}
		aria-required={required || undefined}
		class={cn('w-full', invalid && 'border-destructive ring-destructive/20', triggerClass)}
	>
		{selected?.name ?? placeholder}
	</Select.Trigger>
	<Select.Content>
		{#each items as item (item.value)}
			<Select.Item value={item.value} label={item.name}>{item.name}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
