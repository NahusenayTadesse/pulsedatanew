import { relations } from 'drizzle-orm';
import { enquiryTopics } from '$lib/forms/topics';
import { socialPlatforms } from '$lib/social';
import { emailKinds, emailStatuses } from '$lib/outbox';
import {
	boolean,
	index,
	int,
	mediumtext,
	mysqlEnum,
	mysqlTable,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/mysql-core';

export * from './auth.schema';

/**
 * Content schema.
 *
 * Three rules shape it.
 *
 * 1. **Amharic lives beside English, not in a join.** Every translatable column
 *    has an `*_am` twin. With exactly two locales a `*_translations` table buys
 *    nothing but a join on every read, and a null `*_am` is a clean, queryable
 *    "no translation yet — fall back to English", which is what `pick()` in
 *    `$lib/i18n` does. Add a third locale and this should become a join table;
 *    two does not justify one.
 *
 * 2. **Only what changes is in here.** The home page's argument is prose that
 *    ships with the code, so it lives in `messages/{en,am}.json`, version
 *    controlled with the markup it sits in. What is in the database is the
 *    material that accumulates after launch: posts, projects, the team, and the
 *    enquiries the contact form collects. The team moved here from the message
 *    files the day it became clear that hiring someone should not require a
 *    deploy.
 *
 * 3. **Uploads are filenames, not rows.** `saveUploadedFile` writes a UUID-named
 *    file and returns that name; the columns below store the string and
 *    `/files/[name]` streams it back. There is no media table because, without a
 *    dashboard, nothing would ever read it.
 */

/** Whether a row is visible to the public. Nothing is published by accident. */
const publishStatus = ['draft', 'published'] as const;

/**
 * Primary keys are `int unsigned auto_increment`, not drizzle's `serial`.
 *
 * `serial` expands to a `SERIAL` column, which MariaDB already defines as
 * including AUTO_INCREMENT — so the generated DDL carries it twice and fails to
 * parse there, on a schema that is fine against MySQL proper. Spelling the
 * column out works on both, and a 32-bit key is more than this site will ever
 * need for blog posts.
 */

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const posts = mysqlTable(
	'posts',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		/**
		 * Shared by both languages, so `/blogs/erp-for-multi-branch` and
		 * `/am/blogs/erp-for-multi-branch` are the same post. A per-locale slug
		 * would mean the language switcher could not resolve a URL to its
		 * counterpart without a second lookup, and would strand anyone who shared
		 * an Amharic link with an English reader.
		 */
		slug: varchar('slug', { length: 191 }).notNull(),

		title: varchar('title', { length: 255 }).notNull(),
		titleAm: varchar('title_am', { length: 255 }),
		/** The index card's summary, and the `og:description`. */
		excerpt: text('excerpt'),
		excerptAm: text('excerpt_am'),
		/** HTML from the dashboard editor. Sanitised on read — see `$lib/server/richtext`. */
		body: mediumtext('body').notNull(),
		bodyAm: mediumtext('body_am'),

		/** A `/files/:name` filename, from `saveUploadedFile`. */
		coverImage: varchar('cover_image', { length: 255 }),
		coverImageAlt: varchar('cover_image_alt', { length: 255 }),
		coverImageAltAm: varchar('cover_image_alt_am', { length: 255 }),

		category: varchar('category', { length: 120 }),
		categoryAm: varchar('category_am', { length: 120 }),

		/** Free text, not a `user` FK: most posts are bylined to the company. */
		author: varchar('author', { length: 160 }),
		authorAm: varchar('author_am', { length: 160 }),

		status: mysqlEnum('status', publishStatus).notNull().default('draft'),
		featured: boolean('featured').notNull().default(false),
		readingMinutes: int('reading_minutes'),

		/**
		 * Nullable while a post is a draft, and allowed to be in the future — the
		 * index filters on `status = 'published' AND published_at <= NOW()`, which
		 * is what lets a finished post be scheduled rather than watched for.
		 */
		publishedAt: timestamp('published_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		uniqueIndex('posts_slug_uidx').on(table.slug),
		// The index page's exact sort: published rows, newest first.
		index('posts_status_published_at_idx').on(table.status, table.publishedAt)
	]
);

// ---------------------------------------------------------------------------
// Projects / case studies
// ---------------------------------------------------------------------------

export const projects = mysqlTable(
	'projects',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		slug: varchar('slug', { length: 191 }).notNull(),

		/** The engagement's name; `client` is who it was for. */
		name: varchar('name', { length: 255 }).notNull(),
		nameAm: varchar('name_am', { length: 255 }),
		client: varchar('client', { length: 255 }),
		clientAm: varchar('client_am', { length: 255 }),

		/** One or two sentences, for the index card. */
		summary: text('summary'),
		summaryAm: text('summary_am'),
		/** HTML from the dashboard editor: the full case study. */
		body: mediumtext('body'),
		bodyAm: mediumtext('body_am'),

		industry: varchar('industry', { length: 160 }),
		industryAm: varchar('industry_am', { length: 160 }),
		/** Rendered as-is ("2025", "2025–present"), so it is text, not a date. */
		year: varchar('year', { length: 32 }),

		coverImage: varchar('cover_image', { length: 255 }),
		coverImageAlt: varchar('cover_image_alt', { length: 255 }),
		coverImageAltAm: varchar('cover_image_alt_am', { length: 255 }),
		/** The client's own mark, shown on the card. */
		clientLogo: varchar('client_logo', { length: 255 }),

		/** An outbound link to the delivered site, when there is one to show. */
		websiteUrl: varchar('website_url', { length: 500 }),

		status: mysqlEnum('status', publishStatus).notNull().default('draft'),
		featured: boolean('featured').notNull().default(false),
		/** Manual ordering; the index sorts by this, then by `year` descending. */
		sortOrder: int('sort_order').notNull().default(0),

		publishedAt: timestamp('published_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		uniqueIndex('projects_slug_uidx').on(table.slug),
		index('projects_status_sort_idx').on(table.status, table.sortOrder)
	]
);

/**
 * The modules or services a project delivered — "HR & Payroll", "Inventory".
 *
 * A row per item rather than a JSON array because these are shown as filter
 * chips on the index, and filtering by one means querying it.
 */
export const projectServices = mysqlTable(
	'project_services',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		projectId: int('project_id', { unsigned: true })
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		label: varchar('label', { length: 160 }).notNull(),
		labelAm: varchar('label_am', { length: 160 }),
		sortOrder: int('sort_order').notNull().default(0)
	},
	(table) => [index('project_services_project_idx').on(table.projectId)]
);

