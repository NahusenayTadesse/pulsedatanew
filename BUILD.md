# Pulsedata Solutions — Build Plan

Content and positioning live in [COMPANY.md](./COMPANY.md). This file records how
the site is built and which decisions are already settled.

---

## Decisions (settled 2026-08-30)

| Decision           | Choice                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Content source** | Blogs + projects + contact submissions in the DB, edited in the dashboard. Home/About prose in paraglide messages. |
| **Auth**           | Better Auth schema + session hook stay wired. **No login/signup routes, no dashboard.**                            |
| **Locale URLs**    | English unprefixed (`/about`), Amharic prefixed (`/am/about`).                                                     |
| **Amharic copy**   | Drafted here, flagged for review before launch.                                                                    |

## Brand

| Token   | Value          | Source                                       |
| ------- | -------------- | -------------------------------------------- |
| Primary | `#027F81` teal | `static/mainLogo.png`, `static/longLogo.png` |
| Accent  | `#CDA756` gold | `static/longLogoforDark.png`                 |

- Light mode: teal logo (`longLogo.png` / `mainLogo.png`), teal primary, gold accent.
- Dark mode: gold logo (`longLogoforDark.png` / `mainLogoforDark.png`), gold used for
  headings and accents, teal kept for interactive surfaces.

## Pages

| Route       | Amharic        | Contents                                                                       |
| ----------- | -------------- | ------------------------------------------------------------------------------ |
| `/`         | `/am`          | Hero, the nine ERP modules, deployment models, Spotless case study teaser, CTA |
| `/about`    | `/am/about`    | Mission, vision, technical distinction, leadership team, why choose us         |
| `/projects` | `/am/projects` | Project index + `/projects/[slug]` detail (Spotless is the first)              |
| `/blogs`    | `/am/blogs`    | Post index + `/blogs/[slug]` detail                                            |
| `/contact`  | `/am/contact`  | Superforms + zod contact/demo-request form, contact details, map               |

## Stack conventions

- **Forms** — `sveltekit-superforms` + `zod@4`, using the `formComponents` set ported
  from `../dana` and `../shimeles` (`InputComp`, `FileUpload`, `SelectComp`, `Errors`,
  `LoadingBtn`, `FormCard`).
- **Files** — ported from `../dana`: `src/lib/server/upload.ts`,
  `src/lib/server/fileCache.ts`, and the `/files/[name=filename]` streaming endpoint.
  Dana's version is the right base; shimeles' is wired to a permissions/audit model
  this project does not have. Stored names are UUIDs; the DB holds the string.
- **UI** — shadcn-svelte (`luma` style, `mist` base), `@lucide/svelte` icons,
  `mode-watcher` for the theme toggle.
- **DB** — Drizzle + MySQL.

## Bilingual data

Side-by-side columns, following `../shimeles`: `title` / `titleAm`, `body` / `bodyAm`.
No separate translations table — two languages do not justify the join, and a null
`*_am` column is a clean "fall back to English" signal.

## What exists

```
src/lib/
  site.ts                    contact details & canonical origin — EDIT ME (see below)
  social.ts                  the social platforms a person can be linked from
  seo.ts                     canonical/hreflang URLs, the OG card, JSON-LD escaping
  i18n.ts                    pick(en, am) — reads the right half of a bilingual row
  assets.ts                  assetUrl() — a stored filename to its /files URL
  forms/
    topics.ts                enquiry topics, shared by the DB column and the zod enum
    uploads.ts               size cap, accepted types, image-compression settings
    contact.ts               contact + newsletter zod schemas, messages from paraglide
  formComponents/            InputComp, SelectComp, FileUpload, Errors, form-errors,
                             LoadingBtn, FormCard — ported from ../dana and ../shimeles
  components/site/           Header, Footer, Logo, ThemeToggle, LanguageSwitcher,
                             Section, CtaBand, PostCard, ProjectCard, NewsletterForm,
                             RecordFlow (the hero diagram)
  server/
    db/schema.ts             posts, projects (+services/outcomes/images),
                             contact_submissions, newsletter_subscribers, auth tables
    content.ts               the public reads, with one visibility rule in one place
    traffic.ts               the visitor counter — record + the dashboard's aggregates
    team-write.ts            writes a member's social links, replaced wholesale
    richtext.ts              sanitize-html; the only source of `@html` on the site
    upload.ts                saveUploadedFile / deleteUploadedFile (from ../dana)
    fileCache.ts             stat cache for the file route

src/routes/
  +page                      home
  about/                     mission, vision, architecture, team, why us
  projects/  [slug]/         index + case study
  blogs/     [slug]/         index + article
  contact/                   the superforms + zod form
  newsletter/                the footer field's action (no-JS fallback page)
  files/[name=filename]/     streams public uploads
  health/                    the uptime endpoint an outside monitor polls

scripts/seed.ts              the Spotless case study + three articles, both languages
```

