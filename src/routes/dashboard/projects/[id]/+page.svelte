<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import ProjectForm from '$lib/components/admin/ProjectForm.svelte';
	import ProjectGallery from '$lib/components/admin/ProjectGallery.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { data, form } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="display min-w-0 truncate text-2xl">{data.name}</h1>
		<Button
			href={localizeHref(`/projects/${data.slug}`)}
			target="_blank"
			variant="outline"
			size="sm"
		>
			<ExternalLink class="size-3.5" aria-hidden="true" />
			{m.dash_view_site()}
		</Button>
	</div>

	<ProjectForm
		data={data.form}
		coverImage={data.coverImage}
		clientLogo={data.clientLogo}
		deletable
	/>

	<!--
		Outside `ProjectForm` on purpose: the gallery posts to its own actions, and
		a form cannot be nested inside another form.
	-->
	{#if form?.galleryError}
		<p class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
			{form.galleryError}
		</p>
	{:else if form?.galleryMessage}
		<p class="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm text-primary">
			{form.galleryMessage}
		</p>
	{/if}

	<ProjectGallery images={data.images} />
</div>
