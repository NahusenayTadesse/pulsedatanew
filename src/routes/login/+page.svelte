<script lang="ts">
	import { ArrowLeft, Loader, LogIn } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import { loginSchema } from '$lib/forms/auth';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Logo from '$lib/components/site/Logo.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const schema = loginSchema();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		validators: zod4Client(schema),
		invalidateAll: false
	});
</script>

<svelte:head>
	<title>{m.login_title()} · {m.site_name()}</title>
	<!-- A staff login has no business in a search index. -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-5 py-16">
	<Logo class="mb-10 h-8 self-start" />

	<h1 class="display text-3xl">{m.login_title()}</h1>
	<p class="mt-2 text-sm text-muted-foreground">{m.login_subtitle()}</p>

	{#if $message}
		<p
			role="alert"
			class="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
		>
			{$message}
		</p>
	{/if}

	<form method="POST" use:enhance class="mt-8 space-y-5">
		<InputComp
			name="email"
			type="email"
			label={m.login_email()}
			autocomplete="username"
			required
			bind:value={$form.email}
			errors={$errors}
		/>
		<InputComp
			name="password"
			type="password"
			label={m.login_password()}
			autocomplete="current-password"
			required
			bind:value={$form.password}
			errors={$errors}
		/>

		<Button type="submit" class="w-full" disabled={$submitting}>
			{#if $submitting}
				<Loader class="size-4 animate-spin" aria-hidden="true" />
				{m.login_submitting()}
			{:else}
				<LogIn class="size-4" aria-hidden="true" />
				{m.login_submit()}
			{/if}
		</Button>
	</form>

	<a
		href={localizeHref('/')}
		class="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-3.5" aria-hidden="true" />
		{m.login_back_to_site()}
	</a>
</div>
