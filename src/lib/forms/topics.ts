/**
 * The enquiry topics, in the order the contact form offers them.
 *
 * Declared outside `$lib/server` on purpose: the database column and the zod
 * schema must agree, but the zod schema is validated in the browser too, and
 * SvelteKit forbids importing anything under `$lib/server` into client code —
 * correctly, since that boundary cannot be judged file by file. So the list
 * lives here and both sides import it.
 */
export const enquiryTopics = ['erp', 'website', 'demo', 'support', 'partnership', 'other'] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number];
