<script lang="ts">
	import { jsonLdScript } from '$lib/seo';

	/**
	 * One `application/ld+json` block.
	 *
	 * `{@html}` is unavoidable here — Svelte cannot put text inside a script
	 * element any other way — so the safety lives in `jsonLd`, which escapes
	 * every character an HTML parser could act on before the tag is assembled.
	 * This is the only `{@html}` in the codebase that is not `renderRichText`.
	 */
	let { data }: { data: Record<string, unknown> } = $props();
</script>

<svelte:head>
	<!-- The escaping in `jsonLd` is what makes this safe; see the note above. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript(data)}
</svelte:head>