### Motion

No animation library — the whole system is CSS plus one IntersectionObserver.
That is a deliberate constraint, not thrift: the product's central claim is that
it runs on modest hardware, and a marketing site that heats a laptop argues
against it. A full-page scroll measures ~2% CPU.

| Piece              | Where                                | What it does                                                                                                                                                      |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ambient background | `Ambient.svelte`                     | Ledger rules (static) plus two brand-coloured auras drifting on 34s and 47s cycles, so they never visibly loop. Fixed, `contain: strict`, `pointer-events: none`. |
| Page-load sequence | `.enter` in `layout.css`             | Hero and page headings stagger in on first paint via `--enter`.                                                                                                   |
| Scroll reveals     | `$lib/actions/reveal.ts`             | Fade-and-rise as elements arrive, with `stagger(i)` for lists.                                                                                                    |
| Hero pulses        | `RecordFlow.svelte`                  | A gold dot travels each connector once, in sequence — the diagram stating its own argument. The record's gold edge then breathes slowly.                          |
| Card hover         | `.card-lift`                         | 2px rise, image scales inside on the same hover.                                                                                                                  |
| Page transitions   | `onNavigate` + `::view-transition-*` | Cross-fade between routes; absent in Firefox, where navigation is simply instant.                                                                                 |
| Reading progress   | `ScrollProgress.svelte`              | Teal-to-gold bar on article and case-study pages.                                                                                                                 |
| Counting figures   | `CountUp.svelte`                     | Outcome numbers count up on arrival, preserving non-numeric parts — "24/7" animates the 24.                                                                       |

**Three rules the motion system holds to**, each guarded by `e2e/motion.e2e.ts`:

1. **The hidden state is applied by JavaScript, never by the stylesheet.** With
   scripting unavailable no element is ever hidden, so the page renders complete.
   A CSS-first reveal fails to a blank page, which is not a failure mode worth
   having for a decoration.
2. **Reduced motion is honoured before anything is hidden**, not by making the
   transition instant afterwards. The ambient layer switches off entirely.
3. **Nothing is ever stranded invisible.** An IntersectionObserver reports only
   threshold crossings, so a jump to the bottom of the page — End, an anchor, a
   restored scroll position — skips elements past the viewport without ever
   firing. A scroll sweep backs the observer up and reveals them instantly; it
   detaches as soon as nothing is pending.

To dial the atmosphere up or down, the two aura opacities and the blur radius
are at the bottom of `Ambient.svelte`; dark mode deliberately carries less of it,
because cream text over a teal glow loses contrast quickly.

### Design notes

- **Type** — Archivo (display, loaded from `wdth.css` for the 112% expanded axis),
  Inter (body), JetBrains Mono (eyebrows, figures, codes), Noto Sans Ethiopic last in
  every stack. Chosen for script symmetry: all three are grotesques with proportions
  close to Noto's, so a heading looks like the same heading in Amharic. The
  personality comes from how the type is set, not from a face that exists only in
  Latin.
- **The hero** (`RecordFlow.svelte`) is the signature: one sale, and the five modules
  it writes to, with the record's fields dimming to show what each ledger reads. The
  product's whole argument is "recorded once, read everywhere", which is abstract in
  a sentence and obvious as a diagram. It names five modules and not nine because a
  sale genuinely does not touch HR or Production.
- **Structure** — every section is a mono eyebrow, a heading, an optional standfirst.
  The same label/value shape recurs in the project metadata and the hero record, which
  is the point: this is a company that turns operations into labelled records.
- Deliberately no numbered `01 / 02 / 03` markers — the modules are a set, not a
  sequence, and numbering them would encode order that isn't there.

## Verified

- `npm run check`, `npm run lint`, `npm run build` all clean.
- `npm run test:e2e` — 21 guards pass against the production build: four on
  motion, eight on the dashboard boundary (auth redirects, no self-registration,
  no open redirect via `redirectTo`, private attachments unreachable, dashboard
  not indexable, and a full create/edit/delete round trip), six on SEO and the
  error pages, three on login throttling.
