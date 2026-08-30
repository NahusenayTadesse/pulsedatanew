<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { reveal } from '$lib/actions/reveal';
	import * as m from '$lib/paraglide/messages';

	let { title, body }: { title: string; body: string } = $props();
</script>

<section class="border-t">
	<div class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
		<div use:reveal class="grid items-end gap-8 lg:grid-cols-[1.6fr_1fr]">
			<div class="max-w-2xl">
				<h2 class="display text-3xl sm:text-4xl">{title}</h2>
				<p class="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
			</div>
			<div class="flex flex-wrap gap-3 lg:justify-end">
				<Button href={localizeHref('/contact')} size="lg">
					{m.cta_book_demo()}
					<ArrowRight class="size-4" aria-hidden="true" />
				</Button>
				<Button href={localizeHref('/projects')} size="lg" variant="outline">
					{m.cta_see_all_projects()}
				</Button>
			</div>
		</div>
	</div>
</section>
