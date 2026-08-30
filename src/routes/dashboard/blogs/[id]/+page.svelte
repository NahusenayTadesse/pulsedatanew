<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import PostForm from '$lib/components/admin/PostForm.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display min-w-0 truncate text-2xl">{data.title}</h1>
		<Button href={localizeHref(`/blogs/${data.slug}`)} target="_blank" variant="outline" size="sm">
			<ExternalLink class="size-3.5" aria-hidden="true" />
			{m.dash_view_site()}
		</Button>
	</div>

	<PostForm data={data.form} coverImage={data.coverImage} deletable />
</div>