- **Lighthouse 100 / 100 / 100** (accessibility, best practices, SEO) on mobile
  for the home page, `/about`, `/projects`, `/blogs`, `/contact`, a case study, an
  article and the Amharic home page. A 404 URL scores zero, which is correct: it
  answers 404, and Lighthouse refuses to grade a page that is not meant to be
  indexed.
- Scrolling the full home page costs ~2% CPU; the ambient blur composites rather
  than repainting per frame.
- All 5 pages × 2 locales + both detail templates: no horizontal overflow and no
  console errors at 390 / 768 / 1440 px.
- Contact form: validation messages fire per-locale; a valid submit writes the row,
  stores the attachment, and lowercases the email.
- Attachments land in `FILES_DIR/private` and return 404 through `/files` by every
  encoding tried; path traversal is refused. Public files serve with `nosniff` and a
  download-forcing `Content-Disposition` for anything not an image or PDF.

## SEO

- **Canonical and `hreflang` on every public page**, from `Seo.svelte` in the
  `(site)` layout — built from `page.url`, so a page cannot claim a canonical
  that disagrees with the address it was served at. The alternates are
  reciprocal and include `x-default`; without them `/about` and `/am/about` look
  to a crawler like two unrelated pages competing for the same search rather
  than two languages of one.
- **`/sitemap.xml`** is generated from the database — the five static pages plus
  every published, not-future-dated article and case study, each with its
  `xhtml:link` alternates. `robots.txt` points at it and disallows the private
  half.
- **Heading order.** The index pages skipped from `h1` to `h3`, because the
  cards hard-coded `h3`. `PostCard` and `ProjectCard` now take a `level`, and it
  is set to `2` where a list sits directly under the page title.
- **Three real accessibility defects** turned up on the contact form and are
  fixed in the shared components, so every screen that uses them benefits: the
  file input's caption was a `<span>` rather than a `<label for>`; the topic
  dropdown carried `aria-required` on a `role="button"`, where it is invalid and
  silently dropped; and the contact details' `<dl>` wrapped its `dt`/`dd` one
  div too deep, which stops a screen reader pairing terms with values.

### Social cards and icons

- **`static/og-cover.png`** is a real 1200x630 card — the long logo on the brand
  cream — and is what every page falls back to. It replaced `longLogo.png`,
  which is a logo at a logo's aspect ratio: shared, it rendered as a letterboxed
  thumbnail. A case study or article with a cover image still uses its own.
- **`twitter:card` is `summary_large_image`**, set once in `Seo.svelte`. There is
  deliberately no `twitter:image`: X falls back to `og:image`, so a second tag
  would be one more thing to keep in step.
- **The favicon set** is generated from `mainLogo.png` — the mark alone, cream on
  the brand teal, matching `PulseData logo 5`. `favicon.ico` carries 16/32/48
  with the mark drawn tighter inside the tile, because the thin outline strokes
  of the full logo disappear below about 24px. `icon-192`, `icon-512`,
  `apple-touch-icon` and a maskable variant back the web manifest; the maskable
  one is full-bleed square, since a rounded tile inside a rounded mask shows the
  gap.

### Structured data

`JsonLd.svelte` renders one `application/ld+json` block; `Organization` and
`WebSite` sit on the home page and `BlogPosting` on each article, with the
articles pointing back at `#organization` by `@id` rather than repeating the
company.

**This is the only `{@html}` on the site that is not `renderRichText`.** Svelte
cannot put text inside a script element any other way, so `jsonLd()` in
`$lib/seo.ts` makes markup impossible instead of sanitising it: `<`, `>` and `&`
become `\uXXXX` escapes, which JSON parses back to the same characters and an
HTML parser cannot read as the start of anything. A project titled
`</script><script>…` stays a string. Nothing else may be interpolated into that
block.

## Error pages

Two of them, and which one appears is a routing decision rather than a style
choice:

- **`(site)/+error.svelte`** — the public one, inside the marketing chrome, with
  the four places a lost visitor might have been going and a line inviting them
  to say what they were looking for. Reaching it for an unknown URL needs the
  catch-all at `(site)/[...path=publicpath]`: an unmatched address belongs to no
  route group, so before that route every 404 fell through to the root page.
