<script lang="ts">
	import EmailComposer from '$lib/components/admin/EmailComposer.svelte';
	import { composeSchema } from '$lib/forms/mail';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head><title>{m.dash_compose_title()} · {m.dash_title()}</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<header>
		<h1 class="display text-2xl">{m.dash_compose_title()}</h1>
		<p class="mt-1 text-sm text-muted-foreground">{m.dash_compose_intro()}</p>
	</header>

	<EmailComposer
		data={data.form}
		schema={composeSchema()}
		action="?/send"
		sendLabel={m.dash_email_send()}
		mailReady={data.mailReady}
	/>
</div>
