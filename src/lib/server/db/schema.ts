import { relations } from 'drizzle-orm';
import { enquiryTopics } from '$lib/forms/topics';
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
 * 2. **Only what changes is in here.** The home and about pages are prose that
 *    ships with the code, so they live in `messages/{en,am}.json` and are
 *    version-controlled with the markup they sit in. What is in the database is
 *    the material that accumulates after launch: posts, projects, and the
 *    enquiries the contact form collects.
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

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
	project: one(projects, { fields: [projectImages.projectId], references: [projects.id] })
}));

export type Post = typeof posts.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectService = typeof projectServices.$inferSelect;
export type ProjectOutcome = typeof projectOutcomes.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
