<script lang="ts">
	import { Check, Loader, Mail, MapPin, Phone, Clock, Send } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button/index.js';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import { focusFirstError } from '$lib/formComponents/form-errors';
	import { contactSchema } from '$lib/forms/contact';
	import { MAX_UPLOAD_MB, DOCUMENT_ACCEPT } from '$lib/forms/uploads';
	import { enquiryTopics } from '$lib/forms/topics';
	import { reveal, stagger } from '$lib/actions/reveal';
	import { CONTACT, SITE_URL } from '$lib/site';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const schema = contactSchema();

	// Superforms takes the server's form once and owns it from then on; re-reading
	// `data.form` on every update is what it is explicitly not supposed to do.
	// svelte-ignore state_referenced_locally
	const { form, errors, allErrors, enhance, submitting, message } = superForm(data.form, {
		validators: zod4Client(schema),
		// The form carries a file, so the browser must send it as multipart.
		dataType: 'form',
		invalidateAll: false,
		onError: 'apply',
		// A failed submit on a form this tall leaves the button on screen and the
		// problem several hundred pixels above it; this moves the caret to it.
		onUpdated: ({ form: result }) => {
			if (!result.valid) focusFirstError(result.errors ? $allErrors : []);
		}
	});

	/** Labels for the enquiry topics, in the order the schema declares them. */
	const topicLabels: Record<(typeof enquiryTopics)[number], () => string> = {
		erp: m.topic_erp,
		website: m.topic_website,
		demo: m.topic_demo,
		support: m.topic_support,
		partnership: m.topic_partnership,
		other: m.topic_other
	};

	const topics = $derived(enquiryTopics.map((value) => ({ value, name: topicLabels[value]() })));

	const details = $derived(
		[
			CONTACT.email && {
				icon: Mail,
				label: m.contact_email_label(),
				value: CONTACT.email,
				href: `mailto:${CONTACT.email}`
			},
			CONTACT.phone && {
				icon: Phone,
				label: m.contact_phone_label(),
				value: CONTACT.phone,
				href: `tel:${CONTACT.phoneHref}`
			},
			{
				icon: MapPin,
				label: m.contact_address_label(),
				value: m.contact_address_value(),
				href: null
			},
			{
				icon: Clock,
				label: m.contact_hours_label(),
				value: m.contact_hours_value(),
				href: null
			}
		].filter(Boolean) as {
			icon: typeof Mail;
			label: string;
			value: string;
			href: string | null;
		}[]
	);
</script>

<svelte:head>
	<title>{m.nav_contact()} · {m.site_name()}</title>
	<meta name="description" content={m.contact_intro()} />
	<meta property="og:title" content="{m.nav_contact()} · {m.site_name()}" />
	<meta property="og:description" content={m.contact_intro()} />
	<meta property="og:image" content="{SITE_URL}/longLogo.png" />
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
	<p class="eyebrow enter mb-6 text-brand-gold" style="--enter: 0">{m.contact_eyebrow()}</p>
	<h1 class="display enter max-w-3xl text-[clamp(2.25rem,6vw,4rem)]" style="--enter: 1">
		{m.contact_title()}
	</h1>
	<p class="enter mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style="--enter: 2">
		{m.contact_intro()}
	</p>
</section>

<section class="mx-auto max-w-6xl border-t px-5 py-16 sm:px-8 sm:py-20">
	<div class="grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
		<!-- The form -->
		<div>
			{#if $message}
				<div class="rounded-lg border border-primary p-8">
					<Check class="mb-4 size-7 text-primary" aria-hidden="true" />
					<h2 class="display text-2xl">{m.contact_success_title()}</h2>
					<p class="mt-3 leading-relaxed text-muted-foreground">{$message}</p>
				</div>
			{:else}
				<h2 class="display mb-2 text-2xl">{m.contact_form_title()}</h2>
				<p class="mb-8 text-sm text-muted-foreground">{m.contact_form_description()}</p>

				<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-5">
					<Errors allErrors={$allErrors} />

					<div class="grid gap-5 sm:grid-cols-2">
						<InputComp
							name="name"
							type="text"
							label={m.contact_field_name()}
							placeholder={m.contact_field_name_placeholder()}
							autocomplete="name"
							required
							bind:value={$form.name}
							errors={$errors}
						/>
						<InputComp
							name="email"
							type="email"
							label={m.contact_field_email()}
							placeholder={m.contact_field_email_placeholder()}
							autocomplete="email"
							required
							bind:value={$form.email}
							errors={$errors}
						/>
						<InputComp
							name="phone"
							type="tel"
							label={m.contact_field_phone()}
							placeholder={m.contact_field_phone_placeholder()}
							hint={m.contact_field_phone_hint()}
							autocomplete="tel"
							bind:value={$form.phone}
							errors={$errors}
						/>
						<InputComp
							name="company"
							type="text"
							label={m.contact_field_company()}
							placeholder={m.contact_field_company_placeholder()}
							autocomplete="organization"
							bind:value={$form.company}
							errors={$errors}
						/>
					</div>

					<InputComp
						name="topic"
						type="select"
						label={m.contact_field_topic()}
						placeholder={m.contact_field_topic_placeholder()}
						items={topics}
						required
						bind:value={$form.topic}
						errors={$errors}
					/>

					<InputComp
						name="message"
						type="textarea"
						label={m.contact_field_message()}
						placeholder={m.contact_field_message_placeholder()}
						rows={7}
						maxlength={5000}
						required
						bind:value={$form.message}
						errors={$errors}
					/>

					<InputComp
						name="attachment"
						type="file"
						label={m.contact_field_attachment()}
						placeholder={m.contact_field_attachment_placeholder()}
						hint={m.contact_field_attachment_hint({ mb: String(MAX_UPLOAD_MB) })}
						accept={DOCUMENT_ACCEPT}
						{form}
						errors={$errors}
					/>

					<!-- Not shown, not tabbable, not announced: only a bot fills it in. -->
					<div class="hidden" aria-hidden="true">
						<label for="contact-website">Website</label>
						<input id="contact-website" name="website" tabindex="-1" autocomplete="off" />
					</div>

					<Button type="submit" size="lg" disabled={$submitting}>
						{#if $submitting}
							<Loader class="size-4 animate-spin" aria-hidden="true" />
							{m.contact_submitting()}
						{:else}
							<Send class="size-4" aria-hidden="true" />
							{m.contact_submit()}
						{/if}
					</Button>

					<p class="text-xs text-muted-foreground">{m.contact_response_note()}</p>
				</form>
			{/if}
		</div>

		<!-- Direct details -->
		<aside class="lg:pt-2">
			<h2 class="eyebrow mb-6 text-brand-gold">{m.contact_details_title()}</h2>
			<dl class="space-y-0">
				{#each details as detail, index (detail.label)}
					{@const Icon = detail.icon}
					<div
						use:reveal={{ delay: stagger(index, 80) }}
						class="flex items-start gap-3 border-t py-4"
					>
						<Icon class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<div>
							<dt class="eyebrow text-muted-foreground">{detail.label}</dt>
							<dd class="mt-1.5 text-sm font-medium">
								{#if detail.href}
									<a href={detail.href} class="transition-colors hover:text-primary">
										{detail.value}
									</a>
								{:else}
									{detail.value}
								{/if}
							</dd>
						</div>
					</div>
				{/each}
			</dl>
		</aside>
	</div>
</section>
