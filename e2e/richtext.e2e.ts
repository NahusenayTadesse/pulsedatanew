import { expect, test } from '@playwright/test';

/**
 * Stored HTML actually renders.
 *
 * This is the canary for a whole class of failure that only exists in the built
 * server. `renderRichText` is imported by every page that shows a body — every
 * article, every case study, both dashboard composers — so anything that stops
 * that module from loading takes the readable half of the site with it.
 *
 * It has happened once: the sanitiser needed jsdom, jsdom reaches for a JSON
 * file at runtime by relative path, and the bundler had inlined it somewhere
 * that path does not exist. Production answered `Cannot find module
 * '../data/patch.json'` on every one of those pages while the suite stayed
 * green, because it was running `vite preview`, which never bundles. The suite
 * runs the real server now (see `playwright.config.ts`), and this asserts the
 * pages it protects.
 */

test('an article renders its stored body', async ({ page }) => {
	const response = await page.goto('/blogs/why-erp-projects-stall');
	expect(response?.status(), 'a rich-text page must not 500').toBe(200);

	const article = page.locator('article, main').first();
	expect(await article.locator('p').count(), 'the body should have paragraphs').toBeGreaterThan(2);
	expect(await article.locator('h2, h3').count(), 'and its headings').toBeGreaterThan(0);
});

test('a case study renders its stored body', async ({ page }) => {
	const response = await page.goto('/projects/spotless-enterprise-erp');
	expect(response?.status()).toBe(200);
	expect(await page.locator('main p').count()).toBeGreaterThan(2);
});

test('the sanitiser is still doing its job', async ({ page }) => {
	/*
	 * Not a crafted payload — the seeded content is trusted. What is checked is
	 * that the output is sanitised at all: no `script`, no `style`, no inline
	 * handler and no `h1` inside a body, which is what `renderRichText` strips
	 * and what a swapped-out sanitiser could quietly stop stripping.
	 */
	await page.goto('/blogs/why-erp-projects-stall');

	// `.prose` is the wrapper the sanitised body is rendered into — scoped
	// deliberately, because the page's own `h1` title sits outside it and is
	// exactly what a body-level `h1` must not be confused with.
	const body = page.locator('.prose').first();
	await expect(body.locator('script')).toHaveCount(0);
	await expect(body.locator('style')).toHaveCount(0);
	await expect(body.locator('h1')).toHaveCount(0);
	expect(await body.locator('[onclick], [onerror], [onload]').count()).toBe(0);
});
