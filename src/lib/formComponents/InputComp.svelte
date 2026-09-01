<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { CircleAlert, Eye, EyeOff } from '@lucide/svelte';
	import SelectComp from './SelectComp.svelte';
	import type { FieldErrors, Item } from './types';
	import FileUpload from './FileUpload.svelte';
	import { cn } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages';

	/**
	 * One labelled control, with its label, hint and error message.
	 *
	 * Ported from `../shimeles`, keeping the part that matters: the value is
	 * bound directly rather than read out of a Superforms store by name, so the
	 * same component serves a plain field and one inside an `{#each}` where
	 * `$form[name]` is not a reachable path.
	 *
	 * `form` is only used by `type="file"`, which mirrors its selection through
	 * `fileProxy` and needs the store itself.
	 */
	let {
		label = '',
		/** Only for `type="file"`. Every other control binds `value`. */
		form = undefined,
		name,
		value = $bindable(),
		/** The Superforms errors store's value; messages are looked up by `name`. */
		errors = undefined,
		/** Messages passed directly, for a nested path that `name` cannot reach. */
		fieldErrors: explicitErrors = undefined,
		type = 'text',
		required = false,
		placeholder = '',
		autocomplete = undefined,
		maxlength = undefined,
		rows = 5,
		items = [],
		image = '',
		hint = '',
		className = '',
		id = undefined,
		...rest
	}: {
		label?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form?: any;
		name: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value?: any;
		errors?: FieldErrors;
		fieldErrors?: string[];
		type?: string;
		required?: boolean;
		placeholder?: string;
		autocomplete?: AutoFill;
		maxlength?: number;
		rows?: number;
		items?: Item[];
		image?: string;
		hint?: string;
		className?: string;
		id?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	} = $props();

	const controlId = $derived(id ?? name);
	const fieldErrors = $derived(explicitErrors ?? (errors?.[name] as string[] | undefined) ?? []);
	const invalid = $derived(fieldErrors.length > 0);

	const hintId = $derived(hint ? `${controlId}-hint` : undefined);
	const errorId = $derived(invalid ? `${controlId}-error` : undefined);
	/**
	 * Both, when both are present. A screen reader should hear the guidance and
	 * the problem — announcing only the error loses the format the field wants.
	 */
	const describedBy = $derived([hintId, errorId].filter(Boolean).join(' ') || undefined);

	/**
	 * Password reveal.
	 *
	 * Lives here rather than on the login page so every password field behaves the
	 * same way. The state is deliberately local and starts false on each mount: a
	 * revealed password should not survive a navigation back to the form.
	 */
	let revealed = $state(false);
	const isPassword = $derived(type === 'password');
	const inputType = $derived(isPassword && revealed ? 'text' : type);
</script>

<div class={cn('space-y-2', className)}>
	{#if label && type !== 'checkbox' && type !== 'file'}
		<Label for={controlId} class="text-sm">
			{label}
			{#if required}<span class="text-destructive" aria-hidden="true">*</span>{/if}
		</Label>
	{/if}

	{#if type === 'textarea'}
		<Textarea
			id={controlId}
			{name}
			{placeholder}
			{rows}
			{maxlength}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			aria-required={required || undefined}
			{...rest}
		/>
	{:else if type === 'select'}
		<SelectComp
			id={controlId}
			{name}
			{items}
			{placeholder}
			{required}
			{invalid}
			{describedBy}
			bind:value
		/>
	{:else if type === 'file'}
		<FileUpload
			{name}
			{form}
			{label}
			{placeholder}
			{required}
			{invalid}
			{describedBy}
			image={image || null}
			{...rest}
		/>
	{:else if type === 'checkbox'}
		<div class="flex items-start gap-2">
			<Checkbox id={controlId} {name} bind:checked={value} aria-describedby={describedBy} />
			<Label for={controlId} class="text-sm leading-snug font-normal">{label}</Label>
		</div>
	{:else}
		<div class="relative">
			<Input
				id={controlId}
				{name}
				type={inputType}
				{placeholder}
				{autocomplete}
				{maxlength}
				bind:value
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				aria-required={required || undefined}
				class={isPassword ? 'pr-10' : undefined}
				{...rest}
			/>
			{#if isPassword}
				<!-- `aria-label` rather than a visible label, and it names the action
				     about to happen, so a screen reader hears "Show password" while
				     the password is hidden. Not a submit button: inside a form, a
				     button with no type submits it. -->
				<button
					type="button"
					onclick={() => (revealed = !revealed)}
					aria-label={revealed ? m.login_password_hide() : m.login_password_show()}
					aria-pressed={revealed}
					aria-controls={controlId}
					class="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					{#if revealed}
						<EyeOff class="size-4" aria-hidden="true" />
					{:else}
						<Eye class="size-4" aria-hidden="true" />
					{/if}
				</button>
			{/if}
		</div>
	{/if}

	{#if hint}
		<p id={hintId} class="text-xs text-muted-foreground">{hint}</p>
	{/if}

	{#if invalid}
		<p id={errorId} class="flex items-start gap-1.5 text-xs text-destructive">
			<CircleAlert class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
			<span>{fieldErrors.join(' · ')}</span>
		</p>
	{/if}
</div>