- **`+error.svelte`** at the root — the quiet one, for the dashboard, the login
  page and the endpoints. Previously these got SvelteKit's built-in error page:
  unstyled, on the half of the site the client's own staff use.

`src/params/publicpath.ts` decides which is which, and keeps `/api`, `/files`
and missing assets out of the HTML error page entirely.

## Login throttling

Two doors, and both are now locked:

- **The form** — `$lib/server/throttle.ts`, counted in the database like the
  contact form's flood check, because a counter that lives in a process is
  cleared by every restart. Five failures per address in fifteen minutes, then
  refused _before_ the password is verified — argon2 is deliberately slow, so
  checking first would hand a locked-out attacker a way to exhaust the server.
  Failures are recorded for addresses that do not exist too, or the lockout
  itself would reveal which addresses are real. A correct password clears the
  run.
- **`POST /api/auth/sign-in/email`** — mounted and reachable, and invisible to
  the form's throttle, because a SvelteKit action calls `signInEmail()` as a
  function rather than over HTTP. Better Auth's own `rateLimit` covers it,
  enabled explicitly because it is off outside production by default.

The per-IP limit is a deliberately generous backstop (100 per fifteen minutes),
not the control. The per-address lock is what stops a break-in; set the per-IP
number low and a stranger guessing at a made-up address can lock a whole office
out of its own dashboard.

## The dashboard

`/dashboard`, behind `requireUser` in `src/lib/server/guard.ts`. Three screens:

| Screen        | What it does                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Projects**  | List, create, edit, delete. Bilingual fields, cover image and client logo, plus repeaters for the modules delivered and the outcome figures.                                             |
| **Articles**  | List, create, edit, delete. Bilingual fields with a WYSIWYG body.                                                                                                                        |
| **Enquiries** | The contact-form inbox, with **Demo requests** as its own tab — a booking is an enquiry whose topic is `demo`. Status changes, a prefilled `mailto:` reply, and the attachment download. |

### Accounts

There is **no sign-up page and no sign-up endpoint**. Accounts are created on the
server:

```sh
npm run admin:create -- "Surafel Asamnew" surafel@pulsedata.et
```

The password is read from stdin so it never reaches shell history or `ps`.

> **This was a live hole, not a precaution.** The scaffold's
> `emailAndPassword: { enabled: true }` mounts Better Auth's sign-up endpoint
> publicly, so anyone who found `/api/auth/sign-up/email` could create an
> account and read the enquiry inbox. It was harmless while there was no
> dashboard. `disableSignUp` is now set in `src/lib/server/auth-config.ts`, and
> `e2e/dashboard.e2e.ts` proves no account can be self-registered.

### Layout separation

The root layout is deliberately near-empty. **It applies to every route and
cannot be escaped**, so the site header, footer and ambient background live in
`src/routes/(site)/+layout.svelte` and the dashboard sits outside that group.
When they did not, the enquiry inbox rendered under a "Book a live demo" banner.

### Content format

Bodies are stored as **HTML**, not markdown, because the editor is a WYSIWYG —
asking the executive manager to remember heading syntax is how a CMS stops being
used. `renderRichText` in `src/lib/server/richtext.ts` sanitises on the way out, and
it is the only source of anything handed to `{@html}`. `scripts/seed.ts` still
authors in markdown and converts on write, because a thousand-word case study as
HTML string literals would be unreadable in a diff.

**It uses `sanitize-html`, not DOMPurify, and that is a deployment decision as
much as a security one.** DOMPurify needs a DOM, which on the server meant
jsdom — and jsdom does not survive being bundled: one of its dependencies loads
a JSON file at runtime with `require('../data/patch.json')`, a path that exists
in `node_modules` and not in `build/server/chunks/`. The built site therefore
threw `Cannot find module '../data/patch.json'` the first time anything imported
this module, which is to say on **every article, every case study and both
dashboard composers** — a 500 on the readable half of the site.

It passed locally the whole time. `vite preview` leaves dependencies external
and lets Node resolve them normally; only the real build inlines them. The suite
now runs `node --env-file=.env build` for exactly this reason, and
`e2e/richtext.e2e.ts` asserts that a stored body still renders.

Swapping the engine tightened three things and loosened none: `data:` URLs in
`src` are now actually blocked (the old regexp said it blocked them and did
not), protocol-relative `//evil.example` links no longer pass as "relative", and
`colspan`/`rowspan` survive on tables, which the allowlist always claimed they
would. A link carrying `target` now also gets `rel="noopener noreferrer"`, since
an editor sets that from a toolbar button and cannot be expected to know why it
matters.

