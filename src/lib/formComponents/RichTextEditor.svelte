<script lang="ts">
	import { Tipex, defaultExtensions } from '@friendofsvelte/tipex';
	import '@friendofsvelte/tipex/styles/index.css';
	import type { Editor } from '@tiptap/core';

	/**
	 * The WYSIWYG body editor, ported from `../shimeles`.
	 *
	 * What it produces is HTML, which is why post and project bodies are stored
	 * as HTML and sanitised on the way out in `$lib/server/richtext` rather than
	 * being parsed as markdown. Asking someone to remember heading syntax to
	 * publish a company blog post is how a CMS ends up unused.
	 */
	let {
		value = $bindable(),
		placeholder = 'Start writing…',
		id = undefined
	}: { value?: string; placeholder?: string; id?: string } = $props();

	let editor: Editor | undefined = $state();

	/**
	 * The placeholder is a placeholder, not the first draft.
	 *
	 * Tipex will happily take a `body` prop, but passing the hint there puts it
	 * in the document as real content that the writer has to select and delete
	 * before typing — and, on a blog post, would be publishable. This
	 * reconfigures tiptap's own placeholder extension instead, so the hint is
	 * drawn over an empty document and cannot be saved.
	 *
	 * Computed once rather than derived: Tipex mutates the array it is given (it
	 * pushes its floating menu in), so each editor needs its own copy — which
	 * also stops two editors on one screen from stacking menus into the shared
	 * default. This screen has exactly that: one body field per language.
	 */
	const extensions = defaultExtensions.map((extension) =>
		extension.name === 'placeholder'
			? extension.configure({ placeholder, showOnlyWhenEditable: false })
			: extension
	);

	$effect(() => {
		if (!editor) return;
		const onUpdate = () => {
			// `getHTML()` on an empty document returns "<p></p>", which is not
			// nothing — it would defeat the schema's "body is required" check and
			// publish a blank article.
			const html = editor?.getHTML() ?? '';
			value = html === '<p></p>' ? '' : html;
		};
		editor.on('update', onUpdate);
		return () => {
			editor?.off('update', onUpdate);
		};
	});
</script>

<div {id} class="tipex-host rounded-md border">
	<Tipex body={value || ''} {extensions} bind:tipex={editor} focal floating />
</div>

<style>
	/*
	 * Tipex ships its own light-mode palette. These map it onto the site's
	 * tokens so the editor is legible in dark mode, where it was otherwise
	 * black text on a black card.
	 */
	.tipex-host :global(.tipex-editor-wrapper),
	.tipex-host :global(.tipex-editor) {
		background: var(--background);
		color: var(--foreground);
	}

	/*
	 * Tipex stacks the writing area first and its toolbar underneath, and gives
	 * the outer element the height — which left the toolbar marooned in the
	 * middle of the box with empty space above and below it.
	 *
	 * The height belongs to the writing area, and the toolbar belongs at the
	 * top, where every writing tool anyone on this team has used puts it.
	 */
	.tipex-host :global(.tipex-editor-wrap) {
		flex-direction: column;
	}

	.tipex-host :global(.tipex-controller) {
		order: -1;
		border-block-end: 1px solid var(--border);
	}

	.tipex-host :global(.tipex-editor-section) {
		min-height: 16rem;
		overflow-y: auto;
	}

	.tipex-host :global(.tipex-controller),
	.tipex-host :global(.tipex-footer) {
		background: var(--muted);
		border-color: var(--border);
		color: var(--foreground);
	}

	.tipex-host :global(button) {
		color: var(--foreground);
	}

	.tipex-host :global(.tipex-button-active) {
		background: var(--accent);
		color: var(--accent-foreground);
	}

	/* The editing surface should read like the published article it becomes. */
	.tipex-host :global(.ProseMirror) {
		padding: 1rem;
		font-size: 0.9375rem;
		line-height: 1.7;
	}
	.tipex-host :global(.ProseMirror h2) {
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 650;
		margin: 1.5em 0 0.4em;
	}
	.tipex-host :global(.ProseMirror h3) {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 650;
		margin: 1.3em 0 0.4em;
	}
	.tipex-host :global(.ProseMirror p) {
		margin: 0 0 0.9em;
	}
	.tipex-host :global(.ProseMirror ul) {
		list-style: disc;
		padding-inline-start: 1.4em;
		margin-bottom: 0.9em;
	}
	.tipex-host :global(.ProseMirror ol) {
		list-style: decimal;
		padding-inline-start: 1.4em;
		margin-bottom: 0.9em;
	}
	.tipex-host :global(.ProseMirror blockquote) {
		border-inline-start: 2px solid var(--brand-gold);
		padding-inline-start: 1em;
		color: var(--muted-foreground);
	}
	.tipex-host :global(.ProseMirror a) {
		color: var(--brand-teal);
		text-decoration: underline;
	}
	.tipex-host :global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		color: var(--muted-foreground);
		float: inline-start;
		height: 0;
		pointer-events: none;
	}
</style>
