import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const rm of [undefined, 'reduce', 'no-preference']) {
	const ctx = await b.newContext({
		viewport: { width: 1280, height: 720 },
		...(rm ? { reducedMotion: rm } : {})
	});
	const p = await ctx.newPage();
	await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
	await p.waitForTimeout(500);
	const r = await p.evaluate(() => ({
		mqReduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
		revealInit: document.querySelectorAll('.reveal-init').length,
		revealPending: document.querySelectorAll('.reveal-init:not(.reveal-in)').length,
		ambient: (() => {
			const e = document.querySelector('.ambient');
			return e ? getComputedStyle(e).display : 'missing';
		})(),
		bodyH: document.body.scrollHeight,
		vh: innerHeight
	}));
	console.log(`reducedMotion=${rm ?? '(default)'}:`, JSON.stringify(r));
	await ctx.close();
}
await b.close();
