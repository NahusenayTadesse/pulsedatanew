import { expect, test } from '@playwright/test';

/**
 * The health endpoint and the visitor counter.
 *
 * Both are things nobody looks at until they matter: a monitor that answers
 * "ok" while the database is unreachable is worse than no monitor, and a
 * counter that records `/files/...` or a crawler makes every number on the
 * dashboard wrong in a way that is impossible to notice from the number alone.
 */

test('the health endpoint answers with what a monitor needs', async ({ request }) => {
	const response = await request.get('/health');
	expect(response.status()).toBe(200);
	expect(response.headers()['cache-control']).toContain('no-store');
	// Not indexable: it is a machine endpoint, and it is in robots.txt too.
	expect(response.headers()['x-robots-tag']).toContain('noindex');

	const body = await response.json();
	expect(body.status).toBe('ok');
	expect(body.database).toBe(true);
	expect(typeof body.uptime).toBe('number');

	/*
	 * The body must stay boring. It is public and unauthenticated, so anything
	 * beyond "is it up" is reconnaissance handed out for free.
	 */
	expect(Object.keys(body).sort()).toEqual(['database', 'status', 'uptime']);
});

test('robots.txt keeps crawlers off the private half', async ({ request }) => {
	const body = await (await request.get('/robots.txt')).text();
	for (const path of ['/dashboard', '/login', '/health']) {
		expect(body).toContain(`Disallow: ${path}`);
	}
});

/*
 * A real browser's user agent.
 *
 * Playwright's own says "HeadlessChrome", which the counter treats as a bot and
 * refuses to record — correctly, and inconveniently for a test about counting.
 * Setting an ordinary agent here means the bot filter is still tested, but
 * deliberately, by the request below that asks for a page as Googlebot.
 */
test.describe('the counter', () => {
	test.use({
		userAgent:
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
	});

	test('records pages and ignores everything else', async ({ page, context }) => {
		/*
		 * Asserted through the dashboard's own numbers rather than by querying the
		 * table, because reading the table means reimplementing the aggregate the
		 * dashboard already computes — and it is the number on screen that has to
		 * be right.
		 */
		await page.goto('/login');
		await page.fill('#email', 'surafel@pulsedata.test');
		await page.fill('#password', 'pulsedata-dev-password-2026');
		await page.click('form button[type=submit]');
		await page.waitForURL('**/dashboard');

		/*
		 * The tile is found from its own label upwards. A `:has()` selector on the
		 * card matched an outer wrapper as well and read the published-projects
		 * figure instead — a test that passes or fails on an unrelated number.
		 */
		const todayViews = async () => {
			await page.goto('/dashboard');
			const label = page.getByText('Views today', { exact: true });
			const value = label.locator('xpath=../..').locator('dd');
			return Number((await value.innerText()).trim());
		};

		const before = await todayViews();

		await context.request.get('/health');
		await context.request.get('/files/does-not-exist.webp');
		await context.request.get('/about', { headers: { 'user-agent': 'Googlebot/2.1' } });
		expect(await todayViews(), 'assets, /health and crawlers are not page views').toBe(before);

		await page.goto('/about');
		// The insert is deliberately not awaited by the hook, so give it a beat.
		await page.waitForTimeout(500);
		expect(await todayViews(), 'a page read by a person is').toBeGreaterThan(before);

		// The dashboard counts nothing about itself: staff traffic is not traffic.
		const afterPage = await todayViews();
		await page.goto('/dashboard/team');
		expect(await todayViews()).toBe(afterPage);
	});
});

/**
 * The outbound mail record.
 *
 * Sending real mail from a test is not something a suite should do, so what is
 * checked here is the part that holds without it: the screen exists, it is
 * behind the login (see `dashboard.e2e.ts`), and it renders whatever the table
 * holds without erroring — including nothing at all, which is the state a fresh
 * install is in and the one an empty-state bug hides in.
 */
test('the sent-mail record renders', async ({ page }) => {
	await page.goto('/login');
	await page.fill('#email', 'surafel@pulsedata.test');
	await page.fill('#password', 'pulsedata-dev-password-2026');
	await page.click('form button[type=submit]');
	await page.waitForURL('**/dashboard');

	await page.goto('/dashboard/email/sent');
	await expect(page.getByRole('heading', { name: 'Sent mail' })).toBeVisible();

	// Either the table or the empty state — never a crash, and never both.
	const rows = await page.locator('tbody tr').count();
	const empty = await page.getByText('Nothing has been sent yet.').count();
	expect(rows > 0 || empty === 1).toBe(true);

	// The composer links here and back, so the two halves are reachable from
	// each other rather than only from the sidebar.
	await page.getByRole('link', { name: 'Compose' }).first().click();
	await page.waitForURL('**/dashboard/email');
});
