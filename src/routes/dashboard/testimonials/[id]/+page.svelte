<script lang="ts">
	import TestimonialForm from '$lib/components/admin/TestimonialForm.svelte';

	let { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="display min-w-0 truncate text-2xl">{data.authorName}</h1>
	<TestimonialForm
		data={data.form}
		logo={data.logo}
		photo={data.photo}
		projects={data.projects}
		deletable
	/>
</div>
