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
- **Copy** — home and about prose lives in `messages/{en,am}.json`. Posts,
  projects and enquiries live in the database. `en.json` and `am.json` must keep
  identical key sets and identical `{placeholders}`.
- **Forms** — superforms + zod 4, built with the `$lib/formComponents` set.
  Validation messages come from paraglide so a form filled in Amharic fails in
  Amharic, which is why the schemas are functions rather than constants.
- **Uploads** — `saveUploadedFile` returns a filename; store the string. Public
  files serve from `/files/:name`; anything private goes to `FILES_DIR/private`,
  which that route cannot address.
- **`@html`** — only in the two article templates, only fed by
  `renderMarkdown` in `$lib/server/markdown`. Keep it that way.
- **Motion** — CSS plus one IntersectionObserver, no animation library. Add a
  scroll reveal with `use:reveal` from `$lib/actions/reveal` (and `stagger(i)`
  for lists); use the `.enter` class with `--enter` for above-the-fold content,
  which must animate on first paint. Never write a hidden state into the
  stylesheet: the action applies it in JavaScript so that a no-JS page renders
  complete. `e2e/motion.e2e.ts` guards this — run it after touching any of it.
- **Dashboard** — `/dashboard`, guarded by `requireUser`. Bodies are HTML from
  the WYSIWYG editor and are sanitised by `renderRichText` on read. Bilingual
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

Useful commands: `npm run db:push`, `npm run db:seed`, `npm run check`,
`npm run test:e2e`.
