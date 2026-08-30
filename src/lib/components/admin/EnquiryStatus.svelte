<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages';

	/** The coloured pill on an enquiry. New is gold, because new needs answering. */
	let { status, class: className = '' }: { status: string; class?: string } = $props();

	const labels: Record<string, () => string> = {
		new: m.dash_enquiry_new,
		read: m.dash_enquiry_read,
		replied: m.dash_enquiry_replied,
		archived: m.dash_enquiry_archived
	};

	const tones: Record<string, string> = {
		new: 'bg-brand-gold/20 text-brand-gold border-brand-gold/40',
		read: 'bg-secondary text-secondary-foreground border-transparent',
		replied: 'bg-primary/15 text-primary border-primary/30',
		archived: 'bg-muted text-muted-foreground border-transparent'
	};
</script>

<span
	class={cn(
		'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium',
		tones[status] ?? tones.read,
		className
	)}
>
	{(labels[status] ?? (() => status))()}
</span>
