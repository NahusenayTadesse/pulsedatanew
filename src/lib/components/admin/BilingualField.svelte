<script lang="ts">
	import { Check, Languages } from '@lucide/svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import RichTextEditor from '$lib/formComponents/RichTextEditor.svelte';
	import { cn } from '$lib/utils.js';
	import type { FieldErrors } from '$lib/formComponents/types';
	import * as m from '$lib/paraglide/messages';

	/**
	 * One field, in both languages.
	 *
	 * Every translatable column in the schema is a pair — `title` / `titleAm` —
	 * and the obvious way to edit that is two boxes stacked, which is what makes
	 * bilingual CMS forms twice as long as they need to be and, worse, hides
	 * whether anything is actually translated behind a scroll.
	 *
	 * So the two share one control with a tab each. The tab strip carries the
	 * state — a tick on Amharic when it has content — which turns "what still
	 * needs translating?" from a question you answer by scrolling into one you
	 * answer by glancing at the form.
	 *
	 * Both inputs stay mounted. Only the inactive one is hidden with `hidden`,
	 * never removed: a rich-text editor that unmounts loses its undo history,
	 * and a half-written Amharic paragraph must survive a click on "English".
	 */
	let {
		name,
		/**
		 * The element id, when it cannot simply be the field name.
		 *
		 * The gallery renders one form per image, so several rows post a field
		 * genuinely called `alt` — but two elements may not share an id on one
		 * page. This lets the posted name stay stable while the id is made unique
		 * per row.
		 */
		id = undefined,
		label,
		value = $bindable(),
		valueAm = $bindable(),
		type = 'text',
		required = false,
		hint = '',
		placeholder = '',
		placeholderAm = '',
		rows = 4,
		maxlength = undefined,
		errors = undefined
	}: {
		name: string;
		label: string;
		value?: string;
		valueAm?: string;
		type?: 'text' | 'textarea' | 'richtext';
		required?: boolean;
		hint?: string;
		placeholder?: string;
		placeholderAm?: string;
		rows?: number;
		maxlength?: number;
		errors?: FieldErrors;
		id?: string;
	} = $props();

	let locale = $state<'en' | 'am'>('en');

	const nameAm = $derived(`${name}Am`);
	const fieldId = $derived(id ?? name);
	const fieldIdAm = $derived(`${fieldId}Am`);
	const translated = $derived(Boolean(valueAm?.trim()));
	const fieldErrors = $derived((errors?.[name] as string[] | undefined) ?? []);
	const fieldErrorsAm = $derived((errors?.[nameAm] as string[] | undefined) ?? []);

	const errorId = $derived(fieldErrors.length ? `${fieldId}-error` : undefined);
	const hintId = $derived(hint ? `${fieldId}-hint` : undefined);
	const describedBy = $derived([hintId, errorId].filter(Boolean).join(' ') || undefined);

	const tabs = $derived([
		{ id: 'en' as const, label: m.dash_lang_en(), done: Boolean(value?.trim()) },
		{ id: 'am' as const, label: m.dash_lang_am(), done: translated }
	]);
</script>

<div class="space-y-2">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<Label for={locale === 'en' ? fieldId : fieldIdAm} class="text-sm">
			{label}
			{#if required}<span class="text-destructive" aria-hidden="true">*</span>{/if}
		</Label>

		<div
			class="flex items-center gap-1 rounded-full border p-0.5"
			role="tablist"
			aria-label={label}
		>
			<Languages class="mx-1 size-3 text-muted-foreground" aria-hidden="true" />
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					role="tab"
					aria-selected={locale === tab.id}
					onclick={() => (locale = tab.id)}
					class={cn(
						'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
						locale === tab.id
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					{tab.label}
					{#if tab.id === 'am' && tab.done}
						<Check class="size-3" aria-hidden="true" />
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!--
		`hidden` rather than `{#if}`: see the note above. The attribute also keeps
		the inactive input out of the accessibility tree and out of tab order,
		which a `display:none` class would not guarantee across browsers.
	-->
	<div hidden={locale !== 'en'}>
		{#if type === 'richtext'}
			<RichTextEditor id={fieldId} bind:value {placeholder} />
			<input type="hidden" {name} value={value ?? ''} />
		{:else if type === 'textarea'}
			<Textarea
				id={fieldId}
				{name}
				{rows}
				{placeholder}
				{maxlength}
				bind:value
				aria-invalid={fieldErrors.length > 0 || undefined}
				aria-describedby={describedBy}
			/>
		{:else}
			<Input
				id={fieldId}
				{name}
				{placeholder}
				{maxlength}
				bind:value
				aria-invalid={fieldErrors.length > 0 || undefined}
				aria-describedby={describedBy}
			/>
		{/if}
	</div>

	<div hidden={locale !== 'am'}>
		{#if type === 'richtext'}
			<RichTextEditor
				id={fieldIdAm}
				bind:value={valueAm}
				placeholder={placeholderAm || placeholder}
			/>
			<input type="hidden" name={nameAm} value={valueAm ?? ''} />
		{:else if type === 'textarea'}
			<Textarea
				id={fieldIdAm}
				name={nameAm}
				{rows}
				{maxlength}
				placeholder={placeholderAm || placeholder}
				bind:value={valueAm}
				lang="am"
			/>
		{:else}
			<Input
				id={fieldIdAm}
				name={nameAm}
				{maxlength}
				placeholder={placeholderAm || placeholder}
				bind:value={valueAm}
				lang="am"
			/>
		{/if}
	</div>

	{#if hint}
		<p id={hintId} class="text-xs text-muted-foreground">{hint}</p>
	{/if}

	{#each [...fieldErrors, ...fieldErrorsAm] as error (error)}
		<p id={errorId} class="text-xs text-destructive">{error}</p>
	{/each}
</div>
