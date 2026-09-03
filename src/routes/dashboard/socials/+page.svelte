<script lang="ts">
	import { Loader, Save } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import Errors from '$lib/formComponents/Errors.svelte';
	import SocialLinks from '$lib/components/admin/SocialLinks.svelte';
	import { companyLinksSchema } from '$lib/forms/admin';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data.form, {
		dataType: 'json',
		validators: zod4Client(companyLinksSchema()),
		// Keep what was just saved on screen, as the team form does: resetting to
		// the data the page loaded with makes a save look like it undid itself.
		resetForm: false,
		onUpdated: ({ form: result }) => {
			if (result.message) toast.success(result.message);
		}
	});
</script>

<div class="space-y-6">
	<div class="space-y-2">
		<h1 class="display text-2xl">{m.dash_company_socials()}</h1>
		<p class="max-w-2xl text-sm text-muted-foreground">{m.dash_company_socials_intro()}</p>
	</div>

	<form method="POST" action="?/save" use:enhance class="max-w-3xl space-y-8">
		<Errors allErrors={$allErrors} />

		{#if $message}
			<p class="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm text-primary">
				{$message}
			</p>
		{/if}

		<SocialLinks
			bind:rows={$form.links}
			errors={$errors.links}
			label={m.dash_socials()}
			hint={m.dash_company_socials_hint()}
			idPrefix="company-link"
		/>

		<div class="flex flex-wrap items-center gap-3 border-t pt-6">
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}
					<Loader class="size-4 animate-spin" aria-hidden="true" />
					{m.dash_saving()}
				{:else}
					<Save class="size-4" aria-hidden="true" />
					{m.dash_save()}
				{/if}
			</Button>
		</div>
	</form>
</div>
