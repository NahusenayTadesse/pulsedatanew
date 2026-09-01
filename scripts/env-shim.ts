/**
 * A stand-in for `$env/dynamic/private`, for scripts run outside Vite.
 *
 * `$env/*` is resolved by SvelteKit's Vite plugin and does not exist to `tsx`,
 * so anything under `src/lib/server` that reads configuration — the mail
 * layout and transport, both of which a one-off script has good reason to
 * reuse rather than copy — cannot be imported without this. `scripts/tsconfig.json`
 * maps the specifier here; the application build never sees it.
 */
import 'dotenv/config';

export const env: Record<string, string | undefined> = process.env;
