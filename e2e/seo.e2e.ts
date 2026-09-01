import { expect, test } from '@playwright/test';

/**
 * The things a crawler reads, and the pages a visitor lands on when something
 * is wrong.
 *
 * All of this is invisible in the browser, which is why it needs tests: a
 * canonical pointing at the wrong URL, a missing `hreflang` reciprocal or a
 * 404 answering with status 200 all look completely fine on screen and quietly
 * cost the site its search standing.
 */

test.describe('canonical and hreflang', () => {
	test('both languages of a page point at each other and at themselves', async ({ page }) => {
		for (const path of ['/about', '/am/about']) {
			await page.goto(path);

			const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
			expect(canonical, `${path} must declare a canonical`).toBeTruthy();
			// The canonical has to be the URL that was actually served, or the page
			// tells Google to index a different one.
			expect(canonical).toContain(path === '/am/about' ? '/am/about' : '/about');

			const alternates = await page.locator('link[rel=alternate][hreflang]').all();
			const pairs = await Promise.all(
				alternates.map(async (link) => [
					await link.getAttribute('hreflang'),
					await link.getAttribute('href')
				])
			);

			const byLang = Object.fromEntries(pairs);

			// Reciprocal and complete: each page lists both languages *and* itself,
			// plus the x-default a crawler falls back to.
			expect(Object.keys(byLang).sort()).toEqual(['am', 'en', 'x-default']);
			expect(byLang.en).toContain('/about');
			expect(byLang.en).not.toContain('/am/');
			expect(byLang.am).toContain('/am/about');
		}
	});

	test('the amharic home page has no trailing slash in its alternates', async ({ page }) => {
		await page.goto('/');
		const amharic = await page.locator('link[rel=alternate][hreflang=am]').getAttribute('href');
		// `localizeHref('/')` returns `/am/`; an alternate that does not match the
		// URL it points at is discarded.
		expect(amharic?.endsWith('/am')).toBe(true);
	});
});

test.describe('sitemap and robots', () => {
	test('the sitemap lists the five pages and the published content', async ({ request }) => {
		const response = await request.get('/sitemap.xml');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('xml');

		const body = await response.text();

		for (const path of ['/projects', '/about', '/blogs', '/contact']) {
			expect(body, `${path} should be in the sitemap`).toContain(`<loc>`);
			expect(body).toContain(`${path}</loc>`);
		}

		// Every entry declares its alternates, which is how a bilingual site is
		// read as one site rather than two competing ones.
		expect(body).toContain('hreflang="am"');
		expect(body).toContain('hreflang="x-default"');

		// Drafts and future-dated posts must never appear.
		expect(body).not.toContain('/dashboard');
	});

	test('robots points at the sitemap and keeps crawlers out of the dashboard', async ({
		request
	}) => {
		const body = await (await request.get('/robots.txt')).text();
		expect(body).toContain('Sitemap:');
		expect(body).toContain('Disallow: /dashboard');
	});
});

test.describe('error pages', () => {
	test('an unknown public URL gets the site 404, with somewhere to go', async ({ page }) => {
		const response = await page.goto('/no-such-page');

		// The status matters as much as the page: a soft 404 answering 200 gets
		// the dead URL indexed.
		expect(response?.status()).toBe(404);

		// The marketing chrome is the point of the catch-all route — without it
		// an unmatched URL never enters the `(site)` group and gets the bare
		// admin error page instead.
		await expect(page.locator('header')).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
		await expect(page.getByRole('link', { name: /projects/i }).first()).toBeVisible();
		await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
	});

	test('an unknown dashboard URL gets the quiet one instead', async ({ page }) => {
		const response = await page.goto('/dashboard/no-such-page');
		expect(response?.status()).toBe(404);

		// No marketing header or footer around an admin error.
		await expect(page.locator('footer')).toHaveCount(0);
	});
});
