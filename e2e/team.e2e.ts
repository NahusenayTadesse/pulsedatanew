import { expect, test } from '@playwright/test';

/**
 * The team, and the rule that decides how it is drawn.
 *
 * The rule is the part worth testing: portraits appear only when *every*
 * published member has one, so a single upload changes nothing until the last
 * one lands. That is invisible from either end — the dashboard shows the photo
 * it just stored, and the about page shows initials — and looks exactly like a
 * broken upload to whoever is doing it.
 */

const signIn = async (page: import('@playwright/test').Page) => {
	await page.goto('/login');
	await page.fill('#email', 'surafel@pulsedata.test');
	await page.fill('#password', 'pulsedata-dev-password-2026');
	await page.click('main form button[type=submit], form button[type=submit]');
	await page.waitForURL('**/dashboard');
};

test('the team screen is behind the login', async ({ page }) => {
	await page.goto('/dashboard/team');
	expect(new URL(page.url()).pathname).toBe('/login');
});

test('the about page draws the published team', async ({ page }) => {
	await page.goto('/about');

	const cards = page.locator('section ul li:has(h3)');
	const names = await page.locator('section li h3').allInnerTexts();
	expect(names.length, 'the seeded team should be published').toBeGreaterThan(0);
	expect(cards.first()).toBeVisible();

	/*
	 * All or nothing, whichever way round the data happens to be.
	 *
	 * Asserting "no portraits" would fail the day someone uploads photographs
	 * for everybody, and asserting "portraits" fails today — so the test states
	 * the rule itself: the number of portraits is either zero or everybody.
	 */
	const portraits = await page.locator('section li img[src^="/files/"]').count();
	expect([0, names.length]).toContain(portraits);
});

test('a member can be created, edited and deleted', async ({ page }) => {
	await signIn(page);

	const name = `Suite Person ${Date.now()}`;

	await page.goto('/dashboard/team/new');
	await page.waitForSelector('input[name=name]');
	await page.fill('input[name=name]', name);

	// A link row that is not a real address must not save silently.
	await page.locator('input[placeholder="https://"]').first().fill('not-a-url');
	await page.locator('main form button[type=submit]').first().click();
	await expect(page.getByText(/complete web address/i).first()).toBeVisible();

	await page.locator('input[placeholder="https://"]').first().fill('https://example.com/profile');
	await page.locator('main form button[type=submit]').first().click();
	await page.waitForURL(/\/dashboard\/team\/\d+/, { timeout: 15000 });

	// The edit screen opens clean — no error against the photograph, which is a
	// `File` in the schema and a filename in the row.
	await expect(page.getByRole('alert')).toHaveCount(0);
	await expect(page.locator('input[name=name]')).toHaveValue(name);
	await expect(page.locator('input[placeholder="https://"]').first()).toHaveValue(
		'https://example.com/profile'
	);

	await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
	await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
	await page.waitForURL('**/dashboard/team', { timeout: 15000 });
	await expect(page.getByRole('cell', { name })).toHaveCount(0);
});
