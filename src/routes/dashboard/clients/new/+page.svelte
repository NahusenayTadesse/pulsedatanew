<script lang="ts">
	import ClientForm from '$lib/components/admin/ClientForm.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="display text-2xl">{m.dash_new_client()}</h1>
	<p class="max-w-2xl text-sm text-muted-foreground">{m.dash_lang_hint()}</p>
	<ClientForm data={data.form} projects={data.projects} />
</div>
