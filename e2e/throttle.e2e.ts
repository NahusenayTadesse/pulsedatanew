import { expect, test } from '@playwright/test';

/**
 * The login page must stop guessing.
 *
 * Until this existed the contact form had a flood check and the login form had
 * none — the wrong way round, since every account on this site can publish to
 * the public pages and read the enquiry inbox.
 *
 * The address is unique per run so a second run inside the fifteen-minute
 * window does not start already locked out, and so a real account is never the
 * one being locked.
 */
const address = () =>
	`throttle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@pulsedata.test`;

/**
 * adapter-node refuses a cross-site form POST, and Playwright's request context
 * sends no Origin of its own — so without this every post here is rejected
 * before the throttle is ever consulted, and the tests pass on the wrong error.
 */
const ORIGIN = { origin: 'http://localhost:4173' };

test('the sixth wrong password is refused without being checked', async ({ request }) => {
	const email = address();

	for (let attempt = 1; attempt <= 5; attempt++) {
		const response = await request.post('/login', {
			headers: ORIGIN,
			multipart: { email, password: `wrong-${attempt}` }
		});
		const body = await response.text();

		expect(body, `attempt ${attempt} should still be answered normally`).not.toContain(
			'Too many attempts'
		);
	}

	const blocked = await request.post('/login', {
		headers: ORIGIN,
		multipart: { email, password: 'wrong-6' }
	});
	expect(await blocked.text()).toContain('Too many attempts');
});

test('locking one address does not lock everybody else out', async ({ request }) => {
	/*
	 * The per-address counter and the per-IP counter are different limits, and
	 * a test suite runs every request from one address. If the two were confused
	 * — or the per-IP limit set as low as the per-address one — five bad guesses
	 * at a stranger's address would lock the real staff out of their own
	 * dashboard, which is a denial of service anyone on the internet could
	 * trigger.
	 */
	const victim = address();

	for (let attempt = 1; attempt <= 6; attempt++) {
		await request.post('/login', {
			headers: ORIGIN,
			multipart: { email: victim, password: `wrong-${attempt}` }
		});
	}

	const other = await request.post('/login', {
		headers: ORIGIN,
		multipart: { email: address(), password: 'also-wrong' }
	});

	const body = await other.text();
	expect(body).not.toContain('Too many attempts');
	// Still refused, just for the ordinary reason.
	expect(body).toContain('do not match an account');
});

test('the auth endpoint is limited too, not just the form', async ({ request }) => {
	/*
	 * `POST /api/auth/sign-in/email` is mounted and reachable. The form's
	 * throttle cannot see it — a SvelteKit action calls `signInEmail()` as a
	 * function, so nothing goes through Better Auth's HTTP handler — which is
	 * why rate limiting is configured there as well. Without this, an attacker
	 * skips the form and the throttle with it.
	 */
	const email = address();

	const codes: number[] = [];
	for (let attempt = 1; attempt <= 7; attempt++) {
		const response = await request.post('/api/auth/sign-in/email', {
			data: { email, password: `wrong-pass-${attempt}` },
			headers: { ...ORIGIN, 'content-type': 'application/json' }
		});
		codes.push(response.status());
	}

	/*
	 * Asserted as "reachable, and it stops" rather than by exact position.
	 *
	 * Better Auth counts per IP over a fifteen-minute window that outlives a
	 * test run, so a suite run twice in a row starts with part of the budget
	 * already spent — pinning the 401s to the first five attempts made the test
	 * pass or fail on how recently it had last been run. What matters is that
	 * every answer comes from the endpoint rather than a 404 page (the bug this
	 * was written for: with a mismatched ORIGIN it is not mounted at all), and
	 * that the endpoint refuses before the attempts run out.
	 */
	expect(codes.every((code) => code === 401 || code === 429)).toBe(true);
	expect(codes).toContain(429);
	expect(codes.at(-1)).toBe(429);
});
