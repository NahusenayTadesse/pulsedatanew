/**
 * A one-off outbound proposal, sent through the site's own mail layout.
 *
 * Written as a script rather than sent from the dashboard composer because the
 * body is a considered document — a table of module coverage and a PDF
 * attachment — not something anyone should be retyping into a rich-text box.
 * It still goes through `renderEmail` and `sendMail`, so it is the same
 * envelope, the same house style and the same transport as every other message
 * the site sends. See the note in `mail/templates.ts`: no markup lives in a
 * route, and none lives here either beyond the body itself.
 *
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/proposal.ts          # preview only
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/proposal.ts --send   # actually sends
 *
 * Preview writes the rendered HTML and the plain-text alternative to
 * `.proposal-preview/`, which is gitignored. Nothing is sent without `--send`.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

/*
 * The live origin, not whatever `.env` holds.
 *
 * `renderEmail` builds the header logo's URL from `ORIGIN`, and a development
 * `.env` points at localhost — which would send a proposal whose letterhead is
 * a broken image. Set before the modules that read it are imported.
 */
process.env.ORIGIN = 'https://pulsedataet.com';
/*
 * A display name on the envelope. The address is unchanged — it is the account
 * that authenticates — but "Pulsedata Solutions" in an inbox list is worth more
 * than a bare mailbox on a first approach to a stranger.
 */
process.env.MAIL_FROM ??= 'Pulsedata Solutions <info@pulsedataet.com>';

const { renderEmail } = await import('../src/lib/server/mail/layout');
const { sendMail } = await import('../src/lib/server/mail/transport');

/*
 * `--to-self` sends the identical message to the company mailbox instead of the
 * prospect. It exists because SMTP leaves no trace in webmail's Sent folder, so
 * "did that actually go?" has no answer inside the mailbox — this puts one
 * there, through the same transport, without mailing the prospect twice.
 */
const TO = process.argv.includes('--to-self') ? 'info@pulsedataet.com' : 'tsions.ttree@gmail.com';
const ATTACHMENT = path.resolve('.proposal-preview/Pulsedata-Solutions-Company-Profile.pdf');

/** Their nine areas, in their order, against what we deliver for each. */
const coverage: [string, string][] = [
	[
		'Finance &amp; Accounting',
		'Chart of accounts, bank ledger, expenses, customer invoicing and the management reports drawn from them.'
	],
	[
		'HR &amp; Payroll',
		'Employee lifecycle, contracts and documents, a leave accrual and expiry engine, and payroll on the Ethiopian calendar that posts straight to the ledger.'
	],
	[
		'Inventory &amp; Store Management',
		'Stock on hand by store, issue and return, transfers, adjustments and damaged-stock tracking.'
	],
	[
		'Procurement &amp; Purchasing',
		'Supplier records, purchase requests, purchase orders and receipt against them, with approval before commitment.'
	],
	[
		'Sales &amp; Customer Management',
		'Customers, contracts, quotations and orders, order history and invoicing.'
	],
	[
		'Production &amp; Workshop Management',
		'Jobs on the floor: materials issued and consumed, recipes and bills of materials, output recorded against the job.'
	],
	[
		'Project &amp; Job Costing',
		'Labour, materials and expenses gathered against a job, site or project, so the cost of a piece of work is one figure rather than three reports.'
	],
	[
		'Reporting &amp; Management Dashboard',
		'Live management views over the same data the floor is entering, scoped to what each role may see.'
	],
	[
		'Workflow &amp; Approval Management',
		'Maker-checker approvals on the entries that matter, role-based permissions and an audit log of who changed what.'
	]
];

const rows = coverage
	.map(([area, how]) => `<tr><td width="34%"><strong>${area}</strong></td><td>${how}</td></tr>`)
	.join('\n');

