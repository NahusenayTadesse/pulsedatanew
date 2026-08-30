<script lang="ts">
	import ProjectForm from '$lib/components/admin/ProjectForm.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="display text-2xl">{m.dash_new_project()}</h1>
	<p class="max-w-2xl text-sm text-muted-foreground">{m.dash_lang_hint()}</p>
	<ProjectForm data={data.form} />
</div>
