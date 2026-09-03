<script lang="ts">
	import ClientForm from '$lib/components/admin/ClientForm.svelte';

	let { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="display min-w-0 truncate text-2xl">{data.name}</h1>
	<ClientForm data={data.form} logo={data.logo} projects={data.projects} deletable />
</div>
