import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			/*
			 * Every internal link on this site goes through paraglide's
			 * `localizeHref`, which already returns a resolved, locale-correct app
			 * path — that is the whole point of it, and it is what makes
			 * `/am/projects` work. This rule cannot see that, so it reports each
			 * one, including inside vendored shadcn components we do not edit.
			 * Wrapping several dozen call sites in `resolve(... as Pathname)` to
			 * satisfy it would add a cast per link and change nothing at runtime.
			 */
			'svelte/no-navigation-without-resolve': 'off',

			/*
			 * `const { coverImage: _x, ...rest } = row` is how a field is omitted
			 * from an object, and the discarded binding is the point of it. Without
			 * `ignoreRestSiblings` the idiom is unusable and the alternative is
			 * building the object key by key.
			 */
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	}
);
