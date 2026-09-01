<script lang="ts">
	import TeamForm from '$lib/components/admin/TeamForm.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="display text-2xl">{m.dash_new_member()}</h1>
	<p class="max-w-2xl text-sm text-muted-foreground">{m.dash_lang_hint()}</p>
	<TeamForm data={data.form} />
</div>