/**
 * The measurable results — the "drastically reduced manual tracking errors"
 * kind of claim, split into a figure and what it describes so the case study
 * page can set them at different sizes.
 */
export const projectOutcomes = mysqlTable(
	'project_outcomes',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		projectId: int('project_id', { unsigned: true })
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		/** The figure: "40%", "6 branches". Numerals read the same in both. */
		value: varchar('value', { length: 80 }).notNull(),
		label: varchar('label', { length: 200 }).notNull(),
		labelAm: varchar('label_am', { length: 200 }),
		sortOrder: int('sort_order').notNull().default(0)
	},
	(table) => [index('project_outcomes_project_idx').on(table.projectId)]
);

export const projectImages = mysqlTable(
	'project_images',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		projectId: int('project_id', { unsigned: true })
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		/** A `/files/:name` filename. */
		image: varchar('image', { length: 255 }).notNull(),
		caption: varchar('caption', { length: 255 }),
		captionAm: varchar('caption_am', { length: 255 }),
		/** Alt text is not the caption: one describes, the other comments. */
		alt: varchar('alt', { length: 255 }),
		altAm: varchar('alt_am', { length: 255 }),
		sortOrder: int('sort_order').notNull().default(0)
	},
	(table) => [index('project_images_project_idx').on(table.projectId)]
);

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

/**
 * The people on the about page.
 *
 * This started in `messages/{en,am}.json` on the reasoning that three bios
 * change roughly never — which was true of the copy and false of the company.
 * A hire, a title change or a new photograph should not need a deploy, so the
 * team is a table like everything else that accumulates after launch.
 *
 * `photo` is optional on purpose, and the about page reads the whole set before
 * deciding how to draw it: photographs appear only when *every* published
 * member has one. A grid of three faces and one monogram does not read as a
 * team, it reads as a missing image.
 */
