import { expect, test } from '@playwright/test';

/**
 * The language switch.
 *
 * This is tested because the way it broke was invisible to anyone testing it
 * casually. Clicking አማርኛ moved the address bar to `/am` and left the page in
 * English; a reload — the first thing anybody does when a control seems not to
 * have worked — then showed the Amharic, so the switch looked like it worked
 * and the bug survived. The cause: the locale is resolved on the server, and
 * paraglide's message functions are plain calls rather than stores, so a
 * client-side navigation changes the URL and nothing else.
 *
 * The assertion that matters is therefore not `toHaveURL` — that passed
 * throughout — but that the words and `<html lang>` changed with it.
 */
test('switching language changes the page, not just the URL', async ({ page }) => {
	await page.goto('/');

	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	const english = await page.locator('h1').first().innerText();

	await page.getByRole('link', { name: 'አማርኛ' }).first().click();

	await expect(page).toHaveURL(/\/am\/?$/);
	// No reload between the click and these: the page that came back is Amharic.
	await expect(page.locator('html')).toHaveAttribute('lang', 'am');
	await expect(page.locator('h1').first()).not.toHaveText(english);
});

test('switching back keeps the page and its query string', async ({ page }) => {
	await page.goto('/am/projects?q=erp');

	await page.getByRole('link', { name: 'English' }).first().click();

	// The same page in the other language, not the home page — and a filtered
	// list stays filtered across the switch.
	await expect(page).toHaveURL(/\/projects\?q=erp$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
