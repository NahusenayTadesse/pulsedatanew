<script lang="ts">
	import { assetUrl } from '$lib/assets';
	import { pick } from '$lib/i18n';
	import type { TestimonialCard } from '$lib/server/content';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * One client quote.
	 *
	 * A `<figure>` with a `<blockquote>` and a `<figcaption>`, which is what the
	 * markup is for: the attribution is not part of the quotation and putting it
	 * inside the blockquote is the one thing that reliably confuses a screen
	 * reader reading the passage back.
	 *
	 * The logo sits above the words rather than beside the name. A row of marks
	 * down the section reads as a client list — which is half of what a
	 * testimonial section is doing — and it keeps the caption to text, where a
	 * missing logo leaves no hole.
	 */
	let { testimonial, delay = 0 }: { testimonial: TestimonialCard; delay?: number } = $props();

	const quote = $derived(pick(testimonial.quote, testimonial.quoteAm));
	const author = $derived(pick(testimonial.authorName, testimonial.authorNameAm));
	const role = $derived(pick(testimonial.authorRole, testimonial.authorRoleAm));
	const company = $derived(pick(testimonial.company, testimonial.companyAm));
	const logo = $derived(assetUrl(testimonial.logo));
	/** The company name is what a logo's alt text should say when nobody wrote one. */
	const logoAlt = $derived(pick(testimonial.logoAlt, testimonial.logoAltAm) || company);
</script>

<figure use:reveal={{ delay }} class="flex h-full flex-col rounded-lg border p-6 sm:p-8">
	{#if logo}
		<img
			src={logo}
			alt={logoAlt}
			loading="lazy"
			class="mb-6 h-8 w-auto max-w-[9rem] self-start object-contain"
		/>
	{/if}

	<!--
		The opening mark is drawn, not typed: a literal “ in the column would be
		read out as part of the sentence and would need a different glyph in
		Amharic. This is decoration, so it is hidden from assistive technology.
	-->
	<span class="display mb-2 text-3xl leading-none text-brand-gold" aria-hidden="true">“</span>

	<blockquote class="text-base leading-relaxed text-pretty sm:text-lg">
		{quote}
	</blockquote>

	<figcaption class="mt-6 border-t pt-4">
		<span class="block text-sm font-semibold">{author}</span>
		{#if role || company}
			<span class="mt-0.5 block text-sm text-muted-foreground">
				{[role, company].filter(Boolean).join(' · ')}
			</span>
		{/if}
	</figcaption>
</figure>