export const teamMembers = mysqlTable(
	'team_members',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),

		name: varchar('name', { length: 200 }).notNull(),
		nameAm: varchar('name_am', { length: 200 }),
		role: varchar('role', { length: 200 }),
		roleAm: varchar('role_am', { length: 200 }),
		bio: text('bio'),
		bioAm: text('bio_am'),

		/** A `/files/:name` filename, as every other upload is. */
		photo: varchar('photo', { length: 255 }),
		/**
		 * Alt text for the photograph.
		 *
		 * Nullable, and the page falls back to the person's name — which is very
		 * often the whole of what a portrait's alt text should say.
		 */
		photoAlt: varchar('photo_alt', { length: 255 }),
		photoAltAm: varchar('photo_alt_am', { length: 255 }),

		status: mysqlEnum('status', publishStatus).notNull().default('draft'),
		sortOrder: int('sort_order').notNull().default(0),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [index('team_members_status_sort_idx').on(table.status, table.sortOrder)]
);

/**
 * A person's social profiles.
 *
 * A row per link rather than a column per platform, because the set of
 * platforms that matter is not stable and a `linkedin_url` column is a schema
 * change every time it moves. `platform` is an enum so every stored value has
 * an icon — see `$lib/social`.
 */
export const teamMemberLinks = mysqlTable(
	'team_member_links',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		memberId: int('member_id', { unsigned: true })
			.notNull()
			.references(() => teamMembers.id, { onDelete: 'cascade' }),
		platform: mysqlEnum('platform', socialPlatforms).notNull(),
		/** A full URL, or a bare address when `platform` is `email`. */
		url: varchar('url', { length: 500 }).notNull(),
		sortOrder: int('sort_order').notNull().default(0)
	},
	(table) => [index('team_member_links_member_idx').on(table.memberId)]
);

/**
 * What a client said about the work.
 *
 * A quote is not a case study and does not want to be one: it has no page, no
 * slug and no body, so it lives in its own small table rather than as another
 * nullable column on `projects`. Testimonials outlive the project they came
 * from and several may come from one client, which a column could not hold.
 *
 * The logo is an upload, like every other image here — the company's own mark,
 * shown beside the quote. It is optional: a quote with a name and a role is
 * still worth printing, and a placeholder square where a logo should be is
 * worse than no logo at all.
 */
export const testimonials = mysqlTable(
	'testimonials',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),

		/** The words themselves, without surrounding quotation marks — the page draws those. */
		quote: text('quote').notNull(),
		quoteAm: text('quote_am'),

		/** Who said it. Required: an unattributed testimonial persuades nobody. */
		authorName: varchar('author_name', { length: 200 }).notNull(),
		authorNameAm: varchar('author_name_am', { length: 200 }),
		authorRole: varchar('author_role', { length: 200 }),
		authorRoleAm: varchar('author_role_am', { length: 200 }),

		company: varchar('company', { length: 200 }),
		companyAm: varchar('company_am', { length: 200 }),

		/** A `/files/:name` filename, as every other upload is. */
		logo: varchar('logo', { length: 255 }),
		/**
		 * Alt text for the logo.
		 *
		 * Nullable, and the page falls back to the company name — which is the
		 * whole of what a logo's alt text should ever say.
		 */
		logoAlt: varchar('logo_alt', { length: 255 }),
		logoAltAm: varchar('logo_alt_am', { length: 255 }),

		/**
		 * The case study this quote belongs to, when it belongs to one.
		 *
		 * `set null` rather than `cascade`: a client's words are still true after
		 * the case study about them is withdrawn, and deleting a project should
		 * not silently delete the testimonial the client gave permission for. The
		 * quote simply stops appearing on a page that no longer exists and goes
		 * on showing on the home page.
		 */
		projectId: int('project_id', { unsigned: true }).references(() => projects.id, {
			onDelete: 'set null'
		}),

		status: mysqlEnum('status', publishStatus).notNull().default('draft'),
		sortOrder: int('sort_order').notNull().default(0),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('testimonials_status_sort_idx').on(table.status, table.sortOrder),
		index('testimonials_project_idx').on(table.projectId)
	]
);

