<script lang="ts">
	import { CloudUpload, FileText, Loader, X } from '@lucide/svelte';
	import { fileProxy } from 'sveltekit-superforms';
	import { DOCUMENT_ACCEPT, IMAGE_COMPRESSION, MAX_UPLOAD_MB, webpName } from '$lib/forms/uploads';
	import { assetUrl } from '$lib/assets';
	import { cn } from '$lib/utils.js';

	/**
	 * A single-file dropzone, ported from `../shimeles` and trimmed.
	 *
	 * Used two ways, as it is there:
	 *
	 * - Pass `form` (a Superforms writable) and the selection is mirrored
	 *   through `fileProxy`, so a zod schema validates it.
	 * - Omit `form` and it drives only its own native `<input>`, riding along
	 *   as an ordinary field in a `use:enhance` form.
	 *
	 * Images are compressed in the browser before they reach the wire; a
	 * document is sent as-is. `image` (the currently saved value, if any)
	 * previews until a replacement is picked, and leaving the field empty on
	 * submit means "keep what is there" — every action that consumes one of
	 * these treats a missing file that way.
	 */
	let {
		name,
		form = undefined,
		image = null,
		label = '',
		placeholder = '',
		accept = DOCUMENT_ACCEPT,
		required = false,
		invalid = false,
		describedBy = undefined,
		onerror = undefined
	}: {
		name: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form?: any;
		image?: string | null;
		label?: string;
		placeholder?: string;
		accept?: string;
		required?: boolean;
		invalid?: boolean;
		describedBy?: string;
		onerror?: (message: string) => void;
	} = $props();

	// The store and the field name are fixed for the life of the component; this
	// is a one-time binding on purpose, not a missed reactive dependency.
	// svelte-ignore state_referenced_locally
	const proxy = form ? fileProxy(form, name) : null;

	let isDragging = $state(false);
	let isProcessing = $state(false);
	let selected = $state<File | null>(null);
	let fileInput: HTMLInputElement | undefined = $state();

	const existing = $derived(assetUrl(image));
	const isImage = $derived(selected?.type.startsWith('image/') ?? false);

	/** An object URL for the chosen image, revoked when it is replaced. */
	let previewUrl = $state<string | null>(null);
	$effect(() => {
		if (!selected || !selected.type.startsWith('image/')) {
			previewUrl = null;
			return;
		}
		const url = URL.createObjectURL(selected);
		previewUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	function assign(file: File) {
		selected = file;
		// The native input has to hold the file too: without JS-driven submission
		// it is what actually posts, and Superforms' proxy reads a FileList.
		const transfer = new DataTransfer();
		transfer.items.add(file);
		if (fileInput) fileInput.files = transfer.files;
		proxy?.set(transfer.files);
	}

	async function selectFile(list: FileList | null) {
		const file = list?.[0];
		if (!file) return;
		isProcessing = true;

		try {
			if (file.type.startsWith('image/')) {
				try {
					const { default: compress } = await import('browser-image-compression');
					const compressed = await compress(file, IMAGE_COMPRESSION);
					assign(new File([compressed], webpName(file.name), { type: compressed.type }));
				} catch {
					// Compression is an optimisation, not a gate — a format the
					// compressor cannot read still uploads at its original size.
					assign(file);
				}
			} else {
				assign(file);
			}
		} catch (err) {
			onerror?.(err instanceof Error ? err.message : 'That file could not be read.');
		} finally {
			isProcessing = false;
		}
	}

	function clear() {
		selected = null;
		if (fileInput) fileInput.value = '';
		proxy?.set(new DataTransfer().files);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		selectFile(event.dataTransfer?.files ?? null);
	}
</script>

<div class="space-y-2">
	{#if label}
		<span class="text-sm leading-none font-medium">{label}</span>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={cn(
			'relative flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-6 text-center transition-colors',
			isDragging && 'border-primary bg-primary/5',
			invalid && 'border-destructive'
		)}
		ondragover={(e) => {
			e.preventDefault();
			isDragging = true;
		}}
		ondragleave={() => (isDragging = false)}
		ondrop={onDrop}
	>
		<input
			bind:this={fileInput}
			id={name}
			{name}
			{accept}
			{required}
			type="file"
			aria-describedby={describedBy}
			aria-invalid={invalid || undefined}
			class="absolute inset-0 cursor-pointer opacity-0"
			onchange={(e) => selectFile(e.currentTarget.files)}
		/>

		{#if isProcessing}
			<Loader class="size-6 animate-spin text-muted-foreground" />
			<span class="text-sm text-muted-foreground">Preparing…</span>
		{:else if selected}
			{#if isImage && previewUrl}
				<img src={previewUrl} alt="" class="max-h-32 rounded-md object-contain" />
			{:else}
				<FileText class="size-6 text-primary" />
			{/if}
			<span class="max-w-full truncate text-sm font-medium">{selected.name}</span>
			<button
				type="button"
				class="relative z-10 inline-flex items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground"
				onclick={clear}
			>
				<X class="size-3" /> Remove
			</button>
		{:else if existing}
			<img src={existing} alt="" class="max-h-32 rounded-md object-contain" />
			<span class="text-xs text-muted-foreground">{placeholder}</span>
		{:else}
			<CloudUpload class="size-6 text-muted-foreground" />
			<span class="text-sm text-muted-foreground">{placeholder}</span>
			<span class="text-xs text-muted-foreground">Up to {MAX_UPLOAD_MB} MB</span>
		{/if}
	</div>
</div>