## Email

Nodemailer over SMTP, configured by `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` /
`SMTP_PASSWORD`, with `MAIL_FROM` (the address recipients see) and `MAIL_TO`
(where enquiry notifications land) falling back to the SMTP account. With none
of it set the site still records enquiries and shows the dashboard composers as
read-only, rather than failing.

Four layers, and the split is the point:

- `mail/transport.ts` — the only place mail leaves the application. Reads the
  configuration once, pools connections, throws `MailError`, and writes the
  record described below.
- `mail/outbox.ts` — one insert into `sent_emails`, which never throws.
- `mail/layout.ts` — the house style. Nested tables, a fixed 600px, inline
  styles on every element and a VML block behind the button, because Outlook
  still renders through Word's HTML engine. Returns the HTML and the plain-text
  alternative from the same content, so the two cannot drift apart.
- `mail/templates.ts` — the four messages. Each describes its content; none
  contains markup.

The messages:

1. **Acknowledgement** to whoever used the contact form, in the language they
   wrote in, quoting their own message back as a receipt.
2. **Notification** to the team, always English, with the enquiry's details, a
   link into the dashboard and `Reply-To` set to the sender — this is the piece
   that stops an enquiry sitting unread in a table.
3. **Reply**, written on the enquiry screen with the WYSIWYG editor. The
   recipient comes from the row, never the form; sending marks the enquiry
   replied, and only after the send succeeds.
4. **General**, from `/dashboard/email`, to an address typed by hand.

Both composers share `EmailComposer.svelte`. Bodies are sanitised by
`renderRichText` before they are sent, like every other body on this site.

An outbound proposal is a fifth kind, written as a script rather than typed into
the composer: `scripts/proposal.ts` builds its body, renders it through the same
layout and sends it through the same transport. It previews to
`.proposal-preview/` and sends nothing without `--send`.

### Where a sent message goes to be found

Nowhere, without help — which is the problem this solves. **Submitting over SMTP
writes nothing to webmail's Sent folder**: that folder is written by webmail
itself when _it_ sends something. A message this application sends is therefore
invisible in exactly the place staff look for it, which reads as "it never
sent". Two things fix it:

- **`MAIL_ARCHIVE`** blind-copies the company mailbox on everything a person
  composes — replies, the general composer, outbound proposals. Deliberately not
  the contact form's automatic acknowledgement, which would put a copy of every
  one in the inbox beside the notification that already announces it.
- **`sent_emails`**, at `/dashboard/email/sent`. One row per message, written by
  `sendMail` itself rather than by its callers — so nothing can send without
  leaving a record, and a new sender gets one for free.