// ---------------------------------------------------------------------------
// Outbound mail
// ---------------------------------------------------------------------------

/**
 * One row per message this site tries to send.
 *
 * Written by `sendMail` itself rather than by its callers, so nothing can send
 * without leaving a record — the same reason every message goes through one
 * transport in the first place.
 *
 * It exists because SMTP submission leaves no trace anywhere the company can
 * see: webmail's Sent folder is written by webmail, so a message this
 * application sends is invisible in exactly the place staff look for it. The
 * `MAIL_ARCHIVE` blind copy puts one in the inbox; this puts one somewhere that
 * can be searched, filtered and read beside the enquiry it answers.
 *
 * **Failures are recorded too**, with the reason. A message that never left is
 * the single most important thing to be able to see, and it is the one a
 * mailbox copy can never show you.
 *
 * The body is stored as sent. That makes this table personal data — recipient
 * addresses and message text — so it is behind the dashboard login, and a row
 * can be deleted from the screen that shows it.
 */
export const sentEmails = mysqlTable(
	'sent_emails',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),

		/** The envelope recipient. One address; `cc` and `bcc` are separate. */
		recipient: varchar('recipient', { length: 320 }).notNull(),
		cc: varchar('cc', { length: 500 }),
		bcc: varchar('bcc', { length: 500 }),
		subject: varchar('subject', { length: 500 }).notNull(),

		/** Exactly what was sent, both parts. */
		bodyHtml: mediumtext('body_html').notNull(),
		bodyText: mediumtext('body_text'),

		kind: mysqlEnum('kind', emailKinds).notNull().default('other'),
		status: mysqlEnum('status', emailStatuses).notNull().default('sent'),
		/** The mail server's complaint, when `status` is `failed`. */
		error: text('error'),
		/** The SMTP message id, which is what a mail server's logs are searched by. */
		messageId: varchar('message_id', { length: 255 }),
		/** Attachment file names only — never their contents or paths. */
		attachments: varchar('attachments', { length: 1000 }),

		/**
		 * Who pressed send, when a person did. A name rather than a user id:
		 * the record should still say who sent it after that account is gone.
		 */
		sentBy: varchar('sent_by', { length: 160 }),
		/**
		 * The enquiry this answers, when it answers one.
		 *
		 * Not a foreign key on purpose — deleting an enquiry must not delete the
		 * evidence that a reply was sent to it, and a cascade would do exactly
		 * that.
		 */
		enquiryId: int('enquiry_id', { unsigned: true }),

		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('sent_emails_created_idx').on(table.createdAt),
		index('sent_emails_status_idx').on(table.status, table.createdAt),
		index('sent_emails_enquiry_idx').on(table.enquiryId)
	]
);

// ---------------------------------------------------------------------------
// Traffic
// ---------------------------------------------------------------------------

/**
 * One row per page view of the public site.
 *
 * Deliberately not analytics in the usual sense: there is no IP address here,
 * no user agent, no cookie and nothing that leaves the server. `visitor` is a
 * hash of the address, the user agent and *the date*, salted with a server
 * secret — which counts a person once a day and is worthless the following
 * day, so the table cannot be turned into a record of who read what over time.
 *
 * That is enough to answer the two questions a company site actually asks —
 * how many people came, and what did they read — without a third party, a
 * consent banner, or a script in the page.
 */
export const pageViews = mysqlTable(
	'page_views',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		/** The de-localised path, so `/am/about` and `/about` count as one page. */
		path: varchar('path', { length: 191 }).notNull(),
		locale: varchar('locale', { length: 8 }).notNull().default('en'),
		/** Daily-rotating, salted hash. Not reversible and not stable past midnight. */
		visitor: varchar('visitor', { length: 64 }).notNull(),
		/** Only the host — `google.com`, not the query someone typed into it. */
		referrerHost: varchar('referrer_host', { length: 191 }),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('page_views_created_idx').on(table.createdAt),
		index('page_views_path_idx').on(table.path, table.createdAt)
	]
);

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

