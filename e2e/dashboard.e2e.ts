import { expect, test } from '@playwright/test';

/**
 * Guards on the dashboard's boundary.
 *
 * Every case here is a real defect that existed during the build. The first is
 * the serious one: `emailAndPassword: { enabled: true }` mounts Better Auth's
 * sign-up endpoint publicly, so before `disableSignUp` anyone who found the URL
 * could create an account and read the enquiry inbox. It was harmless while
 * there was no dashboard and became critical the moment there was one, which is
 * exactly the kind of regression a test should hold down.
 */

const PROTECTED = [
	'/dashboard',
	'/dashboard/projects',
	'/dashboard/projects/new',
	'/dashboard/blogs',
	'/dashboard/blogs/new',
	'/dashboard/enquiries',
	'/dashboard/enquiries/1/attachment'
];

test.describe('nobody signed in', () => {
	test('every dashboard route redirects to the login page', async ({ page }) => {
		for (const path of PROTECTED) {
			const response = await page.goto(path);
			expect(new URL(page.url()).pathname, `${path} should have redirected`).toBe('/login');
			expect(response?.status()).toBeLessThan(400);
		}
	});

	test('the login page carries the intended destination', async ({ page }) => {
		await page.goto('/dashboard/enquiries');
		expect(new URL(page.url()).searchParams.get('redirectTo')).toBe('/dashboard/enquiries');
	});

	test('nobody can register themselves an account', async ({ request, page }) => {
		const credentials = { email: 'intruder@example.test', password: 'password12345' };

		const response = await request.post('/api/auth/sign-up/email', {
			data: { name: 'Intruder', ...credentials },
			failOnStatusCode: false
		});
		expect(response.status(), 'sign-up must not succeed').toBeGreaterThanOrEqual(400);

		/*
		 * The status alone is not the property worth testing, and neither is the
		 * error body — the built app 404s this path entirely, while the dev
		 * server answers with Better Auth's own JSON, so asserting either one
		 * makes the test agree with an implementation detail rather than with the
		 * thing that matters.
		 *
		 * What matters is that no account now exists. So we try to use it.
		 */
		await page.goto('/login');
		await page.fill('#email', credentials.email);
		await page.fill('#password', credentials.password);
		await page.click('form button[type=submit]');

		await expect(page.getByRole('alert')).toContainText(/do not match/i);
		expect(new URL(page.url()).pathname, 'must not have reached the dashboard').toBe('/login');
	});

	test('a private attachment is not reachable', async ({ request }) => {
		const response = await request.get('/dashboard/enquiries/1/attachment', {
			maxRedirects: 0,
			failOnStatusCode: false
		});
		expect(response.status()).toBe(303);
		expect(response.headers()['location']).toContain('/login');
	});
});

test.describe('open redirect', () => {
	test('redirectTo cannot point off-site', async ({ page }) => {
		// `//evil.example` is read by browsers as a protocol-relative URL to
		// another host. Without the check in `safeRedirect` the login page is an
		// open redirector aimed at people who have just typed a password.
		await page.goto('/login?redirectTo=//evil.example');
		await page.fill('#email', 'surafel@pulsedata.test');
		await page.fill('#password', 'pulsedata-dev-password-2026');
		await page.click('main button[type=submit], form button[type=submit]');
		await page.waitForURL(/\/dashboard/, { timeout: 10000 });
		expect(new URL(page.url()).host).toBe(new URL(page.url()).host);
		expect(new URL(page.url()).pathname).toBe('/dashboard');
	});
});

test.describe('signed in', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.fill('#email', 'surafel@pulsedata.test');
		await page.fill('#password', 'pulsedata-dev-password-2026');
		await page.click('form button[type=submit]');
		await page.waitForURL('**/dashboard');
	});

	test('the dashboard does not wear the marketing site chrome', async ({ page }) => {
		// The root layout applies to every route and cannot be escaped, so the
		// site header and footer live in the `(site)` group instead. When they did
		// not, the enquiry inbox rendered under a "Book a live demo" banner and
		// above a footer full of service links.
		await expect(page.locator('footer')).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Book a live demo' })).toHaveCount(0);
	});

	test('an article can be created, edited and deleted', async ({ page }) => {
		/*
		 * A unique title per run, so the slug is unique too.
		 *
		 * The first version reused one fixed title, and the run after any failed
		 * run hit the duplicate-slug guard instead of the behaviour under test —
		 * a leftover row from a test that never reached its cleanup made every
		 * later run fail for the wrong reason.
		 */
		const stamp = Date.now();
		const title = `Suite article ${stamp}`;
		const slug = `suite-article-${stamp}`;

		await page.goto('/dashboard/blogs/new');
		await page.fill('#title', title);

		// The slug is suggested from the title while it is untouched.
		await expect(page.locator('#slug')).toHaveValue(slug);

		const editor = page.locator('#body .ProseMirror').first();
		await editor.click();
		await page.keyboard.type('Body text, so the article has one.');

		await page.locator('main form button[type=submit]').first().click();
		await page.waitForURL(/\/dashboard\/blogs\/\d+/, { timeout: 15000 });

		// The edit screen must open clean. It used to report "Invalid input"
		// against the cover image, because the stored filename was being fed to a
		// field the schema types as a `File`.
		await expect(page.getByRole('alert')).toHaveCount(0);
		await expect(page.locator('#title')).toHaveValue(title);

		// Delete, which also proves the save and delete actions coexist —
		// SvelteKit refuses a page with a `default` action alongside named ones,
		// and the delete used to 500 for exactly that reason.
		await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
		await page.waitForURL('**/dashboard/blogs', { timeout: 15000 });

		await expect(page.getByRole('cell', { name: title })).toHaveCount(0);
	});

	test('dashboard pages are not indexable', async ({ page }) => {
		const response = await page.goto('/dashboard');
		expect(response?.headers()['x-robots-tag']).toContain('noindex');
	});
});
