## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, playwright, tailwindcss, sveltekit-adapter, drizzle, better-auth, paraglide, ai-tools

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

## This project

Pulsedata Solutions — a bilingual (English / Amharic) five-page marketing site.
Read **COMPANY.md** for who the client is and what the copy must say, and
**BUILD.md** for the architecture, settled decisions and what is still outstanding.

Conventions worth knowing before editing:

- **Bilingual data** — translatable columns come in pairs (`title` / `titleAm`).
  Read them through `pick()` in `$lib/i18n`, never directly; it falls back to
  English when the Amharic is empty.
- **Routing** — English is unprefixed, Amharic is `/am/...`. Every internal link
  goes through paraglide's `localizeHref`.
- **Copy** — the home page's prose lives in `messages/{en,am}.json`. Posts,
  projects, the team and enquiries live in the database. `en.json` and `am.json` must keep
  identical key sets and identical `{placeholders}`.
- **Forms** — superforms + zod 4, built with the `$lib/formComponents` set.
  Validation messages come from paraglide so a form filled in Amharic fails in
  Amharic, which is why the schemas are functions rather than constants.
- **Uploads** — `saveUploadedFile` returns a filename; store the string. Public
  files serve from `/files/:name`; anything private goes to `FILES_DIR/private`,
  which that route cannot address.
- **`@html`** — only in the two article templates, fed by `renderMarkdown` in
  `$lib/server/markdown`, plus `JsonLd.svelte`, where Svelte cannot put text
  inside a script element any other way and `jsonLd()` escapes `<`, `>` and `&`
  so markup is impossible rather than merely sanitised. Those are the only two.
  Keep it that way.
- **Motion** — CSS plus one IntersectionObserver, no animation library. Add a
  scroll reveal with `use:reveal` from `$lib/actions/reveal` (and `stagger(i)`
  for lists); use the `.enter` class with `--enter` for above-the-fold content,
  which must animate on first paint. Never write a hidden state into the
  stylesheet: the action applies it in JavaScript so that a no-JS page renders
  complete. `e2e/motion.e2e.ts` guards this — run it after touching any of it.
- **Dashboard** — `/dashboard`, guarded by `requireUser`. Bodies are HTML from
  the WYSIWYG editor and are sanitised by `renderRichText` on read (which uses
  `sanitize-html`, **not** DOMPurify — see BUILD.md; DOMPurify needs jsdom, and
  jsdom does not survive being bundled). Bilingual
  fields use `BilingualField`; repeating rows use `Repeater`, whose `set(patch)`
  callback is mandatory — binding directly to a row mutates it without notifying
  the Superforms store, and the save silently writes nothing.
- **Never enable public sign-up.** `allowSignUp` is false everywhere except
  `scripts/create-admin.ts`; every account can publish and read the enquiry
  inbox.
- **The root layout applies to every route**, dashboard included. Site chrome
  belongs in `(site)/+layout.svelte`.
- A page may not mix a `default` form action with named ones — both content
  forms post to `?/save`.
- **Email** — every message goes through `sendMail` in
  `$lib/server/mail/transport` and is built by `renderEmail` in
  `$lib/server/mail/layout`. A new kind of email is a function in
  `mail/templates.ts` that describes its content; never a second copy of the
  layout, and never markup in a route. The layout is tables and inline styles
  on purpose — Outlook still renders through Word's HTML engine.
- **Every send is recorded.** `sendMail` writes a `sent_emails` row on both
  paths, success and failure — do not move that into the callers, and do not add
  a second way to send. Pass `kind`, and `sentBy`/`enquiryId` when a person or
  an enquiry is behind it. The record is read at `/dashboard/email/sent`, and
  the stored HTML is shown in a sandboxed `iframe`, never through `{@html}`.
- **A composer never takes its recipient from the form.** The reply on an
  enquiry reads the address from the row; posting one would make the action an
  authenticated relay for company-branded mail.
- Mail failures on the **contact form** are logged and swallowed: the enquiry is
  already stored, and an SMTP timeout must not tell a visitor their message was
  lost. Mail failures in the **dashboard** are shown, with the draft kept.
