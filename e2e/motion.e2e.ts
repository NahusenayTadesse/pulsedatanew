import { expect, test, type Browser } from '@playwright/test';

/**
 * Guards on the motion system.
 *
 * Every case here is a regression that actually happened while this was being
 * built, and all of them fail the same way: content the reader cannot see. A
 * decoration that breaks should degrade to a plain page, never to a blank one.
 *
 * Contexts are created explicitly rather than through describe-level
 * `test.use({ reducedMotion })`. These assertions are entirely about which
 * media query is in force, so the emulation is stated in the test body where it
 * can be read next to the expectation — inheriting it from an enclosing block
 * made it possible to be wrong about which mode a failing test had actually run
 * under, which is the one thing this file must not be ambiguous about.
 */

async function open(browser: Browser, reducedMotion: 'reduce' | 'no-preference') {
	const context = await browser.newContext({
		viewport: { width: 1280, height: 720 },
		reducedMotion
	});
	return { context, page: await context.newPage() };
}

test('below-fold content starts hidden, and none of it is stranded', async ({ browser }) => {
	const { context, page } = await open(browser, 'no-preference');

	await page.goto('/');
	await page.waitForTimeout(400);

	// If this is ever zero the reveal system has silently become a no-op, and
	// the assertion below would pass while proving nothing.
	const pendingAtRest = await page.evaluate(
		() => document.querySelectorAll('.reveal-init:not(.reveal-in)').length
	);
	expect(pendingAtRest, 'elements waiting to reveal below the fold').toBeGreaterThan(0);

	/*
	 * The jump is the point. An IntersectionObserver reports threshold
	 * crossings only, so everything between the top and the bottom goes from
	 * below the fold to above it without ever being computed as intersecting —
	 * no callback is delivered, and before the scroll sweep in
	 * `$lib/actions/reveal.ts` those elements stayed at opacity 0 permanently.
	 */
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.waitForTimeout(900);

	const stranded = await page.evaluate(() =>
		[...document.querySelectorAll('.reveal-init')]
			.filter((el) => getComputedStyle(el).opacity === '0')
			.map((el) => el.className.slice(0, 60))
	);
	expect(stranded, 'elements left invisible after a jump scroll').toEqual([]);

	await context.close();
});

test('reduced motion never hides anything, and stops the ambient layer', async ({ browser }) => {
	const { context, page } = await open(browser, 'reduce');

	await page.goto('/');
	await page.waitForTimeout(400);

	expect(
		await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
		'the emulation did not take effect, so this test proves nothing'
	).toBe(true);

	// Not "hidden and then instantly shown" — never hidden at all. The action
	// checks the preference before it touches an element.
	expect(await page.evaluate(() => document.querySelectorAll('.reveal-init').length)).toBe(0);

	expect(
		await page.evaluate(() => {
			const el = document.querySelector('.ambient');
			return el ? getComputedStyle(el).display : 'missing';
		})
	).toBe('none');

	await context.close();
});

test('the page renders in full without javascript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();

	await page.goto('/');

	// Sections far down the page, each behind a reveal when scripting is on.
	await expect(page.locator('main')).toContainText('Workflow Approvals');
	await expect(page.locator('main')).toContainText('SaaS subscription');

	await context.close();
});

test('counting figures keep their non-numeric parts', async ({ browser }) => {
	const { context, page } = await open(browser, 'no-preference');

	await page.goto('/projects/spotless-enterprise-erp');
	const figures = page.locator('#outcomes + dl dt');
	await figures.first().scrollIntoViewIfNeeded();

	// "24/7" must animate the 24 and keep the "/7". An outcome value is written
	// as prose, and the counter must not push the copy toward bare integers.
	await expect(figures.nth(2)).toHaveText('24/7', { timeout: 5000 });

	await context.close();
});
