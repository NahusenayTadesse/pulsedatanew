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
    markdown.ts              marked + DOMPurify; the only source of `@html` on the site
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
- `npm run test:e2e` — 12 guards pass against the production build: four on
  motion, eight on the dashboard boundary (auth redirects, no self-registration,
  no open redirect via `redirectTo`, private attachments unreachable, dashboard
  not indexable, and a full create/edit/delete round trip).
- Scrolling the full home page costs ~2% CPU; the ambient blur composites rather
  than repainting per frame.
- All 5 pages × 2 locales + both detail templates: no horizontal overflow and no
  console errors at 390 / 768 / 1440 px.
- Contact form: validation messages fire per-locale; a valid submit writes the row,
  stores the attachment, and lowercases the email.
- Attachments land in `FILES_DIR/private` and return 404 through `/files` by every
  encoding tried; path traversal is refused. Public files serve with `nosniff` and a
  download-forcing `Content-Disposition` for anything not an image or PDF.

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
used. `renderRichText` in `src/lib/server/richtext.ts` sanitises with DOMPurify
on the way out, and it is the only source of anything handed to `{@html}`.
`scripts/seed.ts` still authors in markdown and converts on write, because a
thousand-word case study as HTML string literals would be unreadable in a diff.

## Out of scope for now

- Roles and permissions. There are three administrators and all three are
  trusted with everything; `requireUser` is the one place that changes when
  there is a fourth person who should read enquiries but not publish.
- Media library, gallery editing (the `project_images` table is written by the
  seed but has no dashboard screen yet).
- Payments.

## Still needed

**Blocking a real launch:**

1. **Contact details** — `src/lib/site.ts` has empty strings for `email`, `phone` and
   `phoneHref`, and `SITE_URL` is a guess. The footer and contact page render a field
   only when it has a value, so the site is currently honest about not publishing
   them rather than showing a placeholder — but the primary CTA has no destination
   beyond the form until the email is filled in.
2. **Amharic review** — every string in `messages/am.json` and every `*_am` column in
   `scripts/seed.ts` was drafted here and has not been reviewed by a native speaker.
   Key parity with `en.json` is enforced; accuracy is not.
3. **Spotless sign-off** — the case study is written from the company profile. It
   needs the client's permission, and the three "what changed" figures are honest
   claims about the system (`1` system, `0` re-entry steps, `24/7` support) rather
   than measured results. Replace them with real numbers once Spotless agrees them,
   or leave them: an invented percentage is the fastest way to lose a buyer who asks
   how it was measured.
4. **Imagery** — no project cover, gallery or team photographs have been supplied, so
   those slots render as empty bordered frames and initials. `FileUpload` and
   `/files` are wired and tested; the images just need to exist.
5. **Production database** — `.env` points at a local MariaDB (`mysql://dev@localhost`)
   created for development.

**Decisions still open:**

- Whether any pricing figures are published, or the deployment models stay
  "contact us".
- Social links (`SOCIAL` in `src/lib/site.ts` is an empty array).