- **SEO** — canonical and `hreflang` come from `Seo.svelte` in the `(site)`
  layout, built from `page.url`. Never hand-write a canonical in a page head;
  one that disagrees with the served URL de-indexes the page. `/sitemap.xml` is
  generated from the database, so a new content type needs adding there.
- **Heading levels are structure, not size.** `PostCard`/`ProjectCard` take a
  `level`; pass `2` when the list sits directly under the page's `h1`. Use the
  classes for size.
- **Two error pages.** `(site)/+error.svelte` is the public one; the root
  `+error.svelte` serves the dashboard and endpoints. An unmatched URL reaches
  the public one only through the catch-all at `(site)/[...path=publicpath]` —
  route groups do not apply to routes that never matched.
- **Login is throttled in two places** and both are load-bearing:
  `$lib/server/throttle.ts` for the form, Better Auth's `rateLimit` for
  `/api/auth/*`. A SvelteKit action calls `signInEmail()` as a function, so the
  HTTP limiter never sees it.
- **Case studies are data.** `scripts/projects.ts` holds all ten, bodies in
  markdown, converted to HTML on seed. Child rows (services, outcomes, images)
  are replaced wholesale on every run, so the file is the whole truth.
- **Gallery images are uploads, not build assets.** They live in `FILES_DIR`
  under UUID names, the database holds the bare filename, and the dashboard
  edits them at `/dashboard/projects/<id>`. Never put a servable file in
  `static/` that someone is meant to be able to change. `FILES_DIR` must be
  deployed and backed up — the repository cannot restore it.
- The gallery's add/update/delete are **three separate actions**, one form per
  row. Do not fold them into the project's Superforms save: an image row owns a
  file, and a wholesale replace would re-upload every file on every save.
- **The team is data.** `team_members` + `team_member_links`, edited at
  `/dashboard/team`. Portraits are all-or-nothing: the about page shows them
  only when every published member has one, decided once in
  `about/+page.server.ts`. Do not make that per-card.
- **Testimonials are data.** A `testimonials` row is a quote, who said it and
  the client's logo, edited at `/dashboard/testimonials` and shown on the home
  page. No slug, no page and no `published_at` — a quote is either shown or it
  is not — so `isLive` does not apply to it and neither does the sitemap. The
  logo is optional and drawn `object-contain`: cropping a wordmark to a square
  is how a client's mark ends up unreadable. A quote may name a `project_id`,
  which puts it on that case study as well; the reference is `set null`, not
  `cascade` — a client's words are still true after the case study about them
  is withdrawn, and permission was given for the quote, not for the page.
- **`Repeater` takes `isBlank`** when a row has a pre-set field. The default
  "every field empty" test never fires on a row that starts on a chosen social
  platform, and the trailing-blank-row effect then appends for ever.
- **Traffic is counted server-side** in `hooks.server.ts` — no script, no
  cookie, no third party, no IP address stored, and a visitor hash that rotates
  daily. Keep it that way: anything more identifying turns a counter into
  tracking and the site into something that needs a consent banner. The insert
  is never awaited.
- **`/health` stays boring.** It is public, so it may answer "is it up" and
  nothing else — no version, no host, no counts. It queries the database and
  answers 503 when that fails.
- **Social cards** — `og:image` falls back to `static/og-cover.png` (1200x630);
  `twitter:card` is set once in `Seo.svelte` and there is deliberately no
  `twitter:image`. Never point a card at `longLogo.png`: a logo shared at a
  logo's aspect ratio renders as a letterboxed thumbnail.
- **Never publish a client's real data.** Screenshots of an admin dashboard come
  from a sanitised copy of the database, never the real one. See the Spotless
  section in `BUILD.md`.
- **The e2e suite runs the built server** (`node --env-file=.env build`), not
  `vite preview`. They are different programs: preview leaves dependencies
  external, the build inlines them, and a package that resolves a file at
  runtime by relative path fails only in the second. Do not change it back for
  speed.
- `ORIGIN` must match the host being served. adapter-node rejects form POSTs
  otherwise, and Better Auth stops answering `/api/auth/*` entirely — which is
  why `playwright.config.ts` sets it for the test server.

Useful commands: `npm run db:push`, `npm run db:seed`, `npm run check`,
`npm run test:e2e`.