The record holds both bodies as sent, the recipient, the kind, the SMTP message
id (which is what the mail server's own logs are searched by), attachment file
names, who pressed send, and the enquiry it answers when it answers one.
**Failures are recorded too, with the mail server's own words** — a message that
never left is the single most important thing to be able to see, and it is the
one a mailbox copy can never show you. The enquiry screen lists its own
correspondence above the reply box, because "has this been answered?" is asked
there, and the `replied` status only records that somebody pressed a button.

Two details worth keeping:

- The stored HTML is displayed in a **sandboxed `iframe` with `srcdoc`**, never
  through `{@html}`. An empty `sandbox` denies it scripts, forms, same-origin
  access and navigation, so a bad record can only look wrong inside its own box.
- `enquiry_id` is **not** a foreign key. Deleting an enquiry must not delete the
  evidence that a reply was sent to it, which a cascade would do.

The table is personal data — addresses and message text — so it is behind the
login and a row can be deleted from the screen that shows it.

## The case studies

Ten real deployments, seeded from `scripts/projects.ts` — the file a person
edits to correct a claim or add a project. `scripts/seed.ts` beside it is only
the machinery that writes them, and it is idempotent: re-running replaces the
services, outcomes and gallery of every project with exactly what the data file
says, rather than accumulating versions.

| Project                   | Client                    | Screenshots from       |
| ------------------------- | ------------------------- | ---------------------- |
| Spotless Enterprise ERP   | Spotless                  | a sanitised local copy |
| Shimeles Abera Foundation | Shimeles Abera Foundation | the live site          |
| Lalo Bakery Solutions     | Lalo Bakery Solutions     | the live site          |
| Golla Design Group        | Golla Design Group        | local, real content    |
| Yebehir Events            | Yebehir                   | the live site          |
| Fahem General Trading     | Fahem General Trading     | the live site          |
| Lalo Group                | Lalo Group                | the live site          |
| Lalo Fixtec               | Lalo Fixtec               | local, real content    |

**60 screenshots**, captured at 1440×900 on a 1.5× scale factor and converted to
WebP at 1600px wide (3.7 MB in total).

They live in **`FILES_DIR`**, under the UUID names `saveUploadedFile` produces,
and the database holds the bare filename that `assetUrl` turns into
`/files/<name>`. That is what makes them editable: a gallery image is now the
same kind of thing as a cover photo or a contact-form attachment, and the
dashboard manages it the same way. Files served straight out of `static/` could
not be changed from the admin interface at all, which is why they moved —
`scripts/migrate-project-images.ts` did the move and is safe to re-run.

The names are UUIDs because `/files/[name=filename]` matches only that shape.
The matcher's strictness is what stops the route addressing a subdirectory or
reaching into `FILES_DIR/private`, so it was not relaxed for readable filenames.

> **`FILES_DIR` now has to be deployed and backed up like a database.** These
> images are no more recoverable from the repository than an uploaded
> attachment is; `scripts/projects.ts` records which file each row points at,
> but not the file itself.

### Editing a gallery

`/dashboard/projects/<id>` carries a gallery panel below the project form:
upload an image, edit its bilingual alt text and caption, set its position, or
remove it — each row its own form against its own action.

Deliberately not part of the project's Superforms form, and deliberately not a
`Repeater`. Modules and outcomes are short text rows replaced wholesale on
save, which is cheap; doing that to images would delete and re-upload every
file on every save, and a failed save would take them all with it.

`golladesigns.com` and `fixtec.lalobakerysolutions.com` are slow to answer —
tens of seconds from some networks — which is why they first read as dead. They
resolve and return 200, so both case studies link out; their screenshots are
still the local ones, taken from the same codebase.

Spotless appears twice on purpose: the ERP its staff use, and the public site
that wins the contracts the ERP then delivers. `spotless-general-trading` was
written from the live site — there is no local repository for it in the
portfolio folder — so its case study describes what the delivered site does and
avoids claiming implementation detail that has not been read.

### The Spotless ERP screenshots

Spotless has no public site — it is a dashboard — and its database holds real
employee records: names, photographs, scanned government IDs, TIN numbers,
birth dates and salaries. None of that can appear on a public marketing page.

So the screenshots come from `spotless_demo`, a copy of the development
database with every personal identifier replaced by an invented stand-in
(`/tmp/sanitise-spotless.sql` documents exactly what was rewritten) and every
photograph, ID scan, signature and pension card cleared. Names are picked
deterministically from a list by row id, so the same employee keeps the same
invented name across every screen. The production database was never touched,
and the dev `.env` was restored afterwards.

**Delete `spotless_demo` when the screenshots are final** — it is a copy of a
client's data, sanitised but not needed.

## The team

The about page reads `team_members` and `team_member_links`, edited at
`/dashboard/team`. It used to be nine constants in the message files, on the
reasoning that three bios change roughly never — true of the copy, false of the
company. A hire, a title change or a photograph should not need a deploy.

Two rules are worth knowing before editing either end:

- **Portraits are all or nothing.** They appear only when _every_ published
  member has one; otherwise everyone gets a monogram. A grid of three faces and
  one monogram does not read as a team, it reads as a missing image — and it
  reads worst for the person without a portrait. The decision is made once, on
  the server (`showPhotos` in `about/+page.server.ts`), and the team list in the
  dashboard says which way it currently falls, because uploading one photograph
  and seeing nothing change is otherwise indistinguishable from a failed upload.
- **The section disappears when nobody is published.** A heading with nothing
  under it reads as a broken page.

Social links are a row per link with an enum `platform`, not a column per
platform: the set of platforms that matter is not stable, and `linkedin_url` is
a schema change every time it moves. Every value in `$lib/social.ts` has an icon
in `SocialIcon.svelte`, which carries the paths inline — Lucide dropped its
brand icons, and the package that still has them is 26 MB for eight marks. The
LinkedIn glyph is drawn here from primitives, because it is not in that package
either.

`Repeater` gained an `isBlank` prop for this form. Its default — every field
empty — is right for a row of free text and wrong for a row that starts on a
chosen platform: the trailing-blank-row effect decided the last row was filled,
appended another, and looped until Svelte gave up with
`effect_update_depth_exceeded`.

## Traffic and uptime

Both are on the dashboard overview, and both are the site's own.

**The visitor counter** is `hooks.server.ts` writing to `page_views`. No script
in the page, no cookie, no third party — which is the whole reason it exists:
an analytics script is personal data leaving the country in a request the
visitor never agreed to, which needs a consent banner, which costs more visitors
than the numbers are worth.

What is stored is a path, a locale, a referring host and a hash. There is no IP
address in the table and no user agent. The hash is salted with the auth secret
**and the date**, so it counts a person once a day and is worthless as a history
of anybody tomorrow. That is the honest limit of the measure: "visitors this
week" counts a returning reader again.

Counting happens after `resolve`, so a 404 is not a view, and covers both a
document request and the `__data.json` fetch a client-side navigation makes —
without the second, every visit would count as exactly one page. Requests
carrying `x-sveltekit-invalidated` are skipped: that is the client re-fetching
after a form action, not a page being read. Assets, `/api`, `/health` and the
dashboard are excluded by path, crawlers by user agent, and the insert is never
awaited — a counter must not be on the critical path of serving a page.

**`/health`** is what an outside monitor polls. It is public and
unauthenticated, because a monitor cannot sign in, so the body is written to be
worth nothing to anyone else: `status`, `database`, `uptime`, and nothing about
versions or hosts. It actually queries the database and answers **503** when
that fails — a process that is running but cannot reach MySQL serves an error
page to every visitor, and a check that only proves Node is alive would call
that healthy. The uptime figure on the dashboard is this process's own and
resets on every deploy; real uptime over weeks is something only an outside
observer can measure, which is what the endpoint is for.

## Out of scope for now

- Roles and permissions. There are three administrators and all three are
  trusted with everything; `requireUser` is the one place that changes when
  there is a fourth person who should read enquiries but not publish.
- Media library. Galleries and portraits are editable per project and per
  person; there is no screen that lists every uploaded file.
- Payments.

## Still needed

**Blocking a real launch:**

1. **Contact details** — `src/lib/site.ts` now carries `info@pulsedataet.com` and
   `https://pulsedataet.com`, both taken from the working SMTP account rather than
   from anyone's confirmation: check them. `phone` and `phoneHref` are still empty,
   and the footer renders a field only when it has a value.
2. **Amharic review** — every string in `messages/am.json` and every `*_am` column in
   `scripts/seed.ts` was drafted here and has not been reviewed by a native speaker.
   Key parity with `en.json` is enforced; accuracy is not.
3. **Spotless sign-off** — the case study is written from the company profile. It
   needs the client's permission, and the three "what changed" figures are honest
   claims about the system (`1` system, `0` re-entry steps, `24/7` support) rather
   than measured results. Replace them with real numbers once Spotless agrees them,
   or leave them: an invented percentage is the fastest way to lose a buyer who asks
   how it was measured.
4. **Imagery** — the ten case studies carry real screenshots. What is still
   missing is team photography: `/dashboard/team` takes a portrait per person,
   and the about page keeps showing monograms until all three have one.
5. **Production database** — `.env` points at a local MariaDB (`mysql://dev@localhost`)
   created for development. Two accounts exist on it: `surafel@pulsedata.test`,
   which the e2e suite signs in as, and `admin@pulsedataet.com`. **Rotate the
   latter's password before the site is public** — it was set from a chat
   message rather than chosen privately, so treat it as known.
6. **`ORIGIN` and `FILES_DIR`** — `ORIGIN` is `http://localhost:5173`, which
   adapter-node uses to accept form POSTs and the email templates use to build
   image and link URLs; both break on the real host until it is corrected.
   `FILES_DIR` is `.tempFiles` inside the project, so a redeploy would delete
   every upload.

**Decisions still open:**

- Whether any pricing figures are published, or the deployment models stay
  "contact us".
- Company social accounts. `SOCIAL` in `src/lib/site.ts` is still an empty
  array — it feeds the footer and the `sameAs` list in the home page's
  `Organization` block, which is what ties the site to those profiles for a
  search engine. Individual people's links are in the database and independent
  of it.
- An uptime monitor pointed at `/health`, and where its alerts go.
