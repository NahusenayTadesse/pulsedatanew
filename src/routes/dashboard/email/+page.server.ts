import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { composeSchema } from '$lib/forms/mail';
import { renderRichText } from '$lib/server/richtext';
import { isMailConfigured, MailError, sendMail } from '$lib/server/mail/transport';
import { generalMessage } from '$lib/server/mail/templates';
import * as m from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(composeSchema())),
	mailReady: isMailConfigured()
});

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(composeSchema()));
		if (!form.valid) return fail(400, { form });

		const mail = generalMessage({
			subject: form.data.subject,
			// Sanitised before sending, like every other body on this site: the
			// editor is the only author, but `renderRichText` is the only thing
			// that decides what markup leaves the building.
			bodyHtml: renderRichText(form.data.body),
			from: locals.user?.name ?? 'Pulsedata Solutions'
		});

		try {
			await sendMail({
				to: form.data.to,
				archive: true,
				kind: 'composed',
				sentBy: locals.user?.name ?? null,
				...mail
			});
		} catch (err) {
			return message(form, err instanceof MailError ? err.message : m.dash_email_failed(), {
				status: 500
			});
		}

		return message(form, m.dash_email_sent({ email: form.data.to }));
	}
};
