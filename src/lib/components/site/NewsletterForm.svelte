<script lang="ts">
	import { ArrowRight, Check, Loader } from '@lucide/svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { newsletterSchema } from '$lib/forms/contact';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	/**
	 * The footer's subscribe field.
	 *
	 * It has no `load` behind it because it sits in the layout, on every page,
	 * and a layout cannot own a form action. `defaults()` builds the client-side
	 * form from the same schema the action validates against, and the post goes
	 * to `/newsletter` — a real route with a real page, so the field still works
	 * with JavaScript unavailable and simply lands on a confirmation instead of
	 * updating in place.
	 */
	const schema = newsletterSchema();

	const { form, errors, enhance, submitting, message } = superForm(defaults(zod4(schema)), {
		id: 'newsletter',
		validators: zod4Client(schema),
		// Nothing else on the page depends on this, and re-running every load
		// function to add an email address to a list would be absurd.
		invalidateAll: false,
		resetForm: true
	});
</script>

<p class="mb-3 text-sm font-medium">{m.newsletter_title()}</p>
<p class="mb-4 text-sm text-muted-foreground">{m.newsletter_body()}</p>

{#if $message}
	<p class="flex items-center gap-2 text-sm text-primary">
		<Check class="size-4 shrink-0" aria-hidden="true" />
		<span>{$message}</span>
	</p>
{:else}
	<form method="POST" action={localizeHref('/newsletter')} use:enhance class="space-y-2">
		<div class="flex gap-2">
			<label class="sr-only" for="newsletter-email">{m.contact_field_email()}</label>
			<Input
				id="newsletter-email"
				name="email"
				type="email"
				autocomplete="email"
				placeholder={m.newsletter_placeholder()}
				bind:value={$form.email}
				aria-invalid={$errors.email ? true : undefined}
				aria-describedby={$errors.email ? 'newsletter-email-error' : undefined}
				class="h-9"
			/>
			<Button type="submit" size="sm" class="h-9 shrink-0" disabled={$submitting}>
				{#if $submitting}
					<Loader class="size-4 animate-spin" aria-hidden="true" />
				{:else}
					<ArrowRight class="size-4" aria-hidden="true" />
				{/if}
				<span class="sr-only">{m.newsletter_submit()}</span>
			</Button>
		</div>

		<!-- Not shown, not tabbable, not announced: only a bot fills it in. -->
		<div class="hidden" aria-hidden="true">
			<label for="newsletter-website">Website</label>
			<input id="newsletter-website" name="website" tabindex="-1" autocomplete="off" />
		</div>

		{#if $errors.email}
			<p id="newsletter-email-error" class="text-xs text-destructive">{$errors.email}</p>
		{/if}
	</form>
{/if}
