<script lang="ts">
	import Repeater from './Repeater.svelte';
	import SocialIcon from '$lib/components/site/SocialIcon.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { PLATFORM_LABELS, socialPlatforms, type SocialPlatform } from '$lib/social';
	import * as m from '$lib/paraglide/messages';

	/**
	 * An ordered list of social profiles — a person's, or the company's.
	 *
	 * Lifted out of `TeamForm` when the footer's links needed the same control.
	 * Both write through `socialLinks()` in `$lib/forms/admin` and both are
	 * saved by replacing the list wholesale, so sharing the editor is what keeps
	 * the two from drifting into two slightly different ideas of a link row.
	 *
	 * `idPrefix` exists because two of these can sit on one page: the row ids
	 * name the platform dropdown's label, and duplicated ids would point every
	 * label at the first list's first row.
	 */
	let {
		rows = $bindable(),
		errors = undefined,
		label = m.dash_socials(),
		hint = m.dash_socials_hint(),
		idPrefix = 'link'
	}: {
		rows: { platform: SocialPlatform; url: string }[];
		/** The `links` entry of Superforms' errors store, if the form has one. */
		errors?: unknown;
		label?: string;
		hint?: string;
		idPrefix?: string;
	} = $props();

	const platformItems = socialPlatforms.map((platform) => ({
		value: platform,
		name: PLATFORM_LABELS[platform]
	}));

	/**
	 * The placeholder shows the shape the field wants, which is the whole of the
	 * guidance most of these need: an address for email, a full URL otherwise.
	 */
	const placeholderFor = (platform: SocialPlatform) =>
		platform === 'email' ? 'name@pulsedataet.com' : 'https://';

	/**
	 * The messages for one row's address.
	 *
	 * Superforms types `$errors` as a recursive mapped type over the schema,
	 * which does not narrow to "an array of objects with a `url`" — so the one
	 * entry this form reads is cast here rather than fighting the type at every
	 * use, exactly as `FieldErrors` does for the flat fields.
	 */
	const linkErrors = (index: number): string[] =>
		((errors as { url?: string[] }[] | undefined)?.[index]?.url ?? []) as string[];
</script>

<Repeater
	{label}
	{hint}
	bind:rows
	blank={() => ({ platform: 'linkedin' as SocialPlatform, url: '' })}
	isBlank={(link) => !link.url.trim()}
>
	{#snippet row(link, set, index)}
		<div class="grid gap-2 sm:grid-cols-[10rem_1fr]">
			<div class="flex items-center gap-2">
				<!-- `for`, not a wrapping label: the trigger is a button, which a
				     label can name but no longer contains. -->
				<label for="{idPrefix}-platform-{index}" class="sr-only">
					{m.dash_socials_platform()}
				</label>
				<span
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border text-muted-foreground"
				>
					<SocialIcon platform={link.platform as SocialPlatform} />
				</span>
				<!-- No `name`: these rows post as JSON by index, so the hidden input
				     `SelectComp` normally renders would only add a stray duplicate
				     key to the payload. -->
				<SelectComp
					id="{idPrefix}-platform-{index}"
					items={platformItems}
					value={link.platform}
					onValueChange={(platform) => set({ platform: platform as SocialPlatform })}
					triggerClass="min-w-0 flex-1"
				/>
			</div>

			<div>
				<Input
					placeholder={placeholderFor(link.platform as SocialPlatform)}
					value={link.url}
					oninput={(event) => set({ url: event.currentTarget.value })}
					aria-label={PLATFORM_LABELS[link.platform as SocialPlatform]}
				/>
				{#each linkErrors(index) as error (error)}
					<p class="mt-1 text-xs text-destructive">{error}</p>
				{/each}
			</div>
		</div>
	{/snippet}
</Repeater>
