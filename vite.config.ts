import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// English is unprefixed (`/about`), Amharic is prefixed (`/am/about`), which is
			// what paraglide's default `urlPatterns` already produce for a non-base locale —
			// so only the strategy needs stating. `url` first means a shared link always
			// opens in the language it was written in, whatever the reader's cookie says;
			// the cookie only decides where an unprefixed URL lands for a returning visitor.
			strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale']
		})
	]
});
