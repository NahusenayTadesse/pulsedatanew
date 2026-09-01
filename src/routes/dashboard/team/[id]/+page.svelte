<script lang="ts">
	import TeamForm from '$lib/components/admin/TeamForm.svelte';

	let { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="display min-w-0 truncate text-2xl">{data.name}</h1>
	<TeamForm data={data.form} photo={data.photo} deletable />
</div>