/**
 * What the enquiry is about.
 *
 * Imported rather than declared, because the contact form's zod schema needs
 * the same list and runs in the browser, where this module cannot be loaded.
 */
export { enquiryTopics } from '$lib/forms/topics';

export const contactSubmissions = mysqlTable(
	'contact_submissions',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		name: varchar('name', { length: 200 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 60 }),
		company: varchar('company', { length: 200 }),
		topic: mysqlEnum('topic', enquiryTopics).notNull().default('other'),
		message: text('message').notNull(),

		/**
		 * Which language the form was filled in, so a reply goes back in the
		 * language the sender chose to write in rather than the one whoever opens
		 * the inbox prefers.
		 */
		locale: varchar('locale', { length: 8 }).notNull().default('en'),

		/** An optional brief or RFP; a `/files/:name` filename. */
		attachment: varchar('attachment', { length: 255 }),
		attachmentName: varchar('attachment_name', { length: 255 }),

		status: mysqlEnum('status', ['new', 'read', 'replied', 'archived']).notNull().default('new'),

		/**
		 * Kept only to rate-limit and to recognise a flood from one source. Not
		 * shown anywhere, and there is no dashboard that reads it yet.
		 */
		ipAddress: varchar('ip_address', { length: 64 }),
		userAgent: text('user_agent'),

		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('contact_submissions_status_idx').on(table.status, table.createdAt),
		// Reads the newest-first inbox order and the rate-limit lookup.
		index('contact_submissions_ip_created_idx').on(table.ipAddress, table.createdAt)
	]
);

// ---------------------------------------------------------------------------
// Login throttling
// ---------------------------------------------------------------------------

/**
 * One row per failed sign-in, kept only long enough to count.
 *
 * In the database rather than in memory because a count that lives in a
 * process is reset by every deploy and every restart — which is a lock an
 * attacker can clear by waiting for one. It is also the same mechanism the
 * contact form's flood check already uses, so there is one answer here to
 * "where do we count things per address".
 *
 * Successful sign-ins delete their rows rather than adding one: what matters
 * is consecutive failures, and a person who gets their password right on the
 * sixth try should not be locked out on the seventh visit.
 */
export const loginAttempts = mysqlTable(
	'login_attempts',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		/** The email that was tried, lower-cased — recorded whether or not it exists. */
		identifier: varchar('identifier', { length: 255 }).notNull(),
		ipAddress: varchar('ip_address', { length: 64 }).notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('login_attempts_identifier_idx').on(table.identifier, table.createdAt),
		index('login_attempts_ip_idx').on(table.ipAddress, table.createdAt)
	]
);

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export const newsletterSubscribers = mysqlTable(
	'newsletter_subscribers',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		email: varchar('email', { length: 255 }).notNull(),
		locale: varchar('locale', { length: 8 }).notNull().default('en'),
		/** Set on unsubscribe rather than deleting, so a resubscribe is visible. */
		unsubscribedAt: timestamp('unsubscribed_at'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [uniqueIndex('newsletter_subscribers_email_uidx').on(table.email)]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const projectsRelations = relations(projects, ({ many }) => ({
	services: many(projectServices),
	outcomes: many(projectOutcomes),
	images: many(projectImages)
}));

export const projectServicesRelations = relations(projectServices, ({ one }) => ({
	project: one(projects, { fields: [projectServices.projectId], references: [projects.id] })
}));

export const projectOutcomesRelations = relations(projectOutcomes, ({ one }) => ({
	project: one(projects, { fields: [projectOutcomes.projectId], references: [projects.id] })
}));

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
	links: many(teamMemberLinks)
}));

export const teamMemberLinksRelations = relations(teamMemberLinks, ({ one }) => ({
	member: one(teamMembers, { fields: [teamMemberLinks.memberId], references: [teamMembers.id] })
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
	project: one(projects, { fields: [projectImages.projectId], references: [projects.id] })
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
	project: one(projects, { fields: [testimonials.projectId], references: [projects.id] })
}));

export type Post = typeof posts.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectService = typeof projectServices.$inferSelect;
export type ProjectOutcome = typeof projectOutcomes.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type SentEmail = typeof sentEmails.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamMemberLink = typeof teamMemberLinks.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
