<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as m from '$lib/paraglide/messages';
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={toggleMode}
	aria-label={m.theme_toggle()}
	title={m.theme_toggle()}
>
	<Sun class="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
	<Moon
		class="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
	/>
</Button>