const bodyHtml = `
<p>Good day,</p>

<p>We are writing in response to your search for an ERP system covering both office
operations and workshop or production activity. Pulsedata Solutions is an Addis Ababa
software company that builds and deploys exactly that: a modular ERP suite on our own
codebase, delivered and supported by the people who wrote it.</p>

<p>Your nine areas map onto the suite one for one:</p>

<table>
<tr><th width="34%">Your requirement</th><th>What we deliver</th></tr>
${rows}
</table>

<h3>Why a company with a workshop should talk to us</h3>

<ul>
<li><strong>One system, not four.</strong> Production, stores, procurement, payroll and the
ledger sit in the same database, so a material issued on the floor is already a cost on the
job and already a movement in stock. No monthly re-entry, no reconciliation between
systems.</li>
<li><strong>Our own codebase.</strong> Nothing is locked behind a vendor, so a change your
operation genuinely needs is a change we can make, and there is no per-seat licence stack
underneath ours.</li>
<li><strong>Light enough to run anywhere.</strong> The system is engineered to hold
performance on modest hardware: in practice a mid-range machine and an ordinary connection
are enough, which matters when power and bandwidth are not guaranteed.</li>
<li><strong>Built for here.</strong> English and Amharic throughout, and the Ethiopian
calendar where the business actually uses it, with payroll periods and leave accrual
included.</li>
<li><strong>Two ways to own it.</strong> A perpetual licence with lifelong support, or an
all-inclusive SaaS subscription on managed cloud infrastructure. Both come with 24/7
support, staff training, security updates and routine backups.</li>
</ul>

<h3>Relevant experience</h3>

<p>Our closest reference is <strong>Spotless</strong>, a contract-workforce and facility
management business we have run on a full deployment since 2025: HR and the employee
lifecycle, a leave accrual and expiry engine, Ethiopian-calendar payroll, client contracts
and site billing, supply leasing and stock, a bank ledger and expenses, with maker-checker
approvals, role-based permissions and an audit log across more than fifty screens. Payroll
posts to the ledger with no re-entry step in between.</p>

<p>Alongside it we have delivered inventory, supplier and order systems for
<strong>Lalo Bakery Solutions</strong> (food manufacturing and distribution, including a
recipe library and damaged-stock tracking) and <strong>Lalo Fixtec</strong> (industrial
tools and equipment distribution), casework and disbursement for the
<strong>Shimeles Abera Foundation</strong>, and operations or corporate systems for Yebehir
Events, Fahem General Trading, Golla Design Group and Lalo Group. Ten systems are live.</p>

<h3>What we suggest next</h3>

<p>We would like to visit your office and workshop for a short discovery session, see how
the work is actually done, and follow it with a live demonstration of the suite against your
own processes. A scoped proposal (module list, deployment model, timeline and a fixed
figure) follows that visit rather than preceding it, because a number quoted before anyone
has walked the floor is a number nobody should trust.</p>

<p>Our company profile is attached, and further detail on the work described above is on our
website. We can be reached on <strong>0947 340 602</strong> or at
<a href="mailto:info@pulsedataet.com">info@pulsedataet.com</a> at any time.</p>
`.trim();

const { html, text } = renderEmail({
	eyebrow: 'ERP proposal',
	heading: 'An ERP suite for your office and workshop',
	preheader:
		'Company profile, our coverage of all nine areas you listed, and where each one is already running.',
	bodyHtml,
	button: { label: 'See our work', href: 'https://pulsedataet.com/projects' },
	meta: [
		{ label: 'Company', value: 'Pulsedata Solutions · Addis Ababa, Ethiopia' },
		{ label: 'Email', value: 'info@pulsedataet.com', href: 'mailto:info@pulsedataet.com' },
		{ label: 'Phone', value: '0947 340 602', href: 'tel:+251947340602' },
		{ label: 'Website', value: 'pulsedataet.com', href: 'https://pulsedataet.com' }
	],
	/*
	 * Signed by the company, not a person.
	 *
	 * A first approach to a stranger is from Pulsedata Solutions; whoever picks
	 * up the reply is an internal matter, and a name here would commit that
	 * person to owning the thread.
	 */
	note: 'Pulsedata Solutions',
	// The layout appends the site's own link under these, so the domain is
	// deliberately not repeated here.
	footer: ['Addis Ababa, Ethiopia', 'info@pulsedataet.com', '0947 340 602']
});

const subject = 'ERP proposal · Pulsedata Solutions (office & workshop operations)';
const outDir = path.resolve('.proposal-preview');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'proposal.html'), html);
fs.writeFileSync(path.join(outDir, 'proposal.txt'), text);

if (!process.argv.includes('--send')) {
	console.log(`Preview only. Nothing sent.\n  ${outDir}/proposal.html\n  ${outDir}/proposal.txt`);
	console.log(`\nTo: ${TO}\nSubject: ${subject}`);
	console.log(`Attachment: ${ATTACHMENT} (${fs.existsSync(ATTACHMENT) ? 'found' : 'MISSING'})`);
	process.exit(0);
}

if (!fs.existsSync(ATTACHMENT)) {
	throw new Error(`The company profile is not at ${ATTACHMENT}`);
}

await sendMail({
	to: TO,
	subject,
	html,
	text,
	replyTo: 'info@pulsedataet.com',
	/*
	 * A blind copy to `MAIL_ARCHIVE`. SMTP leaves no trace in webmail's Sent
	 * folder — that folder is written by webmail, not by the mail server — so
	 * without this the only record of an outbound proposal is this file.
	 */
	archive: true,
	kind: 'proposal',
	attachments: [{ filename: 'Pulsedata-Solutions-Company-Profile.pdf', path: ATTACHMENT }]
});

console.log(`Sent to ${TO}.`);
process.exit(0);
