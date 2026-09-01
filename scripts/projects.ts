/**
 * The case studies, as data.
 *
 * Kept out of `seed.ts` because it is content rather than machinery: this file
 * is the one a person edits to correct a claim or add a project, and the seed
 * script beside it is the one nobody should need to touch.
 *
 * Bodies are markdown here and stored as HTML — see the note in `seed.ts`. The
 * gallery filenames point at `static/projects/<slug>/`, so the screenshots are
 * versioned with the repository rather than living in `FILES_DIR`, which is a
 * volume that can be replaced.
 */

export type ProjectSeed = {
	slug: string;
	name: string;
	nameAm: string;
	client: string;
	clientAm: string;
	summary: string;
	summaryAm: string;
	industry: string;
	industryAm: string;
	year: string;
	/** Omitted where the site is internal, or the domain is not currently answering. */
	websiteUrl?: string;
	featured: boolean;
	coverImage: string;
	coverImageAlt: string;
	coverImageAltAm: string;
	body: string;
	bodyAm: string;
	services: { label: string; labelAm: string }[];
	outcomes: { value: string; label: string; labelAm: string }[];
	images: { image: string; alt: string; altAm: string; caption: string; captionAm: string }[];
};

/**
 * The stored filename of a seeded screenshot.
 *
 * Gallery images are uploads, not build assets: they live in `FILES_DIR` under
 * the UUID names `saveUploadedFile` produces, and the database holds the bare
 * filename that `assetUrl` turns into `/files/<name>`. That is what makes them
 * replaceable from the dashboard — a file the build serves out of `static/`
 * cannot be, because nothing in the admin interface can write to it.
 *
 * The names are UUIDs because `/files/[name=filename]` matches only that shape.
 * The matcher's strictness is what stops the route addressing a subdirectory or
 * reaching into `FILES_DIR/private`, so it is not something to relax for the
 * sake of readable filenames.
 *
 * This table is the record of what `scripts/migrate-project-images.ts` wrote.
 * Re-seeding points the rows back at these same files; it does not re-upload
 * them, and it will not recreate them if `FILES_DIR` is lost. **`FILES_DIR` has
 * to be deployed and backed up like a database** — these images are no more
 * recoverable from the repository than a contact-form attachment is.
 */
const STORED: Record<string, Record<string, string>> = {
	'fahem-general-trading': {
		about: '314bc2de-1244-4a4a-af62-0841826dd5a7.webp',
		coffee: '36f3da06-1989-4619-99ae-f7ea4358be29.webp',
		contact: '80dbab77-4f37-47c7-85a7-45b807c5c508.webp',
		home: '445d7bd5-2ae8-49ef-9196-ef967be0a31d.webp',
		ventures: '5cdb1f11-81ec-4f8b-a31a-9e40554f5d4b.webp'
	},
	'fro-services': {
		'delete-account': '2fb65e3d-feb2-46f9-af69-5c0ffd53333a.webp',
		home: '51afba27-c06c-4564-a946-0b689b3ea935.webp',
		join: 'a2ffb2dc-1a1e-451c-ae57-310c219dd4ee.webp',
		providers: '5d1cde4e-1955-4a1e-99c3-3f0638c8896d.webp',
		safety: '84e4c50e-2151-43a6-9b33-6fdc6ec51949.webp',
		support: 'c12ca38d-d784-4e37-9c8b-c3f832764582.webp'
	},
	'golla-design-group': {
		about: '5501d08e-9616-4a2b-be2d-3aea450e6756.webp',
		blogs: '8e5b3945-cc0d-4706-9a50-e939773afd6f.webp',
		contact: '28b3d5d9-e197-4feb-96c9-a4a927562047.webp',
		home: 'fce0a34f-603e-467d-9277-4685c7d7efce.webp',
		portfolio: '7d3c149e-8c8a-4bc1-b025-26ab1ae38256.webp',
		services: 'd049e234-7993-48c7-bf3d-b19d77d67fab.webp'
	},
	'lalo-bakery-solutions': {
		about: '4a7df797-59b3-499e-ba98-43145677d77c.webp',
		contact: '26180265-5464-491a-b493-e6d9fc61252c.webp',
		home: '226e707f-7d0e-4f98-82fc-faff1fcc04fc.webp',
		recipes: '60efc448-ed40-413c-a096-b8bdc68885c5.webp',
		shop: '19a40c60-1944-4003-a5bd-c30fd720a423.webp'
	},
	'lalo-fixtec': {
		about: 'd67e272c-f1bd-4eb4-8a82-6f75ed71d575.webp',
		contact: '0db11fc7-1345-4ede-aa2d-cd8f02c96d0f.webp',
		home: '7c276de1-1e05-4853-bac5-4eac871bbf2c.webp',
		industries: 'bc8a12d7-34b9-4832-8587-ddf9c32970ee.webp',
		'new-arrival': '5b1b849c-c25e-4d40-9f30-73d981cde612.webp',
		shop: '99e3e340-166c-4666-8831-39bfeddbd1f3.webp'
	},
	'lalo-group': {
		about: '6b85e91c-69a4-4464-8f41-db5ac03586d9.webp',
		contact: '830001e6-7fd9-4b1d-ba81-66e10d17074e.webp',
		home: 'af3075ea-5541-477b-9927-ced79d7dbfc2.webp',
		subsidiaries: '9724bc2c-15cc-4e58-90ba-e8454443f340.webp'
	},
	'shimeles-abera-foundation': {
		about: 'c8c31d52-afbf-4548-9ad9-63d58fbfa363.webp',
		apply: '628bbb1d-1f8e-4907-9abe-5f836c1ea4eb.webp',
		blog: '9bd3cbec-2e52-4480-a4dd-84350950a456.webp',
		contact: '7af052d8-dc52-4e51-b8c6-3b66eaba0103.webp',
		donate: '72ae8345-7325-4f3b-9059-e37cbdba07ef.webp',
		home: 'ecedf2ec-fbd2-4bf9-bda9-254d49a4728f.webp',
		volunteer: '928ffd23-b316-475c-82b9-33be82a5c5f7.webp'
	},
	'spotless-enterprise-erp': {
		customers: '703cd9b1-e112-4fae-bc4d-f70ace1a6c0c.webp',
		employees: '02aa6861-5eeb-409f-876e-69594e45748c.webp',
		finance: 'a341c2af-dbc6-4ec2-a417-44333ed7c930.webp',
		leases: 'cc7ac531-a181-4ee6-8d52-6adc51b0c009.webp',
		requests: '496878ab-126e-47d5-b5aa-2836ab2ac8aa.webp',
		roles: '9c193be1-6c00-4b1c-8600-d467d0c514c3.webp',
		sites: 'fda169bc-1ebf-451e-a467-d5a9a4faa35a.webp',
		supplies: '2281e5a2-4585-4eff-983e-ad436a5f7651.webp'
	},
	'spotless-general-trading': {
		about: '22cc658f-0ec6-4338-aad8-ac824fbf755a.webp',
		contact: '144d8161-5a3c-4638-95d4-f0a09736efd2.webp',
		faq: 'f2ae000c-94dd-48be-9a2b-7e84143b0760.webp',
		home: 'e5173973-ebce-4861-8896-3376702a98b5.webp',
		news: '52902f76-ac19-4f61-b79b-b82e699d6510.webp',
		services: '29980579-7cd8-4256-a30b-5836843486e0.webp',
		testimonials: '718c0755-066a-4fe7-8743-6c8dafd34441.webp'
	},
	'yebehir-events': {
		about: 'f245c6c0-5ce6-45bf-9e49-96c2c41fcc59.webp',
		events: '84621d0f-bebf-4e50-89d6-151f2fb69330.webp',
		home: '039235c5-95f4-47db-bf11-b2edcbcd00d8.webp',
		quote: '3089fe6b-2cc3-455c-8d45-f5c99609a480.webp',
		services: '1314d129-677e-4678-a1fe-2b58aa1f4045.webp',
		venues: '71d5c9a7-386b-4b05-a1c4-d34af20bb1b8.webp'
	}
};

const shot = (slug: string, name: string) => {
	const file = STORED[slug]?.[name];
	if (!file) throw new Error(`No stored file for ${slug}/${name}`);
	return file;
};

export const projectSeeds: ProjectSeed[] = [
	// -------------------------------------------------------------------------
	{
		slug: 'spotless-enterprise-erp',
		name: 'Spotless Enterprise ERP',
		nameAm: 'የስፖትለስ የድርጅት ኢአርፒ',
		client: 'Spotless',
		clientAm: 'ስፖትለስ',
		summary:
			'A complete operations system for a contract workforce and facility management business: staff records, Ethiopian-calendar payroll, client contracts, site billing, supply leasing and a maker-checker approval queue over all of it.',
		summaryAm:
			'ለኮንትራት የሰው ኃይልና የተቋም አስተዳደር ንግድ የተሠራ ሙሉ የሥራ ማስኬጃ ሥርዓት፦ የሠራተኛ መዝገብ፣ በኢትዮጵያ ዘመን አቆጣጠር የሚሠራ ደመወዝ፣ የደንበኛ ውሎች፣ የሳይት ክፍያ፣ የቁሳቁስ ኪራይና በሁሉም ላይ የሚሠራ የሁለት ደረጃ ማጽደቅ ወረፋ።',
		industry: 'Facility management & contract workforce',
		industryAm: 'የተቋም አስተዳደርና የኮንትራት የሰው ኃይል',
		year: '2025–present',
		featured: true,
		coverImage: shot('spotless-enterprise-erp', 'employees'),
		coverImageAlt: 'The Spotless employee register, listing staff by department and site',
		coverImageAltAm: 'የስፖትለስ የሠራተኞች መዝገብ፤ ሠራተኞችን በክፍልና በሳይት ያሳያል',
		body: `## The business, and why spreadsheets ran out

Spotless places cleaning and security staff on client sites across Addis Ababa and manages the supplies those sites consume. Both halves are people-heavy and site-heavy: dozens of contract staff, each tied to a site, a department, an employment status and a salary that moves with bonuses, overtime, deductions and pension.

Every one of those facts used to live in a spreadsheet, and every one of them was also a *decision* somebody had to remember: which leave days had expired, which site had already been billed, whether the mop stock at Piassa was on hand or out on a site.

## What the system does

**People.** A full employee register — identity documents, guarantors, family, work history, education, position, department and site — with the whole lifecycle from hire to termination. Attendance is recorded per site and per period.

**Leave that actually reconciles.** Annual leave is *accrued*, not typed in. Each employee earns a grant on their employment anniversary, sized by a service-length bracket, and each grant carries its own expiry. Days are always spent oldest-grant-first, so the days closest to expiring are used before newer ones. The balance ledger settles every change as the difference between what a leave cost before and what it costs after — which is what stops an already-approved leave from being charged twice when somebody edits its dates.

**Payroll on the Ethiopian calendar.** Salary runs per month and per site, with overtime types, deduction types, pension classes, income tax bands and VAT/withholding rules all configurable rather than coded. Payslips, bank transfer lists and receipts come out the other end.

**Money.** A signed bank ledger: every movement is tied to the transaction that caused it, positive in and negative out, and the account's running balance moves by exactly that amount inside the same database transaction. The history of a transaction always sums to what the balance says.

**Clients and sites.** Customers, the sites they contract for, the contracts themselves, monthly payments, penalties, discounts, commission and renewals — with payment requests and a full payment history per contract.

**Supplies as assets, not stock.** The company owns its supplies whether they sit in the store or at a client site, so a lease is a location change, not a sale. The system tracks four figures — on hand, reserved, leased out and total owned — and moves a lease through pending → approved → issued → partially returned → returned → closed, writing the movement rows, the running total and the event log together in one transaction.

**Approval on everything.** A maker-checker queue covers every entity that carries approval fields, from a new employee to a payment request. One registry, one queue, one set of actions — the entity is data, and a single route serves all of them.

**Permissions.** Role-based, with per-user overrides. A super admin is not a flag but a derivation: someone holding every permission that exists. Add a new permission to the system and anyone who does not also receive it stops being a super admin automatically.

## The point

Nothing here is novel on its own. What makes it work is that the same event is recorded once: a leave approval moves the ledger, a lease issue moves the stock, a payment moves the bank balance. Nobody reconciles anything at month end, because there is only one set of books to reconcile against.`,
		bodyAm: `## ንግዱ፣ እና ሉሆች ለምን እንዳልበቁ

ስፖትለስ በአዲስ አበባ በደንበኞች ሳይቶች ላይ የጽዳትና የጥበቃ ሠራተኞችን ያሰማራል፤ እነዚያ ሳይቶች የሚጠቀሙትንም ቁሳቁስ ያስተዳድራል። ሁለቱም ወገኖች በሰውና በሳይት የተሞሉ ናቸው፦ በደርዘን የሚቆጠሩ የኮንትራት ሠራተኞች፣ እያንዳንዳቸው ከሳይት፣ ከክፍል፣ ከቅጥር ሁኔታና በጉርሻ፣ በትርፍ ሰዓት፣ በተቀናሽና በጡረታ ከሚለዋወጥ ደመወዝ ጋር የተሳሰሩ።

ከእነዚህ እውነታዎች እያንዳንዱ በሉህ ውስጥ ይኖር ነበር፤ እያንዳንዱም ሰው ሊያስታውሰው የሚገባ *ውሳኔ* ነበር፦ የትኞቹ የዕረፍት ቀናት እንዳለፉ፣ የትኛው ሳይት አስቀድሞ እንደተከፈለበት፣ በፒያሳ ያለው መጥረጊያ በመጋዘን እንዳለ ወይስ በሳይት ላይ እንደወጣ።

## ሥርዓቱ ምን ያደርጋል

**ሰዎች።** ሙሉ የሠራተኛ መዝገብ — የመታወቂያ ሰነዶች፣ ዋስ፣ ቤተሰብ፣ የሥራ ልምድ፣ የትምህርት ደረጃ፣ የሥራ መደብ፣ ክፍልና ሳይት — ከቅጥር እስከ ስንብት ያለውን ሙሉ ሂደት ጨምሮ። መገኘት በሳይትና በጊዜ ክፍለ ጊዜ ይመዘገባል።

**በእውነት የሚስተካከል ዕረፍት።** ዓመታዊ ዕረፍት የሚተየብ ሳይሆን *የሚጠራቀም* ነው። እያንዳንዱ ሠራተኛ በቅጥር ዓመቱ በዓል ላይ በአገልግሎት ዘመን ደረጃ የሚወሰን ድርሻ ያገኛል፤ እያንዳንዱ ድርሻም የራሱ የማብቂያ ቀን አለው። ቀናት ሁልጊዜ ከቀድሞው ድርሻ ጀምሮ ይወጣሉ፤ ስለዚህ ለማለቅ የቀረቡት ቀናት ከአዲሶቹ በፊት ይጠቀማሉ። የሒሳብ መዝገቡ እያንዳንዱን ለውጥ ዕረፍቱ ከዚህ በፊት ያስከፈለውና አሁን የሚያስከፍለው ልዩነት አድርጎ ይመዘግባል — ይህም አንድ የጸደቀ ዕረፍት ቀኑ ሲስተካከል ሁለት ጊዜ እንዳይቆጠር የሚያደርገው ነው።

**በኢትዮጵያ ዘመን አቆጣጠር የሚሠራ ደመወዝ።** ደመወዝ በወርና በሳይት ይሠራል፤ የትርፍ ሰዓት ዓይነቶች፣ የተቀናሽ ዓይነቶች፣ የጡረታ ደረጃዎች፣ የገቢ ግብር ደረጃዎችና የተጨማሪ እሴት ታክስ ደንቦች በሙሉ በኮድ ሳይሆን በማዋቀር ይስተካከላሉ። የደመወዝ ወረቀት፣ የባንክ ዝውውር ዝርዝርና ደረሰኞች ከዚያ ይወጣሉ።

**ገንዘብ።** ምልክት ያለው የባንክ መዝገብ፦ እያንዳንዱ እንቅስቃሴ ካስከተለው ግብይት ጋር የተሳሰረ ነው፤ ገቢ አዎንታዊ ወጪ አሉታዊ፤ የሒሳቡ ቀሪም በዚያው የመረጃ ቋት ግብይት ውስጥ በትክክል በዚያ መጠን ይንቀሳቀሳል።

**ደንበኞችና ሳይቶች።** ደንበኞች፣ የሚዋዋሉባቸው ሳይቶች፣ ውሎቹ ራሳቸው፣ ወርሃዊ ክፍያዎች፣ ቅጣቶች፣ ቅናሾች፣ ኮሚሽንና ዕድሳቶች — ከክፍያ ጥያቄዎችና ከሙሉ የክፍያ ታሪክ ጋር።

**ቁሳቁስ እንደ ንብረት እንጂ እንደ ሸቀጥ አይደለም።** ኩባንያው ቁሳቁሱን በመጋዘንም ይሁን በደንበኛ ሳይት ላይ ባለቤቱ ነው፤ ስለዚህ ኪራይ ሽያጭ ሳይሆን የቦታ ለውጥ ነው። ሥርዓቱ አራት ቁጥሮችን ይከታተላል — በእጅ ያለ፣ የተያዘ፣ የተከራየና ጠቅላላ ባለቤትነት።

**በሁሉም ላይ ማጽደቅ።** የማጽደቅ መስኮች ያሏቸውን ሁሉንም ነገሮች የሚሸፍን የሁለት ደረጃ ወረፋ፤ ከአዲስ ሠራተኛ እስከ ክፍያ ጥያቄ። አንድ መዝገብ፣ አንድ ወረፋ፣ አንድ የድርጊት ስብስብ።

**ፈቃዶች።** በሚና ላይ የተመሠረቱ፣ በተጠቃሚ ደረጃ ሊሻሻሉ የሚችሉ። ሱፐር አድሚን ምልክት ሳይሆን ውጤት ነው፦ ያሉትን ፈቃዶች በሙሉ የያዘ ሰው።

## ዋናው ነጥብ

ከዚህ ውስጥ ብቻውን አዲስ የሆነ ነገር የለም። የሚያሠራው ተመሳሳዩ ክስተት አንድ ጊዜ ብቻ መመዝገቡ ነው፦ የዕረፍት ማጽደቅ መዝገቡን ያንቀሳቅሳል፣ የኪራይ ማስረከብ ክምችቱን ያንቀሳቅሳል፣ ክፍያ የባንክ ቀሪውን ያንቀሳቅሳል። በወር መጨረሻ ማንም ምንም አያስታርቅም፤ የሚስተካከልበት አንድ መዝገብ ብቻ ስላለ።`,
		services: [
			{ label: 'HR & employee lifecycle', labelAm: 'የሰው ኃይልና የሠራተኛ ሂደት' },
			{ label: 'Leave accrual & expiry engine', labelAm: 'የዕረፍት ጥራዝና ማብቂያ ሞተር' },
			{ label: 'Ethiopian-calendar payroll', labelAm: 'በኢትዮጵያ ዘመን አቆጣጠር ደመወዝ' },
			{ label: 'Contracts & site billing', labelAm: 'ውሎችና የሳይት ክፍያ' },
			{ label: 'Supply leasing & stock', labelAm: 'የቁሳቁስ ኪራይና ክምችት' },
			{ label: 'Bank ledger & expenses', labelAm: 'የባንክ መዝገብና ወጪዎች' },
			{ label: 'Maker-checker approvals', labelAm: 'የሁለት ደረጃ ማጽደቅ' },
			{ label: 'Roles, permissions & audit log', labelAm: 'ሚናዎች፣ ፈቃዶችና የኦዲት መዝገብ' }
		],
		outcomes: [
			{ value: '1', label: 'System of record, not four', labelAm: 'አንድ የመዝገብ ሥርዓት እንጂ አራት አይደለም' },
			{
				value: '0',
				label: 'Re-entry steps between payroll and the bank ledger',
				labelAm: 'በደመወዝና በባንክ መዝገብ መካከል ድጋሚ ማስገባት የለም'
			},
			{
				value: '50+',
				label: 'Screens under one permission model',
				labelAm: 'ከ50 በላይ ገጾች በአንድ የፈቃድ ሞዴል ሥር'
			}
		],
		images: [
			{
				image: shot('spotless-enterprise-erp', 'employees'),
				alt: 'Employee register listing staff by department, site and employment status',
				altAm: 'ሠራተኞችን በክፍል፣ በሳይትና በቅጥር ሁኔታ የሚዘረዝር መዝገብ',
				caption:
					'The staff register: filterable, sortable, exportable, and the entry point to each employee’s leave, salary and documents.',
				captionAm: 'የሠራተኞች መዝገብ፦ የሚጣራ፣ የሚደረደር፣ የሚወጣ፤ ወደ እያንዳንዱ ሠራተኛ ዕረፍት፣ ደመወዝና ሰነዶች መግቢያ።'
			},
			{
				image: shot('spotless-enterprise-erp', 'finance'),
				alt: 'Transaction list showing payments in Ethiopian-calendar dates',
				altAm: 'ክፍያዎችን በኢትዮጵያ ዘመን አቆጣጠር የሚያሳይ የግብይት ዝርዝር',
				caption:
					'Every payment carries its bank, its method, its receipt and the person who recorded it. Dates are Ethiopian throughout.',
				captionAm: 'እያንዳንዱ ክፍያ ባንኩን፣ ዘዴውን፣ ደረሰኙንና የመዘገበውን ሰው ይይዛል። ቀኖቹ በሙሉ ኢትዮጵያዊ ናቸው።'
			},
			{
				image: shot('spotless-enterprise-erp', 'supplies'),
				alt: 'Supplies inventory with stock levels',
				altAm: 'የክምችት መጠን ያለው የቁሳቁስ ዝርዝር',
				caption:
					'Supplies are tracked as owned assets — on hand, reserved, leased out and total owned are four different numbers.',
				captionAm: 'ቁሳቁሶች እንደ ንብረት ይከታተላሉ — በእጅ ያለ፣ የተያዘ፣ የተከራየና ጠቅላላ ባለቤትነት አራት የተለያዩ ቁጥሮች ናቸው።'
			},
			{
				image: shot('spotless-enterprise-erp', 'leases'),
				alt: 'Supply lease records and their status',
				altAm: 'የቁሳቁስ ኪራይ መዝገቦችና ሁኔታቸው',
				caption:
					'A lease moves pending → approved → issued → returned → closed, and each step writes stock movement and an event log together.',
				captionAm:
					'ኪራይ በተጠባቂ → የጸደቀ → የተሰጠ → የተመለሰ → የተዘጋ ይንቀሳቀሳል፤ እያንዳንዱ ደረጃም የክምችት እንቅስቃሴንና የክስተት መዝገብን አብሮ ይጽፋል።'
			},
			{
				image: shot('spotless-enterprise-erp', 'requests'),
				alt: 'Pending requests queue awaiting approval',
				altAm: 'ማጽደቅ የሚጠብቁ ጥያቄዎች ወረፋ',
				caption:
					'One approval queue serves every entity in the system, because the entity is data rather than a hand-written screen per table.',
				captionAm:
					'አንድ የማጽደቅ ወረፋ በሥርዓቱ ውስጥ ያሉትን ሁሉንም ነገሮች ያገለግላል፤ ምክንያቱም ነገሩ በእጅ የተጻፈ ገጽ ሳይሆን መረጃ ስለሆነ።'
			},
			{
				image: shot('spotless-enterprise-erp', 'customers'),
				alt: 'Customer list with contract status',
				altAm: 'የውል ሁኔታ ያለው የደንበኞች ዝርዝር',
				caption: 'Clients, the sites they contract for, and the contracts underneath them.',
				captionAm: 'ደንበኞች፣ የሚዋዋሉባቸው ሳይቶች፣ እና ከሥራቸው ያሉት ውሎች።'
			},
			{
				image: shot('spotless-enterprise-erp', 'sites'),
				alt: 'Client site list',
				altAm: 'የደንበኛ ሳይቶች ዝርዝር',
				caption:
					'Each site links its staff, its contract, its monthly payments and the supplies leased to it.',
				captionAm: 'እያንዳንዱ ሳይት ሠራተኞቹን፣ ውሉን፣ ወርሃዊ ክፍያዎቹንና የተከራየውን ቁሳቁስ ያገናኛል።'
			},
			{
				image: shot('spotless-enterprise-erp', 'roles'),
				alt: 'Role and permission configuration',
				altAm: 'የሚናና የፈቃድ ማዋቀሪያ',
				caption:
					'Roles are built from a permission table, with per-user overrides. Super admin is derived, never a flag.',
				captionAm: 'ሚናዎች ከፈቃድ ሠንጠረዥ ይገነባሉ፤ በተጠቃሚ ደረጃም ሊሻሻሉ ይችላሉ። ሱፐር አድሚን የሚመነጭ እንጂ ምልክት አይደለም።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'shimeles-abera-foundation',
		name: 'Shimeles Abera Foundation',
		nameAm: 'ሽመልስ አበራ ፋውንዴሽን',
		client: 'Shimeles Abera Foundation',
		clientAm: 'ሽመልስ አበራ ፋውንዴሽን',
		summary:
			'A nonprofit operations system where the public website is one view of the data and the dashboard is where the data lives — built so that nothing a programme manager might want to change next year requires a developer.',
		summaryAm:
			'የሕዝብ ድረ-ገጹ የመረጃው አንድ መስኮት ብቻ የሆነበት፣ መረጃው ራሱ በዳሽቦርዱ ውስጥ የሚኖርበት የበጎ አድራጎት ሥራ ማስኬጃ ሥርዓት — የፕሮግራም ሥራ አስኪያጅ በሚቀጥለው ዓመት ሊለውጠው የሚፈልገው ነገር ሁሉ ገንቢ እንዳያስፈልገው ተደርጎ የተሠራ።',
		industry: 'Nonprofit & social programmes',
		industryAm: 'በጎ አድራጎትና ማኅበራዊ ፕሮግራሞች',
		year: '2025',
		websiteUrl: 'https://shimelesaberafoundation.org',
		featured: true,
		coverImage: shot('shimeles-abera-foundation', 'home'),
		coverImageAlt: 'The Shimeles Abera Foundation home page',
		coverImageAltAm: 'የሽመልስ አበራ ፋውንዴሽን መነሻ ገጽ',
		body: `## The governing rule

One rule shaped every decision in this build:

> Nothing a non-technical Foundation staff member might reasonably want to change is hardcoded.

Not the programme pillars and their colours. Not the page copy. Not the navigation, the footer, the phone numbers, the bank details or the social links. Not the workflow status labels or the order they appear in. Not the questions on a form, or their validation rules. Not the regions, the volunteer skills, the professions, the time slots, or the answers in the help panel. Not even the interface strings, which live in a translations table.

The test applied to every screen: *if the programme manager wants to change this next year with no developer involved, can they?*

## What the Foundation actually does

It walks with families in Addis Ababa through medical crisis, old age, mental strain and the long work of getting a child through school. That means intake, assessment, casework and disbursement — and a public face that has to ask strangers for money and for time.

## The system

**A dynamic form engine.** Applications for assistance are not hand-written pages. A form is a row in \`form_definitions\` with its questions in \`form_fields\`, and one renderer draws it, validates it and files the submission. Adding a new intake form is configuration.

**Beneficiary casework.** Households, beneficiaries, assessed needs by category, case notes, documents and disbursements — with payment methods and accounts behind them.

**Donations.** Campaigns, donors, one-off gifts, recurring pledges, in-kind donations with itemised contents and photographs, and a reconciliation log against the external giving platforms.

**Volunteering, with a safeguarding gate.** This one is deliberately *not* form-builder driven. Volunteering ends in someone being placed with vulnerable people, so the questions the gate depends on are code rather than editable rows — a coordinator deleting the references section would be disabling a control, not editing copy. A volunteer cannot reach an approved stage while the safeguarding checklist is incomplete, and that check lives in the single transition function every path goes through, precisely so a direct POST cannot skip it.

**Pillar-scoped access.** A caseworker assigned to one programme pillar must not reach another pillar's case notes or documents — not through the interface, not by changing a URL, not by posting directly. The scope is folded into the query rather than hidden in the UI.

**The rest.** Blog, media library, testimonials, contact routing by subject and office, newsletter, an audit log over everything, and a cached impact-metrics layer for the public figures.

## Why it matters

Most nonprofit websites are built once and then slowly become wrong, because every change costs a developer the organisation cannot afford. This one was built so the Foundation owns its own content, its own forms and its own workflow — and the developer is only needed when the *shape* of the work changes, not its wording.`,
		bodyAm: `## መሪው ደንብ

በዚህ ግንባታ ውስጥ እያንዳንዱን ውሳኔ የቀረጸ አንድ ደንብ አለ፦

> ቴክኒካዊ ያልሆነ የፋውንዴሽኑ ሠራተኛ ሊለውጠው የሚፈልገው ማንኛውም ነገር በኮድ ውስጥ አይጻፍም።

የፕሮግራም ዓምዶቹና ቀለሞቻቸው አይደሉም። የገጽ ጽሑፉ አይደለም። ማውጫው፣ ግርጌው፣ ስልክ ቁጥሮቹ፣ የባንክ ዝርዝሮቹና የማኅበራዊ ሚዲያ አገናኞቹ አይደሉም። የሥራ ፍሰት ሁኔታ ስሞችና የሚታዩበት ቅደም ተከተል አይደለም። የቅጽ ጥያቄዎችና የማረጋገጫ ደንቦቻቸው አይደሉም። ክልሎቹ፣ የበጎ ፈቃደኞች ክህሎቶች፣ ሙያዎች፣ የጊዜ ክፍተቶች ወይም በእገዛ ክፍሉ ውስጥ ያሉት መልሶች አይደሉም። የተጠቃሚ በይነገጽ ጽሑፎቹ እንኳ በትርጉም ሠንጠረዥ ውስጥ ይኖራሉ።

በእያንዳንዱ ገጽ ላይ የተተገበረው ፈተና፦ *የፕሮግራም ሥራ አስኪያጁ ይህን በሚቀጥለው ዓመት ያለ ገንቢ ሊለውጠው ይችላል?*

## ፋውንዴሽኑ በእውነት ምን ይሠራል

በአዲስ አበባ ውስጥ ካሉ ቤተሰቦች ጋር በሕክምና ቀውስ፣ በእርጅና፣ በአእምሮ ጫናና ልጅን በትምህርት የማሳለፍ ረጅም ሥራ ውስጥ አብሮ ይራመዳል። ይህም መቀበልን፣ ግምገማን፣ የጉዳይ ሥራንና ክፍያን ያካትታል — እንዲሁም ከማያውቋቸው ሰዎች ገንዘብና ጊዜ መጠየቅ ያለበት የሕዝብ ገጽታን።

## ሥርዓቱ

**ተለዋዋጭ የቅጽ ሞተር።** የእርዳታ ማመልከቻዎች በእጅ የተጻፉ ገጾች አይደሉም። አንድ ቅጽ በ\`form_definitions\` ውስጥ ያለ ረድፍ ሲሆን ጥያቄዎቹ በ\`form_fields\` ውስጥ ናቸው፤ አንድ አሳሽ ይስለዋል፣ ያረጋግጠዋል፣ ማመልከቻውንም ይመዘግባል። አዲስ የመቀበያ ቅጽ መጨመር ማዋቀር ነው።

**የተጠቃሚ ጉዳይ አያያዝ።** ቤተሰቦች፣ ተጠቃሚዎች፣ በምድብ የተገመገሙ ፍላጎቶች፣ የጉዳይ ማስታወሻዎች፣ ሰነዶችና ክፍያዎች — ከክፍያ ዘዴዎችና ሒሳቦች ጋር።

**ልገሳ።** ዘመቻዎች፣ ለጋሾች፣ አንድ ጊዜ ስጦታዎች፣ ተደጋጋሚ ቃል ኪዳኖች፣ በዝርዝርና በፎቶ የተያዙ የዓይነት ልገሳዎች፣ እና ከውጫዊ የመስጫ መድረኮች ጋር የሚስተካከል መዝገብ።

**በጎ ፈቃደኝነት፣ ከጥበቃ በር ጋር።** ይህኛው ሆን ተብሎ በቅጽ ገንቢው *አይመራም*። በጎ ፈቃደኝነት አንድ ሰው ተጋላጭ ከሆኑ ሰዎች ጋር በመመደብ ስለሚያልቅ፣ በሩ የሚመሠረትባቸው ጥያቄዎች ሊስተካከሉ የሚችሉ ረድፎች ሳይሆኑ ኮድ ናቸው። የጥበቃ ዝርዝሩ ሳይሟላ በጎ ፈቃደኛ ወደ ጸደቀ ደረጃ መድረስ አይችልም።

**በዓምድ የተገደበ ተደራሽነት።** ለአንድ የፕሮግራም ዓምድ የተመደበ የጉዳይ ሠራተኛ የሌላውን ዓምድ ማስታወሻዎችና ሰነዶች ማግኘት የለበትም — በበይነገጽም ይሁን አድራሻ በመቀየር ወይም በቀጥታ በመላክ። ገደቡ በተጠቃሚ በይነገጽ ውስጥ ተደብቆ ሳይሆን በጥያቄው ውስጥ ተጣብቆ ነው።

**የቀረው።** ብሎግ፣ የሚዲያ ቤተ-መጻሕፍት፣ ምስክርነቶች፣ በርዕስና በቢሮ የሚመራ የመገናኛ መስመር፣ ጋዜጣ፣ በሁሉም ላይ የኦዲት መዝገብ፣ እና ለሕዝብ አኃዞች የተከማቸ የተጽዕኖ መለኪያ ንብርብር።

## ለምን አስፈላጊ ሆነ

አብዛኞቹ የበጎ አድራጎት ድረ-ገጾች አንድ ጊዜ ተሠርተው ቀስ በቀስ ስሕተት ይሆናሉ፤ ምክንያቱም እያንዳንዱ ለውጥ ድርጅቱ ሊሸከመው የማይችል የገንቢ ወጪ ስላለው። ይህኛው ግን ፋውንዴሽኑ የራሱን ይዘት፣ የራሱን ቅጾችና የራሱን የሥራ ፍሰት እንዲይዝ ተደርጎ ተሠርቷል።`,
		services: [
			{ label: 'Dynamic form engine', labelAm: 'ተለዋዋጭ የቅጽ ሞተር' },
			{ label: 'Beneficiary casework & disbursement', labelAm: 'የተጠቃሚ ጉዳይና ክፍያ' },
			{ label: 'Donations & recurring pledges', labelAm: 'ልገሳና ተደጋጋሚ ቃል ኪዳን' },
			{ label: 'Volunteer safeguarding workflow', labelAm: 'የበጎ ፈቃደኛ ጥበቃ ሂደት' },
			{ label: 'Pillar-scoped access control', labelAm: 'በዓምድ የተገደበ ተደራሽነት' },
			{ label: 'Fully editable public site', labelAm: 'ሙሉ በሙሉ ሊስተካከል የሚችል የሕዝብ ገጽ' }
		],
		outcomes: [
			{
				value: '62',
				label: 'Tables behind one editable system',
				labelAm: 'በአንድ ሊስተካከል በሚችል ሥርዓት ሥር 62 ሠንጠረዦች'
			},
			{
				value: '0',
				label: 'Hardcoded strings a manager might want to change',
				labelAm: 'ሥራ አስኪያጅ ሊለውጠው የሚፈልገው በኮድ የተጻፈ ጽሑፍ የለም'
			},
			{
				value: '2',
				label: 'Server-side rules that cannot be bypassed',
				labelAm: 'ሊታለፉ የማይችሉ ሁለት የአገልጋይ ደንቦች'
			}
		],
		images: [
			{
				image: shot('shimeles-abera-foundation', 'home'),
				alt: 'Foundation home page with its mission statement and programme imagery',
				altAm: 'የፋውንዴሽኑ መነሻ ገጽ ከተልእኮ መግለጫውና ከፕሮግራም ምስሎቹ ጋር',
				caption:
					'Every word, image and colour on this page is a database row the Foundation edits itself.',
				captionAm: 'በዚህ ገጽ ላይ ያለ እያንዳንዱ ቃል፣ ምስልና ቀለም ፋውንዴሽኑ ራሱ የሚያስተካክለው የመረጃ ቋት ረድፍ ነው።'
			},
			{
				image: shot('shimeles-abera-foundation', 'apply'),
				alt: 'The assistance application form',
				altAm: 'የእርዳታ ማመልከቻ ቅጽ',
				caption:
					'Drawn by the dynamic form engine: the questions and their validation rules are configuration, not code.',
				captionAm: 'በተለዋዋጭ የቅጽ ሞተር የተሳለ፦ ጥያቄዎቹና የማረጋገጫ ደንቦቻቸው ኮድ ሳይሆኑ ማዋቀር ናቸው።'
			},
			{
				image: shot('shimeles-abera-foundation', 'volunteer'),
				alt: 'The volunteer application with skills and availability',
				altAm: 'ከክህሎትና ከጊዜ ተገኝነት ጋር የበጎ ፈቃደኛ ማመልከቻ',
				caption:
					'The one form deliberately written in code — because a safeguarding gate depends on its questions.',
				captionAm: 'ሆን ተብሎ በኮድ የተጻፈው ብቸኛው ቅጽ — የጥበቃ በሩ በጥያቄዎቹ ላይ ስለሚመሠረት።'
			},
			{
				image: shot('shimeles-abera-foundation', 'donate'),
				alt: 'The donation page with campaigns and giving options',
				altAm: 'ከዘመቻዎችና ከመስጫ አማራጮች ጋር የልገሳ ገጽ',
				caption:
					'Campaigns, one-off gifts, recurring pledges and in-kind donations, reconciled against external platforms.',
				captionAm: 'ዘመቻዎች፣ አንድ ጊዜ ስጦታዎች፣ ተደጋጋሚ ቃል ኪዳኖችና የዓይነት ልገሳዎች፤ ከውጫዊ መድረኮች ጋር የሚስተካከሉ።'
			},
			{
				image: shot('shimeles-abera-foundation', 'about'),
				alt: 'The about page describing the Foundation’s programme pillars',
				altAm: 'የፋውንዴሽኑን የፕሮግራም ዓምዶች የሚገልጽ የስለእኛ ገጽ',
				caption:
					'Programme pillars — names, descriptions, icons and colours — are rows, so a new programme is not a deploy.',
				captionAm: 'የፕሮግራም ዓምዶች — ስሞች፣ መግለጫዎች፣ አዶዎችና ቀለሞች — ረድፎች ናቸው፤ ስለዚህ አዲስ ፕሮግራም ማሰማራት አይጠይቅም።'
			},
			{
				image: shot('shimeles-abera-foundation', 'blog'),
				alt: 'The Foundation’s blog index',
				altAm: 'የፋውንዴሽኑ የብሎግ ማውጫ',
				caption: 'Stories and updates, written from the dashboard in both languages.',
				captionAm: 'ታሪኮችና ዝመናዎች፤ ከዳሽቦርዱ በሁለቱም ቋንቋዎች የሚጻፉ።'
			},
			{
				image: shot('shimeles-abera-foundation', 'contact'),
				alt: 'The contact page with offices and subjects',
				altAm: 'ከቢሮዎችና ከርዕሶች ጋር የመገናኛ ገጽ',
				caption:
					'Messages route by subject to the right office — and the subjects and offices are both editable.',
				captionAm: 'መልእክቶች በርዕስ ወደ ትክክለኛው ቢሮ ይመራሉ — ርዕሶቹና ቢሮዎቹም ሁለቱም ሊስተካከሉ ይችላሉ።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'spotless-general-trading',
		name: 'Spotless General Trading',
		nameAm: 'ስፖትለስ ጀነራል ትሬዲንግ',
		client: 'Spotless General Trading P.L.C.',
		clientAm: 'ስፖትለስ ጀነራል ትሬዲንግ ኃ.የተ.የግ.ማ.',
		summary:
			'The public face of the same company whose operations we run: a corporate site that has to win contracts from corporations, NGOs and embassies, built alongside the ERP that delivers on them.',
		summaryAm:
			'ሥራውን የምናንቀሳቅሰው ተመሳሳይ ኩባንያ የሕዝብ ገጽታ፦ ከድርጅቶች፣ ከመንግሥታዊ ካልሆኑ ድርጅቶችና ከኤምባሲዎች ውል ማግኘት ያለበት የድርጅት ገጽ፤ ውሉን ከሚያስፈጽመው ኢአርፒ ጎን ለጎን የተሠራ።',
		industry: 'Facility services & general trading',
		industryAm: 'የተቋም አገልግሎትና ጠቅላላ ንግድ',
		year: '2025',
		websiteUrl: 'https://spotlesset.com',
		featured: true,
		coverImage: shot('spotless-general-trading', 'home'),
		coverImageAlt: 'The Spotless General Trading home page over an Addis Ababa skyline',
		coverImageAltAm: 'በአዲስ አበባ ሰማይ መስመር ላይ የስፖትለስ ጀነራል ትሬዲንግ መነሻ ገጽ',
		body: `## Two systems for one company

Spotless is the client behind our largest ERP deployment. This is the other half of that engagement: the public site.

They are deliberately different pieces of work. The ERP is where the company's staff, contracts, payroll and supplies live — nobody outside the business ever sees it. This site has one job, and it is a sales job: convince a procurement officer at a bank, an embassy or an NGO that a facility services contract is safe in this company's hands.

## What a facility services buyer is actually checking

Not the design. They are checking whether the company is real, how long it has been doing this, how many people it can put on a site tomorrow, and whether anyone like them has used it before.

So the site leads with the things that answer those questions:

- **The figures**, animated into view rather than buried in prose — 62+ clients, 300+ current employees, 15+ years. For a contract that depends on staffing a site reliably, headcount *is* the pitch.
- **Four service lines**, each given its own section rather than compressed into a paragraph: site cleaning, security personnel, training and consultancy, and property management with materials supply.
- **The client list by type** — corporations, NGOs and embassies. In this market, who already trusts you is the strongest thing you can say.
- **Named leadership and team**, with roles and responsibilities. A buyer signing a multi-site contract wants to know who is accountable.

## The structure

Seven pages, each with a job: home, about, services, news, testimonials, FAQ and contact.

The **FAQ** is the section most facility services sites skip and the one that does the most work here. It is grouped — general company questions, then service-related ones — and it answers the awkward, practical things a buyer would otherwise have to phone about: whether small and large contracts are both handled, whether packages can be tailored, how multi-site work is scaled and managed.

**News** and **testimonials** exist because a services company's credibility decays if its site looks abandoned. Both are content the company keeps current.

## Why it looks the way it does

A corporate blue over photography of the Addis skyline, a serif wordmark, and a lot of air. That is a deliberate distance from the ERP's dense operational interface — the same client, two audiences, and no reason the software their staff use all day should look like the page a buyer sees once before signing.`,
		bodyAm: `## ለአንድ ኩባንያ ሁለት ሥርዓቶች

ስፖትለስ ከትልቁ የኢአርፒ ማሰማራታችን ጀርባ ያለው ደንበኛ ነው። ይህ ደግሞ የዚያ ተሳትፎ ሌላኛው ግማሽ ነው፦ የሕዝብ ገጹ።

ሆን ተብለው የተለያዩ ሥራዎች ናቸው። ኢአርፒው የኩባንያው ሠራተኞች፣ ውሎች፣ ደመወዝና ቁሳቁስ የሚኖሩበት ነው — ከንግዱ ውጪ ያለ ማንም አያየውም። ይህ ገጽ ግን አንድ ሥራ አለው፤ የሽያጭ ሥራም ነው፦ በባንክ፣ በኤምባሲ ወይም በመንግሥታዊ ያልሆነ ድርጅት ውስጥ ያለ የግዥ ኃላፊን የተቋም አገልግሎት ውል በዚህ ኩባንያ እጅ ደኅንነቱ የተጠበቀ መሆኑን ማሳመን።

## የተቋም አገልግሎት ገዢ በእውነት ምን ይመረምራል

ንድፉን አይደለም። ኩባንያው እውነተኛ መሆኑን፣ ይህን ሥራ ለምን ያህል ጊዜ እንደሠራ፣ ነገ በአንድ ሳይት ላይ ስንት ሰው ማሰማራት እንደሚችል፣ እና እንደነሱ ያለ ሰው ከዚህ በፊት ተጠቅሞበት እንደሆነ ነው የሚመረምረው።

ስለዚህ ገጹ እነዚያን ጥያቄዎች የሚመልሱ ነገሮችን በቅድሚያ ያቀርባል፦

- **አኃዞቹ**፣ በጽሑፍ ውስጥ ከመቀበር ይልቅ በእንቅስቃሴ የሚታዩ — ከ62 በላይ ደንበኞች፣ ከ300 በላይ ሠራተኞች፣ ከ15 በላይ ዓመታት። ሳይትን በአስተማማኝ ሁኔታ በሰው ኃይል በመሙላት ላይ ለሚመሠረት ውል የሠራተኛ ብዛት ራሱ መከራከሪያው ነው።
- **አራት የአገልግሎት መስመሮች**፣ እያንዳንዱ ወደ አንድ አንቀጽ ከመጨመቅ ይልቅ የራሱ ክፍል የተሰጠው፦ የሳይት ጽዳት፣ የጥበቃ ሰው ኃይል፣ ሥልጠናና ማማከር፣ እና ከቁሳቁስ አቅርቦት ጋር የንብረት አስተዳደር።
- **የደንበኞች ዝርዝር በዓይነት** — ድርጅቶች፣ መንግሥታዊ ያልሆኑ ድርጅቶችና ኤምባሲዎች። በዚህ ገበያ ውስጥ አስቀድሞ ማን እንደሚያምንህ መናገር በጣም ጠንካራው ነገር ነው።
- **በስም የተጠቀሱ አመራርና ቡድን**፣ ከሚናዎችና ከኃላፊነቶች ጋር። የበርካታ ሳይት ውል የሚፈርም ገዢ ማን ተጠያቂ እንደሆነ ማወቅ ይፈልጋል።

## መዋቅሩ

ሰባት ገጾች፣ እያንዳንዱ ሥራ ያለው፦ መነሻ፣ ስለእኛ፣ አገልግሎቶች፣ ዜና፣ ምስክርነቶች፣ ተደጋጋሚ ጥያቄዎችና መገናኛ።

**ተደጋጋሚ ጥያቄዎች** አብዛኞቹ የተቋም አገልግሎት ገጾች የሚዘሉት ክፍል ሲሆን እዚህ ግን በጣም ብዙ ሥራ የሚሠራው ነው። በቡድን የተከፋፈለ ነው — አጠቃላይ የኩባንያ ጥያቄዎች፣ ከዚያም ከአገልግሎት ጋር የተያያዙ — ገዢ ካልሆነ በስልክ መጠየቅ ያለበትን አስቸጋሪና ተግባራዊ ነገሮችንም ይመልሳል፦ አነስተኛና ሰፊ ውሎች ሁለቱም ይያዛሉ ወይ፣ ጥቅሎች ሊበጁ ይችላሉ ወይ፣ የበርካታ ሳይት ሥራ እንዴት ይመራል።

**ዜናና ምስክርነቶች** ያሉት የአገልግሎት ኩባንያ ተአማኒነት ገጹ የተተወ ሲመስል ስለሚቀንስ ነው። ሁለቱም ኩባንያው የሚያዘምናቸው ይዘቶች ናቸው።

## ለምን እንዲህ ይታያል

በአዲስ አበባ ሰማይ መስመር ፎቶግራፍ ላይ የድርጅት ሰማያዊ፣ ሰሪፍ የቃል ምልክት፣ እና ብዙ ክፍት ቦታ። ይህ ከኢአርፒው ጥቅጥቅ ካለ የሥራ በይነገጽ ሆን ተብሎ የተወሰደ ርቀት ነው — ተመሳሳይ ደንበኛ፣ ሁለት ተመልካቾች፤ ሠራተኞቻቸው ቀኑን ሙሉ የሚጠቀሙበት ሶፍትዌር ገዢ ከመፈረሙ በፊት አንድ ጊዜ የሚያየውን ገጽ መምሰል ያለበት ምንም ምክንያት የለም።`,
		services: [
			{ label: 'Corporate marketing site', labelAm: 'የድርጅት ማስተዋወቂያ ገጽ' },
			{ label: 'Service line presentation', labelAm: 'የአገልግሎት መስመር አቀራረብ' },
			{ label: 'Credibility & team pages', labelAm: 'የተአማኒነትና የቡድን ገጾች' },
			{ label: 'Grouped FAQ', labelAm: 'በቡድን የተከፋፈሉ ተደጋጋሚ ጥያቄዎች' },
			{ label: 'News & testimonials', labelAm: 'ዜናና ምስክርነቶች' },
			{ label: 'Enquiry routing', labelAm: 'የጥያቄ አቅጣጫ' }
		],
		outcomes: [
			{
				value: '2',
				label: 'Systems for one client — the site and the ERP behind it',
				labelAm: 'ለአንድ ደንበኛ ሁለት ሥርዓቶች — ገጹና ከኋላው ያለው ኢአርፒ'
			},
			{
				value: '4',
				label: 'Service lines, each given its own section',
				labelAm: 'አራት የአገልግሎት መስመሮች፤ እያንዳንዱ የራሱ ክፍል ያለው'
			},
			{
				value: '3',
				label: 'Buyer types addressed — corporate, NGO, embassy',
				labelAm: 'ሦስት የገዢ ዓይነቶች — ድርጅት፣ መንግሥታዊ ያልሆነ፣ ኤምባሲ'
			}
		],
		images: [
			{
				image: shot('spotless-general-trading', 'home'),
				alt: 'Spotless General Trading home page over an Addis Ababa skyline',
				altAm: 'በአዲስ አበባ ሰማይ መስመር ላይ የስፖትለስ ጀነራል ትሬዲንግ መነሻ ገጽ',
				caption:
					'Corporate blue over the city the company works in, with the client count in view immediately.',
				captionAm: 'ኩባንያው በሚሠራበት ከተማ ላይ የድርጅት ሰማያዊ፤ የደንበኞች ብዛትም ወዲያውኑ በእይታ ውስጥ።'
			},
			{
				image: shot('spotless-general-trading', 'services'),
				alt: 'The services page listing the four service lines',
				altAm: 'አራቱን የአገልግሎት መስመሮች የሚዘረዝር የአገልግሎቶች ገጽ',
				caption:
					'Cleaning, security, training and consultancy, and property management — four lines, four sections, no compression.',
				captionAm: 'ጽዳት፣ ጥበቃ፣ ሥልጠናና ማማከር፣ እና የንብረት አስተዳደር — አራት መስመሮች፣ አራት ክፍሎች።'
			},
			{
				image: shot('spotless-general-trading', 'about'),
				alt: 'The about page with company figures, values and named team members',
				altAm: 'የኩባንያ አኃዞች፣ እሴቶችና በስም የተጠቀሱ የቡድን አባላት ያሉት የስለእኛ ገጽ',
				caption:
					'Figures, values, a leadership message and a named team — the four things a procurement officer checks.',
				captionAm: 'አኃዞች፣ እሴቶች፣ የአመራር መልእክትና በስም የተጠቀሰ ቡድን — የግዥ ኃላፊ የሚመረምራቸው አራት ነገሮች።'
			},
			{
				image: shot('spotless-general-trading', 'faq'),
				alt: 'The grouped FAQ page',
				altAm: 'በቡድን የተከፋፈለ የተደጋጋሚ ጥያቄዎች ገጽ',
				caption:
					'Grouped into company and service questions, answering the practical things a buyer would otherwise phone about.',
				captionAm: 'ወደ ኩባንያና የአገልግሎት ጥያቄዎች የተከፋፈለ፤ ገዢ ካልሆነ በስልክ የሚጠይቃቸውን ተግባራዊ ነገሮች ይመልሳል።'
			},
			{
				image: shot('spotless-general-trading', 'testimonials'),
				alt: 'The testimonials page',
				altAm: 'የምስክርነቶች ገጽ',
				caption:
					'In a market where reputation travels by word of mouth, this page is the one that closes.',
				captionAm: 'ስም በአፍ በሚተላለፍበት ገበያ ውስጥ ይህ ገጽ ውሉን የሚያስፈጽመው ነው።'
			},
			{
				image: shot('spotless-general-trading', 'news'),
				alt: 'The news page',
				altAm: 'የዜና ገጽ',
				caption:
					'Kept current, because a services company’s credibility decays if its site looks abandoned.',
				captionAm: 'የሚዘመን፤ ምክንያቱም የአገልግሎት ኩባንያ ተአማኒነት ገጹ የተተወ ሲመስል ስለሚቀንስ።'
			},
			{
				image: shot('spotless-general-trading', 'contact'),
				alt: 'The contact page with location details',
				altAm: 'የቦታ ዝርዝሮች ያሉት የመገናኛ ገጽ',
				caption:
					'Arat Kilo, Addis Ababa — with the service area stated, which is itself a qualifying question.',
				captionAm: 'አራት ኪሎ፣ አዲስ አበባ — የአገልግሎት አካባቢውም ተጠቅሷል፤ ይህ ራሱ የሚያጣራ ጥያቄ ነው።'
			}
		]
	},
	// -------------------------------------------------------------------------
	{
		slug: 'fro-services',
		name: 'Fro Services',
		nameAm: 'ፍሮ ሰርቪሰስ',
		client: 'Fro',
		clientAm: 'ፍሮ',
		summary:
			'The web front for a US on-demand services app — bilingual, dark-mode aware, and load-bearing: three of its pages are wired into the mobile app’s live payment and referral flows, not decoration around them.',
		summaryAm:
			'ለአሜሪካ የተዘጋጀ የአገልግሎት መተግበሪያ ድረ-ገጽ ግንባር — በሁለት ቋንቋ፣ የጨለማ ሁነታን የሚያውቅ፣ እና ተሸካሚ፦ ከገጾቹ ሦስቱ በዙሪያው ያሉ ጌጦች ሳይሆኑ በቀጥታ ከመተግበሪያው የክፍያና የሪፈራል ሂደቶች ጋር የተሳሰሩ ናቸው።',
		industry: 'On-demand marketplace (US market)',
		industryAm: 'የፍላጎት ጊዜ ገበያ (የአሜሪካ ገበያ)',
		year: '2026',
		websiteUrl: 'https://froservices.com',
		featured: true,
		coverImage: shot('fro-services', 'home'),
		coverImageAlt: 'The Fro home page showing a provider travelling to a customer on a live map',
		coverImageAltAm: 'አቅራቢ ወደ ደንበኛ ሲጓዝ በቀጥታ ካርታ ላይ የሚያሳይ የፍሮ መነሻ ገጽ',
		body: `## A website the app cannot ship without

Fro is a local-services marketplace: customers book vetted providers who travel to them, pay into escrow, and watch the provider approach on a live map. One account serves both sides through a customer/provider toggle. The app is Flutter, Supabase and Stripe; the brand is Ethiopian-rooted and the market is the United States.

When we picked this up the app had **no public web presence at all** — no marketing page, no reachable privacy policy, no support URL. That is not a marketing gap, it is a blocker: Apple requires a marketing URL, a working support URL and a privacy policy URL, and Google Play additionally requires a public account-deletion request URL. The app could not be submitted.

## Three pages that are infrastructure

Most marketing sites can be rewritten freely. Three of these cannot, because shipping code already points at them:

- **\`/payment-complete\`** is the \`return_url\` the booking payment edge function hands to Stripe, and the checkout WebView inside the app watches for that exact URL to know when to close the payment sheet. Before this site existed, that URL 404'd — the payment succeeded and the sheet had nothing to catch.
- **\`/tip-complete\`** does the same job for the tipping flow.
- **\`/join?ref=…\`** is where the in-app referral link lands, so it has to carry the referral code through to the store.

Getting those wrong does not make a page look bad; it breaks a payment.

## The marketing half

**Bilingual English and Spanish**, because the market is the US and the service is street-level. Both languages are first-class rather than a translated afterthought.

**Dark mode**, honoured from the visitor's own setting.

**Two audiences, two arguments.** Customers get escrow payments, identity-verified providers, live arrival tracking and card payment. Providers get the economics stated plainly on the page rather than buried in a help centre: 20% added on top and never taken out of their rate, a $10 minimum withdrawal, 24-hour auto-release after the job is finished, and a 5% lifetime share on referrals. A provider deciding whether to sign up is doing arithmetic, so the arithmetic is the headline.

**Pre-launch, honestly.** The app is not out yet, so the store badges say "Coming soon" and the site captures an email for launch — collecting address and language only, and saying so next to the field.

## The compliance half

Full tailored legal prose rather than a generic template: terms, privacy, an app-specific privacy page, safety, support, and a working account-deletion request flow. These are the pages nobody reads until a store reviewer does.

## The detail worth noticing

The Ethiopian border pattern running under each section. The brand is aimed at American customers and built by an Ethiopian team, and that band is the one place the site says so without explaining itself.`,
		bodyAm: `## መተግበሪያው ያለሱ ሊወጣ የማይችል ድረ-ገጽ

ፍሮ የአካባቢ አገልግሎት ገበያ ነው፦ ደንበኞች ወደነሱ የሚጓዙ የተረጋገጡ አቅራቢዎችን ያስይዛሉ፣ ገንዘቡን በአደራ ሒሳብ ይከፍላሉ፣ አቅራቢውም ሲቃረብ በቀጥታ ካርታ ላይ ይመለከታሉ። አንድ መለያ በደንበኛ/አቅራቢ መቀያየሪያ ሁለቱንም ወገኖች ያገለግላል። መተግበሪያው Flutter፣ Supabase እና Stripe ነው፤ የምርት ስሙ ኢትዮጵያዊ መሠረት ያለው ሲሆን ገበያው አሜሪካ ነው።

ይህን ስንረከብ መተግበሪያው **ምንም ዓይነት የሕዝብ ድረ-ገጽ አልነበረውም** — የማስተዋወቂያ ገጽ የለም፣ ሊደረስበት የሚችል የግላዊነት ፖሊሲ የለም፣ የድጋፍ አድራሻ የለም። ይህ የገበያ ክፍተት ሳይሆን እንቅፋት ነው፦ አፕል የማስተዋወቂያ አድራሻ፣ የሚሠራ የድጋፍ አድራሻና የግላዊነት ፖሊሲ አድራሻ ይጠይቃል፤ ጉግል ፕሌይም በተጨማሪ የሕዝብ የመለያ ስረዛ ጥያቄ አድራሻ ይጠይቃል። መተግበሪያው ሊቀርብ አይችልም ነበር።

## መሠረተ ልማት የሆኑ ሦስት ገጾች

አብዛኞቹ የማስተዋወቂያ ገጾች በነጻነት ሊጻፉ ይችላሉ። ከእነዚህ ሦስቱ ግን አይችሉም፤ ምክንያቱም አስቀድሞ የሚሠራ ኮድ ወደነሱ ስለሚያመለክት፦

- **\`/payment-complete\`** የቦታ ማስያዣ ክፍያ ተግባር ለStripe የሚሰጠው \`return_url\` ነው፤ በመተግበሪያው ውስጥ ያለው የክፍያ መስኮትም የክፍያ ገጹን መቼ መዝጋት እንዳለበት ለማወቅ ያንኑ አድራሻ ይጠብቃል። ይህ ገጽ ከመኖሩ በፊት ያ አድራሻ 404 ይመልስ ነበር — ክፍያው ተሳክቶ መስኮቱ የሚይዘው ነገር አልነበረም።
- **\`/tip-complete\`** ለጉርሻ ሂደት ተመሳሳይ ሥራ ይሠራል።
- **\`/join?ref=…\`** በመተግበሪያው ውስጥ ያለው የሪፈራል አገናኝ የሚያርፍበት ነው፤ ስለዚህ የሪፈራል ኮዱን ወደ መደብሩ ማሸጋገር አለበት።

እነዚህን መሳሳት ገጽ መጥፎ እንዲመስል አያደርግም፤ ክፍያ ያበላሻል።

## የማስተዋወቂያው ግማሽ

**በእንግሊዝኛና በስፓኒሽ**፤ ገበያው አሜሪካ ስለሆነና አገልግሎቱም የመንገድ ደረጃ ስለሆነ። ሁለቱም ቋንቋዎች እንደ ተጨማሪ ትርጉም ሳይሆን ቀዳሚ ናቸው።

**የጨለማ ሁነታ**፣ ከጎብኚው የራሱ ቅንብር የሚወሰድ።

**ሁለት ተመልካቾች፣ ሁለት መከራከሪያዎች።** ደንበኞች የአደራ ክፍያ፣ ማንነታቸው የተረጋገጠ አቅራቢዎች፣ የቀጥታ መድረሻ ክትትልና የካርድ ክፍያ ያገኛሉ። አቅራቢዎች ደግሞ በእገዛ ማዕከል ውስጥ ከመቀበር ይልቅ በገጹ ላይ በግልጽ የተቀመጠ ስሌት ያገኛሉ፦ 20% ከዋጋቸው ላይ ሳይቀነስ በላዩ ላይ የሚጨመር፣ የ$10 ዝቅተኛ የማውጣት መጠን፣ ሥራው ካለቀ በኋላ በ24 ሰዓት ውስጥ በራሱ የሚለቀቅ ክፍያ፣ እና በሪፈራል ላይ የ5% የዕድሜ ልክ ድርሻ። ለመመዝገብ የሚያስብ አቅራቢ ስሌት እየሠራ ነው፤ ስለዚህ ስሌቱ ራሱ አርዕስቱ ነው።

**ከመውጣቱ በፊት፣ በእውነተኝነት።** መተግበሪያው ገና አልወጣም፤ ስለዚህ የመደብር ምልክቶቹ "በቅርቡ" ይላሉ፤ ገጹም ለመውጫው ኢሜይል ይሰበስባል — አድራሻና ቋንቋ ብቻ በመያዝ፣ ይህንንም ከመስኩ አጠገብ በመግለጽ።

## የተገዢነት ግማሽ

አጠቃላይ አብነት ሳይሆን ሙሉ ለሙሉ የተዘጋጀ የሕግ ጽሑፍ፦ ውሎች፣ ግላዊነት፣ ለመተግበሪያ የተለየ የግላዊነት ገጽ፣ ደኅንነት፣ ድጋፍ፣ እና የሚሠራ የመለያ ስረዛ ጥያቄ ሂደት። እነዚህ የመደብር ገምጋሚ እስኪያነባቸው ድረስ ማንም የማያነባቸው ገጾች ናቸው።

## ሊስተዋል የሚገባው ዝርዝር

ከእያንዳንዱ ክፍል በታች የሚሮጠው የኢትዮጵያ ጥልፍ ሥዕል። የምርት ስሙ ለአሜሪካ ደንበኞች የተነጣጠረ ሆኖ በኢትዮጵያዊ ቡድን የተሠራ ነው፤ ያ መስመርም ገጹ ይህንን ሳያብራራ የሚናገርበት ብቸኛው ቦታ ነው።`,
		services: [
			{ label: 'Marketing site for a mobile app', labelAm: 'ለሞባይል መተግበሪያ የማስተዋወቂያ ገጽ' },
			{ label: 'Stripe return & referral landing pages', labelAm: 'የStripe መመለሻና የሪፈራል ማረፊያ ገጾች' },
			{ label: 'App Store & Play compliance pages', labelAm: 'የመተግበሪያ መደብር ተገዢነት ገጾች' },
			{ label: 'Account-deletion request flow', labelAm: 'የመለያ ስረዛ ጥያቄ ሂደት' },
			{ label: 'English & Spanish, dark mode', labelAm: 'እንግሊዝኛና ስፓኒሽ፣ የጨለማ ሁነታ' },
			{ label: 'Pre-launch email capture', labelAm: 'ከመውጣት በፊት የኢሜይል መሰብሰቢያ' }
		],
		outcomes: [
			{
				value: '3',
				label: 'Store requirements unblocked — marketing, support, privacy',
				labelAm: 'ሦስት የመደብር መስፈርቶች ተፈቱ'
			},
			{
				value: '1',
				label: 'Payment return URL that used to 404',
				labelAm: 'ከዚህ በፊት 404 ይመልስ የነበረ አንድ የክፍያ መመለሻ አድራሻ'
			},
			{ value: '2', label: 'Languages, both first-class', labelAm: 'ሁለት ቋንቋዎች፤ ሁለቱም ቀዳሚ' }
		],
		images: [
			{
				image: shot('fro-services', 'home'),
				alt: 'Fro home page with a phone showing a provider travelling to a customer',
				altAm: 'አቅራቢ ወደ ደንበኛ ሲጓዝ የሚያሳይ ስልክ ያለው የፍሮ መነሻ ገጽ',
				caption:
					'The whole proposition in one line and one image: book, watch them come, pay when it is done.',
				captionAm: 'ሙሉው አቅርቦት በአንድ መስመርና በአንድ ምስል፦ አስይዝ፣ ሲመጣ ተመልከት፣ ሲጠናቀቅ ክፈል።'
			},
			{
				image: shot('fro-services', 'providers'),
				alt: 'The providers page stating commission, withdrawal and payout terms',
				altAm: 'ኮሚሽንን፣ የማውጣትና የክፍያ ውሎችን የሚገልጽ የአቅራቢዎች ገጽ',
				caption:
					'20% on top, $10 minimum withdrawal, 24-hour release, 5% on referrals. A provider is doing arithmetic, so the arithmetic leads.',
				captionAm:
					'20% በላዩ፣ የ$10 ዝቅተኛ ማውጣት፣ በ24 ሰዓት መለቀቅ፣ በሪፈራል 5%። አቅራቢ ስሌት እየሠራ ነው፤ ስለዚህ ስሌቱ ይመራል።'
			},
			{
				image: shot('fro-services', 'join'),
				alt: 'The join page, where in-app referral links land',
				altAm: 'በመተግበሪያ ውስጥ ያሉ የሪፈራል አገናኞች የሚያርፉበት የመቀላቀያ ገጽ',
				caption:
					'The join page is a live target for referral links already shipping inside the app, so it has to carry the code through.',
				captionAm: 'የመቀላቀያ ገጹ አስቀድሞ በመተግበሪያው ውስጥ ላሉ የሪፈራል አገናኞች ቀጥታ መድረሻ ነው፤ ስለዚህ ኮዱን ማሸጋገር አለበት።'
			},
			{
				image: shot('fro-services', 'safety'),
				alt: 'The safety page',
				altAm: 'የደኅንነት ገጽ',
				caption:
					'Vetting, escrow and tracking explained plainly — the objections a first-time customer actually has.',
				captionAm: 'ማጣራት፣ የአደራ ሒሳብና ክትትል በግልጽ የተብራሩ — አዲስ ደንበኛ በእውነት የሚያነሳቸው ጥያቄዎች።'
			},
			{
				image: shot('fro-services', 'support'),
				alt: 'The support page',
				altAm: 'የድጋፍ ገጽ',
				caption: 'A working support URL is an App Store requirement, not a nicety.',
				captionAm: 'የሚሠራ የድጋፍ አድራሻ የአፕ ስቶር መስፈርት እንጂ ተጨማሪ ነገር አይደለም።'
			},
			{
				image: shot('fro-services', 'delete-account'),
				alt: 'The account deletion request page',
				altAm: 'የመለያ ስረዛ ጥያቄ ገጽ',
				caption:
					'Google Play requires a public account-deletion request URL. This is it, and it works.',
				captionAm: 'ጉግል ፕሌይ የሕዝብ የመለያ ስረዛ ጥያቄ አድራሻ ይጠይቃል። ይህ ነው፤ ይሠራልም።'
			}
		]
	},
	// -------------------------------------------------------------------------
	{
		slug: 'lalo-bakery-solutions',
		name: 'Lalo Bakery Solutions',
		nameAm: 'ላሎ ቤከሪ ሶሉሽንስ',
		client: 'Lalo Bakery Solutions',
		clientAm: 'ላሎ ቤከሪ ሶሉሽንስ',
		summary:
			'A storefront and back office for a bakery-ingredients supplier: customer accounts and checkout on the front, and products, suppliers, stock adjustments, recipes and delivery pricing behind it.',
		summaryAm:
			'ለዳቦ መጋገሪያ ግብዓት አቅራቢ የተሠራ የመሸጫ ገጽና የጀርባ ቢሮ፦ ከፊት የደንበኛ መለያና የክፍያ ሂደት፣ ከኋላው ደግሞ ምርቶች፣ አቅራቢዎች፣ የክምችት ማስተካከያ፣ የምግብ አሠራሮችና የማድረሻ ዋጋ።',
		industry: 'Food manufacturing & distribution',
		industryAm: 'የምግብ ማምረቻና ስርጭት',
		year: '2025',
		websiteUrl: 'https://lalobakerysolutions.com',
		featured: true,
		coverImage: shot('lalo-bakery-solutions', 'home'),
		coverImageAlt: 'The Lalo Bakery Solutions home page',
		coverImageAltAm: 'የላሎ ቤከሪ ሶሉሽንስ መነሻ ገጽ',
		body: `## Two systems that had to be one

A bakery-ingredients supplier sells to the public and to trade, and the two look nothing alike from the inside. The shop needs a catalogue, a cart, a delivery fee and an order confirmation. The business needs to know what it paid, what it has left, what went to waste, and who owes it money.

Building those separately is how a shop ends up selling something the warehouse ran out of last week.

## The storefront

A catalogue with categories, product galleries and **priced ranges** — a product is sold in several pack sizes, each with its own price, rather than as a single line with a single number. Customers get real accounts: an order history, saved delivery addresses, a settings page and password reset.

**Delivery pricing is server-side, always.** The fee is looked up from the delivery area the customer picked, orders at or above the free-delivery threshold pay nothing whatever the area, and local pickup is free by definition. The same function serves checkout and the dashboard, so the fee quoted to a customer and the fee staff see on that order are the one number. A fee posted by a browser is never trusted.

**Recipes** are a genuine content section, not filler: each recipe carries prep and cook times, instructions, a featured image and its ingredient list — which links to the products the shop actually sells.

## The back office

**Products and stock.** Categories, images, suppliers, and a stock ledger built from adjustments: every movement is a signed row with a reason, and a sale links directly to the transaction that caused it. Damaged stock is recorded against the product rather than quietly deducted, so wastage is a number somebody can look at.

**Orders.** All orders, delivered, cancelled — each with its customer, its items, its delivery fee and its payment method. Customer records carry their full order history.

**Money and reporting.** Transactions, discounts, free-delivery thresholds, payment methods and a reports screen over the lot.

**Administration.** Roles and permissions with per-user overrides, a testimonials manager, a message inbox from the contact form, and a logo/branding manager.

## The result

One place where a price change, a stock count and a customer's order are the same set of facts. The shop cannot sell what the warehouse does not have, and the month-end question — what did we actually make on this — has an answer that does not require assembling it from three spreadsheets.`,
		bodyAm: `## አንድ መሆን የነበረባቸው ሁለት ሥርዓቶች

የዳቦ መጋገሪያ ግብዓት አቅራቢ ለሕዝብም ለንግድም ይሸጣል፤ ሁለቱ ደግሞ ከውስጥ ሲታዩ ምንም አይመሳሰሉም። ሱቁ ካታሎግ፣ ጋሪ፣ የማድረሻ ክፍያና የትዕዛዝ ማረጋገጫ ይፈልጋል። ንግዱ ግን የከፈለውን፣ የቀረውን፣ የባከነውንና ማን እንደሚያዘው ማወቅ አለበት።

እነዚህን ለየብቻ መገንባት ሱቅ መጋዘኑ ባለፈው ሳምንት የጨረሰውን ነገር እንዲሸጥ የሚያደርግ መንገድ ነው።

## የመሸጫ ገጹ

ከምድቦች፣ ከምርት ማዕከለ-ሥዕላትና ከ**ዋጋ ካላቸው መጠኖች** ጋር ካታሎግ — አንድ ምርት በአንድ መስመርና በአንድ ቁጥር ሳይሆን በተለያዩ የማሸጊያ መጠኖች፣ እያንዳንዱም በራሱ ዋጋ ይሸጣል። ደንበኞች እውነተኛ መለያ ያገኛሉ፦ የትዕዛዝ ታሪክ፣ የተቀመጡ የማድረሻ አድራሻዎች፣ የቅንብር ገጽና የይለፍ ቃል ማደሻ።

**የማድረሻ ዋጋ ሁልጊዜ በአገልጋዩ በኩል ነው።** ክፍያው ደንበኛው ከመረጠው የማድረሻ አካባቢ ይፈለጋል፤ ከነጻ ማድረሻ ገደብ በላይ የሆኑ ትዕዛዞች አካባቢው ምንም ይሁን ምን ምንም አይከፍሉም፤ በቦታው መውሰድም በተፈጥሮው ነጻ ነው። ተመሳሳዩ ተግባር ለክፍያ ሂደቱም ለዳሽቦርዱም ያገለግላል፤ ስለዚህ ለደንበኛ የተነገረውና ሠራተኞች በዚያ ትዕዛዝ ላይ የሚያዩት ክፍያ አንድ ቁጥር ነው።

**የምግብ አሠራሮች** እውነተኛ የይዘት ክፍል ናቸው፦ እያንዳንዱ አሠራር የዝግጅትና የማብሰያ ጊዜ፣ መመሪያ፣ ምስልና የግብዓት ዝርዝር ይዟል — ይህም ሱቁ በእውነት ከሚሸጣቸው ምርቶች ጋር የተገናኘ ነው።

## የጀርባ ቢሮው

**ምርቶችና ክምችት።** ምድቦች፣ ምስሎች፣ አቅራቢዎች፣ እና ከማስተካከያዎች የተገነባ የክምችት መዝገብ፦ እያንዳንዱ እንቅስቃሴ ምክንያት ያለው ምልክት ያለው ረድፍ ነው፤ ሽያጭም ካስከተለው ግብይት ጋር በቀጥታ ይገናኛል። የተበላሸ ክምችት በዝምታ ከመቀነስ ይልቅ በምርቱ ላይ ይመዘገባል፤ ስለዚህ ብክነት ሰው ሊያየው የሚችል ቁጥር ነው።

**ትዕዛዞች።** ሁሉም ትዕዛዞች፣ የደረሱ፣ የተሰረዙ — እያንዳንዱ ከደንበኛው፣ ከዕቃዎቹ፣ ከማድረሻ ክፍያውና ከክፍያ ዘዴው ጋር።

**ገንዘብና ሪፖርት።** ግብይቶች፣ ቅናሾች፣ የነጻ ማድረሻ ገደቦች፣ የክፍያ ዘዴዎችና በሁሉም ላይ የሪፖርት ገጽ።

**አስተዳደር።** ሚናዎችና ፈቃዶች በተጠቃሚ ደረጃ ሊሻሻሉ የሚችሉ፣ የምስክርነት አስተዳዳሪ፣ ከመገናኛ ቅጽ የሚመጣ የመልእክት ሳጥን፣ እና የአርማ አስተዳዳሪ።

## ውጤቱ

የዋጋ ለውጥ፣ የክምችት ቆጠራና የደንበኛ ትዕዛዝ አንድ ዓይነት እውነታዎች የሚሆኑበት አንድ ቦታ። ሱቁ መጋዘኑ የሌለውን መሸጥ አይችልም።`,
		services: [
			{ label: 'E-commerce storefront & checkout', labelAm: 'የመሸጫ ገጽና የክፍያ ሂደት' },
			{ label: 'Customer accounts & order history', labelAm: 'የደንበኛ መለያና የትዕዛዝ ታሪክ' },
			{ label: 'Server-side delivery pricing', labelAm: 'በአገልጋይ የሚሰላ የማድረሻ ዋጋ' },
			{ label: 'Inventory & stock adjustments', labelAm: 'ክምችትና የክምችት ማስተካከያ' },
			{ label: 'Suppliers & damaged-stock tracking', labelAm: 'አቅራቢዎችና የተበላሸ ክምችት ክትትል' },
			{ label: 'Recipe library', labelAm: 'የምግብ አሠራር ቤተ-መጻሕፍት' }
		],
		outcomes: [
			{
				value: '1',
				label: 'Delivery fee calculation, shared by shop and staff',
				labelAm: 'አንድ የማድረሻ ክፍያ ስሌት፤ በሱቁና በሠራተኞች የሚጋራ'
			},
			{
				value: '100%',
				label: 'Of stock movements carry a reason',
				labelAm: 'የክምችት እንቅስቃሴዎች በሙሉ ምክንያት ይይዛሉ'
			},
			{
				value: '2',
				label: 'Audiences — retail and trade — on one catalogue',
				labelAm: 'ሁለት ተጠቃሚዎች — ችርቻሮና ንግድ — በአንድ ካታሎግ'
			}
		],
		images: [
			{
				image: shot('lalo-bakery-solutions', 'home'),
				alt: 'Lalo Bakery Solutions home page',
				altAm: 'የላሎ ቤከሪ ሶሉሽንስ መነሻ ገጽ',
				caption: 'The storefront: a supplier’s catalogue that has to read as a shop.',
				captionAm: 'የመሸጫ ገጹ፦ እንደ ሱቅ መነበብ ያለበት የአቅራቢ ካታሎግ።'
			},
			{
				image: shot('lalo-bakery-solutions', 'shop'),
				alt: 'The product catalogue with categories',
				altAm: 'ከምድቦች ጋር የምርት ካታሎግ',
				caption:
					'Products are sold in priced ranges — several pack sizes, each with its own price.',
				captionAm: 'ምርቶች ዋጋ ባላቸው መጠኖች ይሸጣሉ — በተለያዩ የማሸጊያ መጠኖች፣ እያንዳንዱ በራሱ ዋጋ።'
			},
			{
				image: shot('lalo-bakery-solutions', 'recipes'),
				alt: 'The recipe library',
				altAm: 'የምግብ አሠራር ቤተ-መጻሕፍት',
				caption: 'Recipes link their ingredients to products the shop actually stocks.',
				captionAm: 'የምግብ አሠራሮች ግብዓቶቻቸውን ሱቁ በእውነት ከሚይዛቸው ምርቶች ጋር ያገናኛሉ።'
			},
			{
				image: shot('lalo-bakery-solutions', 'about'),
				alt: 'The about page',
				altAm: 'የስለእኛ ገጽ',
				caption: 'The company story, editable from the dashboard like everything else.',
				captionAm: 'የኩባንያው ታሪክ፤ እንደ ሌላው ሁሉ ከዳሽቦርዱ ሊስተካከል የሚችል።'
			},
			{
				image: shot('lalo-bakery-solutions', 'contact'),
				alt: 'The contact page',
				altAm: 'የመገናኛ ገጽ',
				caption: 'Enquiries land in a dashboard inbox rather than a mailbox nobody checks.',
				captionAm: 'ጥያቄዎች ማንም በማይመለከተው የመልእክት ሳጥን ሳይሆን በዳሽቦርድ ውስጥ ይደርሳሉ።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'golla-design-group',
		name: 'Golla Design Group',
		nameAm: 'ጎላ ዲዛይን ግሩፕ',
		client: 'Golla Design Group',
		clientAm: 'ጎላ ዲዛይን ግሩፕ',
		summary:
			'A portfolio site and content system for an Addis Ababa architecture and design-build practice, where the work itself — projects, galleries and video — is the product and has to be published without a developer.',
		summaryAm:
			'በአዲስ አበባ ለሚገኝ የሕንፃ ዲዛይንና ግንባታ ድርጅት የተሠራ የሥራ ማሳያ ገጽና የይዘት ሥርዓት፤ ሥራው ራሱ — ፕሮጀክቶች፣ ማዕከለ-ሥዕላትና ቪዲዮ — ምርቱ ስለሆነ ያለ ገንቢ መታተም አለበት።',
		industry: 'Architecture & interior design',
		industryAm: 'ሕንፃ ዲዛይንና የውስጥ ማስዋብ',
		year: '2025',
		websiteUrl: 'https://golladesigns.com',
		featured: false,
		coverImage: shot('golla-design-group', 'home'),
		coverImageAlt: 'The Golla Design Group home page',
		coverImageAltAm: 'የጎላ ዲዛይን ግሩፕ መነሻ ገጽ',
		body: `## A practice whose website is its portfolio

Golla is an architectural and design-build practice in Addis Ababa working in quiet, intentional spaces and bespoke materials. For a practice like that the website is not marketing collateral around the work — it *is* the work, and it goes out of date the moment a project completes.

So the build treats publishing as the primary use case rather than an afterthought.

## What it does

**Projects and portfolio, with real media.** A project carries a category, a description, a cover image, an image gallery and video. Galleries are ordered, and images are compressed in the browser before upload — a practice photographing its own buildings uploads 8MB files, and nobody should have to think about that.

**Services**, each with its own gallery, so a service page shows work rather than describing it.

**A blog** with categories, image galleries and embedded video, written in a rich-text editor.

**Testimonials and team**, both managed from the dashboard.

**A quote request** that routes into a dashboard queue with a status, so an enquiry has a state rather than sitting in an inbox.

**Roles and permissions**, with per-user special permissions, so a studio assistant can publish a blog post without being able to touch the team page or the enquiry queue.

## The engineering underneath

The whole thing runs on SQLite through libSQL, which for a practice of this size is the right answer: no database server to administer, no monthly bill for an idle instance, and a file that can be backed up by copying it. Uploads are handled with browser-side compression and a file manager that keeps the originals out of the database.

## Why it reads the way it does

Almost every architecture-practice site in Ethiopia is a template with the practice's photographs dropped into it. This one was built around the specific thing Golla does — the long, slow reveal of a space — which is why the home page is a full-bleed image with a single line of type on it, and why the portfolio is a grid that gets out of the way.`,
		bodyAm: `## ድረ-ገጹ ራሱ የሥራ ማሳያው የሆነ ድርጅት

ጎላ በአዲስ አበባ የሚገኝ የሕንፃ ዲዛይንና ግንባታ ድርጅት ሲሆን በጸጥታና በሆን ተብለው በተዘጋጁ ቦታዎችና በተለዩ ቁሳቁሶች ላይ ይሠራል። ለእንዲህ ዓይነት ድርጅት ድረ-ገጹ በሥራው ዙሪያ ያለ የገበያ ማስተዋወቂያ አይደለም — ራሱ *ሥራው* ነው፤ አንድ ፕሮጀክት እንደተጠናቀቀም ወዲያውኑ ያረጃል።

ስለዚህ ግንባታው ማተምን እንደ ዋና ተግባር እንጂ እንደ ተጨማሪ ነገር አይመለከተውም።

## ምን ያደርጋል

**ፕሮጀክቶችና የሥራ ማሳያ፣ ከእውነተኛ ሚዲያ ጋር።** አንድ ፕሮጀክት ምድብ፣ መግለጫ፣ ሽፋን ምስል፣ የምስል ማዕከለ-ሥዕልና ቪዲዮ ይይዛል። ማዕከለ-ሥዕላቱ የተደረደሩ ናቸው፤ ምስሎችም ከመጫናቸው በፊት በአሳሹ ውስጥ ይጨመቃሉ — የራሱን ሕንፃዎች የሚያነሳ ድርጅት የ8 ሜጋባይት ፋይሎችን ይጭናል፤ ስለዚህ ማንም ስለዚያ ማሰብ የለበትም።

**አገልግሎቶች**፣ እያንዳንዱ የራሱ ማዕከለ-ሥዕል ያለው፤ ስለዚህ የአገልግሎት ገጽ ከመግለጽ ይልቅ ሥራ ያሳያል።

**ብሎግ** ከምድቦች፣ ከምስል ማዕከለ-ሥዕላትና ከተካተተ ቪዲዮ ጋር፤ በበለጸገ የጽሑፍ አርታዒ የሚጻፍ።

**ምስክርነቶችና ቡድን**፣ ሁለቱም ከዳሽቦርዱ የሚተዳደሩ።

**የዋጋ ጥያቄ** ሁኔታ ወዳለው የዳሽቦርድ ወረፋ የሚገባ፤ ስለዚህ ጥያቄ በመልእክት ሳጥን ውስጥ ከመቀመጥ ይልቅ ሁኔታ አለው።

**ሚናዎችና ፈቃዶች**፣ በተጠቃሚ ደረጃ ልዩ ፈቃዶች ያሉት፤ ስለዚህ የስቱዲዮ ረዳት የቡድኑን ገጽ ወይም የጥያቄ ወረፋውን ሳይነካ የብሎግ ጽሑፍ ማተም ይችላል።

## ከሥሩ ያለው ምህንድስና

ሁሉም ነገር በlibSQL በኩል በSQLite ላይ ይሠራል፤ ለዚህ መጠን ላለው ድርጅትም ትክክለኛው መልስ ይህ ነው፦ የሚተዳደር የመረጃ ቋት አገልጋይ የለም፣ ሥራ ለሌለው አገልጋይ ወርሃዊ ክፍያ የለም፣ እና በመቅዳት ብቻ ሊጠበቅ የሚችል ፋይል ነው።

## ለምን እንዲህ ይነበባል

በኢትዮጵያ ውስጥ ያሉ ከሞላ ጎደል ሁሉም የሕንፃ ድርጅት ገጾች የድርጅቱ ፎቶዎች የተጨመሩባቸው አብነቶች ናቸው። ይህኛው ግን ጎላ በሚሠራው ልዩ ነገር ዙሪያ ተገንብቷል።`,
		services: [
			{ label: 'Portfolio & project galleries', labelAm: 'የሥራ ማሳያና የፕሮጀክት ማዕከለ-ሥዕላት' },
			{ label: 'Service pages with media', labelAm: 'ከሚዲያ ጋር የአገልግሎት ገጾች' },
			{ label: 'Blog with rich text & video', labelAm: 'በበለጸገ ጽሑፍና ቪዲዮ ብሎግ' },
			{ label: 'Quote request queue', labelAm: 'የዋጋ ጥያቄ ወረፋ' },
			{ label: 'Browser-side image compression', labelAm: 'በአሳሽ ውስጥ የምስል ጭመቃ' },
			{ label: 'Roles & special permissions', labelAm: 'ሚናዎችና ልዩ ፈቃዶች' }
		],
		outcomes: [
			{
				value: '0',
				label: 'Developer involvement to publish a project',
				labelAm: 'ፕሮጀክት ለማተም የገንቢ ተሳትፎ አያስፈልግም'
			},
			{
				value: '3',
				label: 'Media types per project — image, gallery, video',
				labelAm: 'በአንድ ፕሮጀክት ሦስት የሚዲያ ዓይነቶች'
			},
			{ value: '1', label: 'File to back up the whole site', labelAm: 'ሙሉውን ገጽ ለመጠበቅ አንድ ፋይል' }
		],
		images: [
			{
				image: shot('golla-design-group', 'home'),
				alt: 'Golla Design Group home page with a full-bleed architectural photograph',
				altAm: 'ሙሉ ስፋት ያለው የሕንፃ ፎቶ ያለው የጎላ ዲዛይን ግሩፕ መነሻ ገጽ',
				caption: 'A single line of type over the work, because the work is the argument.',
				captionAm: 'በሥራው ላይ አንድ መስመር ጽሑፍ ብቻ፤ ምክንያቱም ሥራው ራሱ መከራከሪያው ስለሆነ።'
			},
			{
				image: shot('golla-design-group', 'portfolio'),
				alt: 'The portfolio grid of completed projects',
				altAm: 'የተጠናቀቁ ፕሮጀክቶች የሥራ ማሳያ ፍርግርግ',
				caption:
					'Projects carry categories, galleries and video, all published from the dashboard.',
				captionAm: 'ፕሮጀክቶች ምድቦችን፣ ማዕከለ-ሥዕላትንና ቪዲዮን ይይዛሉ፤ ሁሉም ከዳሽቦርዱ ይታተማሉ።'
			},
			{
				image: shot('golla-design-group', 'services'),
				alt: 'The services page',
				altAm: 'የአገልግሎቶች ገጽ',
				caption:
					'Each service has its own gallery, so the page shows work rather than describing it.',
				captionAm: 'እያንዳንዱ አገልግሎት የራሱ ማዕከለ-ሥዕል አለው፤ ስለዚህ ገጹ ከመግለጽ ይልቅ ሥራ ያሳያል።'
			},
			{
				image: shot('golla-design-group', 'about'),
				alt: 'The about page introducing the practice',
				altAm: 'ድርጅቱን የሚያስተዋውቅ የስለእኛ ገጽ',
				caption: 'Practice, team and approach — a page the studio maintains itself.',
				captionAm: 'ድርጅቱ፣ ቡድኑና አካሄዱ — ስቱዲዮው ራሱ የሚያስተዳድረው ገጽ።'
			},
			{
				image: shot('golla-design-group', 'blogs'),
				alt: 'The blog index',
				altAm: 'የብሎግ ማውጫ',
				caption: 'Categorised writing with galleries and embedded video.',
				captionAm: 'በምድብ የተከፋፈለ ጽሑፍ ከማዕከለ-ሥዕላትና ከተካተተ ቪዲዮ ጋር።'
			},
			{
				image: shot('golla-design-group', 'contact'),
				alt: 'The contact and enquiry page',
				altAm: 'የመገናኛና የጥያቄ ገጽ',
				caption: 'Enquiries become queue items with a status, not emails.',
				captionAm: 'ጥያቄዎች ኢሜይል ሳይሆኑ ሁኔታ ያላቸው የወረፋ ዕቃዎች ይሆናሉ።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'yebehir-events',
		name: 'Yebehir Events',
		nameAm: 'የበሕር ኢቨንትስ',
		client: 'Yebehir',
		clientAm: 'የበሕር',
		summary:
			'An events and venue business online: browsable venues with features and galleries, an events programme, a structured quote request, and a dashboard where every part of it is edited.',
		summaryAm:
			'የዝግጅትና የአዳራሽ ንግድ በመስመር ላይ፦ ባህሪያትና ማዕከለ-ሥዕላት ያሏቸው የሚታዩ አዳራሾች፣ የዝግጅት መርሐ ግብር፣ የተደራጀ የዋጋ ጥያቄ፣ እና ሁሉም የሚስተካከልበት ዳሽቦርድ።',
		industry: 'Events & hospitality',
		industryAm: 'ዝግጅትና እንግዳ አቀባበል',
		year: '2025',
		websiteUrl: 'https://yebehir.com',
		featured: false,
		coverImage: shot('yebehir-events', 'home'),
		coverImageAlt: 'The Yebehir Events home page',
		coverImageAltAm: 'የየበሕር ኢቨንትስ መነሻ ገጽ',
		body: `## Selling something people have to picture

An events business sells an outcome nobody can see in advance. The website's whole job is to let someone picture their wedding, their conference or their launch in a room they have never stood in — and then make asking about it easy enough that they actually do.

## Venues, described properly

A venue is not a photograph and a phone number. Here it carries structured details, a **feature list**, an image gallery and video, so two venues can be compared on the things that decide the booking: capacity, what is included, what is not.

There is a **venue booking** record behind it, and a **venue lottery** — a registration list against a venue, for the promotions this business runs.

## Events and services

An events programme with its own detail pages, and a services catalogue where each service carries its own gallery. Both are ordinary content for the client to publish, which matters because an events business's calendar changes weekly.

## The quote request, which is the real product

Most events sites end at "contact us". This one asks the questions that actually determine a quote: service type, event date, location, guest count and budget range, alongside the description. Each request lands in a dashboard queue with a status.

That single design decision is the difference between an enquiry someone has to chase by phone to make sense of, and one that can be quoted the same day.

## Behind it

Blog with categories and galleries, testimonials, team, a contact inbox, logo management, and role-based permissions with per-user overrides. It runs on SQLite through libSQL — the same reasoning as the other sites of this size: nothing to administer, and a backup is a file copy.`,
		bodyAm: `## ሰዎች መገመት ያለባቸውን ነገር መሸጥ

የዝግጅት ንግድ ማንም አስቀድሞ ሊያየው የማይችለውን ውጤት ይሸጣል። የድረ-ገጹ ሙሉ ሥራ አንድ ሰው ሠርጉን፣ ጉባኤውን ወይም ምረቃውን ገና ባልቆመበት አዳራሽ ውስጥ እንዲገምት ማድረግ ነው — ከዚያም ስለሱ መጠየቅን በእውነት እስኪያደርገው ድረስ ቀላል ማድረግ።

## አዳራሾች፣ በአግባቡ የተገለጹ

አዳራሽ ፎቶና የስልክ ቁጥር አይደለም። እዚህ የተደራጁ ዝርዝሮችን፣ **የባህሪ ዝርዝርን**፣ የምስል ማዕከለ-ሥዕልንና ቪዲዮን ይይዛል፤ ስለዚህ ሁለት አዳራሾች ቦታ ማስያዙን በሚወስኑ ነገሮች ላይ ሊነጻጸሩ ይችላሉ፦ አቅም፣ የተካተተው ምንድን ነው፣ ያልተካተተው ምንድን ነው።

ከኋላው የ**አዳራሽ ቦታ ማስያዝ** መዝገብ አለ፤ እንዲሁም **የአዳራሽ ዕጣ** — በአዳራሽ ላይ የምዝገባ ዝርዝር፤ ይህ ንግድ ለሚያካሂዳቸው ማስተዋወቂያዎች።

## ዝግጅቶችና አገልግሎቶች

የራሱ ዝርዝር ገጾች ያሉት የዝግጅት መርሐ ግብር፣ እና እያንዳንዱ አገልግሎት የራሱ ማዕከለ-ሥዕል የያዘበት የአገልግሎት ካታሎግ። ሁለቱም ደንበኛው የሚያትማቸው ተራ ይዘቶች ናቸው፤ ይህም አስፈላጊ ነው ምክንያቱም የዝግጅት ንግድ የቀን መቁጠሪያ በየሳምንቱ ስለሚለወጥ።

## የዋጋ ጥያቄው፣ እውነተኛው ምርት

አብዛኞቹ የዝግጅት ገጾች በ"ያግኙን" ያበቃሉ። ይህኛው ግን ዋጋን በእውነት የሚወስኑትን ጥያቄዎች ይጠይቃል፦ የአገልግሎት ዓይነት፣ የዝግጅቱ ቀን፣ ቦታ፣ የእንግዳ ብዛትና የበጀት ክልል፤ ከመግለጫው ጋር። እያንዳንዱ ጥያቄ ሁኔታ ወዳለው የዳሽቦርድ ወረፋ ይገባል።

ያ አንድ የንድፍ ውሳኔ በስልክ ተከታትሎ ማብራራት በሚያስፈልገው ጥያቄና በዚያኑ ቀን ዋጋ ሊሰጠው በሚችል ጥያቄ መካከል ያለው ልዩነት ነው።

## ከኋላው

ከምድቦችና ከማዕከለ-ሥዕላት ጋር ብሎግ፣ ምስክርነቶች፣ ቡድን፣ የመገናኛ ሳጥን፣ የአርማ አስተዳደር፣ እና በተጠቃሚ ደረጃ ሊሻሻሉ የሚችሉ በሚና ላይ የተመሠረቱ ፈቃዶች።`,
		services: [
			{
				label: 'Venue catalogue with features & galleries',
				labelAm: 'ከባህሪያትና ማዕከለ-ሥዕላት ጋር የአዳራሽ ካታሎግ'
			},
			{ label: 'Events programme', labelAm: 'የዝግጅት መርሐ ግብር' },
			{ label: 'Structured quote requests', labelAm: 'የተደራጀ የዋጋ ጥያቄ' },
			{ label: 'Venue booking & lottery registration', labelAm: 'የአዳራሽ ቦታ ማስያዝና የዕጣ ምዝገባ' },
			{ label: 'Blog, testimonials & team', labelAm: 'ብሎግ፣ ምስክርነቶችና ቡድን' },
			{ label: 'Roles & special permissions', labelAm: 'ሚናዎችና ልዩ ፈቃዶች' }
		],
		outcomes: [
			{
				value: '6',
				label: 'Facts captured before a quote is asked for',
				labelAm: 'ዋጋ ከመጠየቁ በፊት የሚያዙ ስድስት እውነታዎች'
			},
			{ value: '0', label: 'Enquiries without a status', labelAm: 'ሁኔታ የሌላቸው ጥያቄዎች የሉም' },
			{
				value: '27',
				label: 'Tables behind a site the client edits alone',
				labelAm: 'ደንበኛው ብቻውን በሚያስተካክለው ገጽ ኋላ 27 ሠንጠረዦች'
			}
		],
		images: [
			{
				image: shot('yebehir-events', 'home'),
				alt: 'Yebehir Events home page',
				altAm: 'የየበሕር ኢቨንትስ መነሻ ገጽ',
				caption: 'The front page has one job: make someone picture their event here.',
				captionAm: 'የመጀመሪያው ገጽ አንድ ሥራ አለው፦ አንድ ሰው ዝግጅቱን እዚህ እንዲገምት ማድረግ።'
			},
			{
				image: shot('yebehir-events', 'venues'),
				alt: 'The venue listing',
				altAm: 'የአዳራሾች ዝርዝር',
				caption: 'Venues carry structured features, so two of them can actually be compared.',
				captionAm: 'አዳራሾች የተደራጁ ባህሪያትን ይይዛሉ፤ ስለዚህ ሁለቱ በእውነት ሊነጻጸሩ ይችላሉ።'
			},
			{
				image: shot('yebehir-events', 'events'),
				alt: 'The events programme',
				altAm: 'የዝግጅት መርሐ ግብር',
				caption: 'A calendar the client publishes weekly without touching code.',
				captionAm: 'ደንበኛው ኮድ ሳይነካ በየሳምንቱ የሚያትመው የቀን መቁጠሪያ።'
			},
			{
				image: shot('yebehir-events', 'quote'),
				alt: 'The structured quote request form',
				altAm: 'የተደራጀ የዋጋ ጥያቄ ቅጽ',
				caption:
					'Date, location, guest count and budget — asked up front, so a quote can be written the same day.',
				captionAm: 'ቀን፣ ቦታ፣ የእንግዳ ብዛትና በጀት — አስቀድመው ይጠየቃሉ፤ ስለዚህ ዋጋ በዚያኑ ቀን ሊጻፍ ይችላል።'
			},
			{
				image: shot('yebehir-events', 'services'),
				alt: 'The services catalogue',
				altAm: 'የአገልግሎት ካታሎግ',
				caption: 'Each service carries its own gallery of past work.',
				captionAm: 'እያንዳንዱ አገልግሎት የራሱን ያለፈ ሥራ ማዕከለ-ሥዕል ይይዛል።'
			},
			{
				image: shot('yebehir-events', 'about'),
				alt: 'The about page',
				altAm: 'የስለእኛ ገጽ',
				caption: 'Company story, team and testimonials, all dashboard-managed.',
				captionAm: 'የኩባንያ ታሪክ፣ ቡድንና ምስክርነቶች፤ ሁሉም በዳሽቦርድ የሚተዳደሩ።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'fahem-general-trading',
		name: 'Fahem General Trading',
		nameAm: 'ፋሔም ጀነራል ትሬዲንግ',
		client: 'Fahem General Trading',
		clientAm: 'ፋሔም ጀነራል ትሬዲንግ',
		summary:
			'A coffee exporter’s corporate site built entirely on editable content: origins, farms, traceability steps, export markets, ventures and milestones are all database rows, not hardcoded pages.',
		summaryAm:
			'ሙሉ በሙሉ ሊስተካከል በሚችል ይዘት ላይ የተገነባ የቡና ላኪ የድርጅት ገጽ፦ መገኛዎች፣ እርሻዎች፣ የክትትል ደረጃዎች፣ የወጪ ንግድ ገበያዎች፣ ንግዶችና ምዕራፎች በሙሉ በኮድ የተጻፉ ገጾች ሳይሆኑ የመረጃ ቋት ረድፎች ናቸው።',
		industry: 'Coffee export & agriculture',
		industryAm: 'የቡና ወጪ ንግድና ግብርና',
		year: '2025',
		websiteUrl: 'https://fahemgeneraltrading.com',
		featured: false,
		coverImage: shot('fahem-general-trading', 'home'),
		coverImageAlt: 'The Fahem General Trading home page showing coffee cherries being sorted',
		coverImageAltAm: 'የቡና ፍሬዎች ሲለዩ የሚያሳይ የፋሔም ጀነራል ትሬዲንግ መነሻ ገጽ',
		body: `## What a coffee exporter's website is for

An Ethiopian coffee exporter is not selling to walk-in customers. The audience is a small number of foreign buyers who are deciding whether to trust a supplier they have never met, from a country they may never visit, with a container of something whose quality they cannot verify until it lands.

That makes the website an act of proof, not persuasion. The build is organised around the specific things a buyer checks.

## The content model

Every one of these is a table the client edits:

- **Coffee regions and sub-regions** — Jimma, Limu, and the growing areas beneath them, each with its own profile.
- **Coffee products** — grades and lots, tied to where they came from.
- **Farms** — the actual sources, with their own pages.
- **Traceability steps** — the chain from cherry to container, laid out as ordered stages. This is the section that answers the buyer's real question.
- **Export markets** — where the company already ships, which is itself a credential.
- **Ventures** — the group's other businesses.
- **Milestones** — the company timeline.
- **Value propositions, partners, FAQs, gallery and testimonials.**

Alongside those: page heroes and site settings, so the headline image and the contact details on any page are content rather than code.

## Why it was built this way

The alternative — a designer's static pages — would have been faster to ship and wrong within a season. Harvests change, grades change, markets are added. A site that cannot keep up with the crop year stops being used, and an exporter's website that says last year's harvest is worse than no website at all.

## The dashboard

Every section above has a management screen, with an image gallery, role-based permissions, per-user overrides, a message inbox from the contact form and email notification through Nodemailer.`,
		bodyAm: `## የቡና ላኪ ድረ-ገጽ ለምንድን ነው

የኢትዮጵያ ቡና ላኪ ለመንገደኛ ደንበኞች አይሸጥም። ተመልካቾቹ ገና ያላገኙትን አቅራቢ፣ ምናልባትም ፈጽሞ ከማይጎበኙት አገር፣ እስኪደርስ ድረስ ጥራቱን ማረጋገጥ የማይችሉትን ሙሉ ኮንቴይነር ማመን አለማመናቸውን የሚወስኑ ጥቂት የውጭ ገዢዎች ናቸው።

ይህም ድረ-ገጹን የማሳመን ሳይሆን የማረጋገጥ ተግባር ያደርገዋል። ግንባታውም ገዢ በሚመረምራቸው ልዩ ነገሮች ዙሪያ ተደራጅቷል።

## የይዘት ሞዴሉ

ከእነዚህ እያንዳንዱ ደንበኛው የሚያስተካክለው ሠንጠረዥ ነው፦

- **የቡና ክልሎችና ንዑስ ክልሎች** — ጅማ፣ ሊሙ፣ እና ከሥራቸው ያሉት የማምረቻ አካባቢዎች፤ እያንዳንዱ የራሱ መገለጫ ያለው።
- **የቡና ምርቶች** — ደረጃዎችና ዓይነቶች፣ ከመጡበት ቦታ ጋር የተሳሰሩ።
- **እርሻዎች** — እውነተኛዎቹ ምንጮች፣ የራሳቸው ገጽ ያላቸው።
- **የክትትል ደረጃዎች** — ከፍሬ እስከ ኮንቴይነር ያለው ሰንሰለት፣ በተደረደሩ ደረጃዎች የቀረበ። ይህ የገዢውን እውነተኛ ጥያቄ የሚመልስ ክፍል ነው።
- **የወጪ ንግድ ገበያዎች** — ኩባንያው አስቀድሞ የሚልክባቸው ቦታዎች፤ ይህ ራሱ ማረጋገጫ ነው።
- **ንግዶች** — የቡድኑ ሌሎች ንግዶች።
- **ምዕራፎች** — የኩባንያው የጊዜ ሰሌዳ።
- **የእሴት አቅርቦቶች፣ አጋሮች፣ ተደጋጋሚ ጥያቄዎች፣ ማዕከለ-ሥዕልና ምስክርነቶች።**

ከእነዚህ ጎን፦ የገጽ ራስጌዎችና የገጽ ቅንብሮች፤ ስለዚህ የማንኛውም ገጽ ዋና ምስልና የመገናኛ ዝርዝሮች ኮድ ሳይሆኑ ይዘት ናቸው።

## ለምን እንዲህ ተገነባ

አማራጩ — የንድፍ ባለሙያ የማይለወጡ ገጾች — ለማውጣት ፈጣን ሆኖ በአንድ ወቅት ውስጥ ስሕተት ይሆን ነበር። ምርት ይለወጣል፣ ደረጃዎች ይለወጣሉ፣ ገበያዎች ይጨመራሉ። ከምርት ዓመቱ ጋር መራመድ የማይችል ገጽ መጠቀሙ ያበቃል፤ የላለፈውን ዓመት ምርት የሚናገር የላኪ ድረ-ገጽ ደግሞ ከምንም ገጽ የከፋ ነው።

## ዳሽቦርዱ

ከላይ ያለው እያንዳንዱ ክፍል የአስተዳደር ገጽ አለው፤ ከምስል ማዕከለ-ሥዕል፣ በሚና ላይ ከተመሠረቱ ፈቃዶች፣ በተጠቃሚ ደረጃ ማሻሻያዎች፣ ከመገናኛ ቅጽ ከሚመጣ የመልእክት ሳጥንና በNodemailer በኩል ከኢሜይል ማሳወቂያ ጋር።`,
		services: [
			{ label: 'Content-modelled corporate site', labelAm: 'በይዘት ሞዴል የተሠራ የድርጅት ገጽ' },
			{ label: 'Origin, farm & traceability pages', labelAm: 'የመገኛ፣ የእርሻና የክትትል ገጾች' },
			{ label: 'Export market & partner directory', labelAm: 'የወጪ ንግድ ገበያና የአጋር ማውጫ' },
			{ label: 'Ventures & company timeline', labelAm: 'ንግዶችና የኩባንያ የጊዜ ሰሌዳ' },
			{ label: 'Enquiry inbox & email notification', labelAm: 'የጥያቄ ሳጥንና የኢሜይል ማሳወቂያ' },
			{ label: 'Roles & permissions', labelAm: 'ሚናዎችና ፈቃዶች' }
		],
		outcomes: [
			{
				value: '14',
				label: 'Content types the client edits without a developer',
				labelAm: 'ደንበኛው ያለ ገንቢ የሚያስተካክላቸው 14 የይዘት ዓይነቶች'
			},
			{
				value: '0',
				label: 'Hardcoded pages to update at harvest',
				labelAm: 'በምርት ወቅት የሚዘመኑ በኮድ የተጻፉ ገጾች የሉም'
			},
			{
				value: '1',
				label: 'Traceability chain, shown as ordered stages',
				labelAm: 'አንድ የክትትል ሰንሰለት፤ በተደረደሩ ደረጃዎች የቀረበ'
			}
		],
		images: [
			{
				image: shot('fahem-general-trading', 'home'),
				alt: 'Fahem General Trading home page with coffee cherries',
				altAm: 'ከቡና ፍሬዎች ጋር የፋሔም ጀነራል ትሬዲንግ መነሻ ገጽ',
				caption:
					'The hero image, headline and call to action are all site settings the client controls.',
				captionAm: 'ዋናው ምስል፣ አርዕስቱና የድርጊት ጥሪው በሙሉ ደንበኛው የሚቆጣጠራቸው የገጽ ቅንብሮች ናቸው።'
			},
			{
				image: shot('fahem-general-trading', 'coffee'),
				alt: 'The coffee page showing grades and growing regions',
				altAm: 'ደረጃዎችንና የማምረቻ ክልሎችን የሚያሳይ የቡና ገጽ',
				caption:
					'Products tie back to their region, sub-region and farm — the chain a buyer asks about.',
				captionAm: 'ምርቶች ወደ ክልላቸው፣ ንዑስ ክልላቸውና እርሻቸው ይመለሳሉ — ገዢ የሚጠይቀው ሰንሰለት።'
			},
			{
				image: shot('fahem-general-trading', 'ventures'),
				alt: 'The ventures page listing the group’s businesses',
				altAm: 'የቡድኑን ንግዶች የሚዘረዝር የንግዶች ገጽ',
				caption: 'The wider group, kept current as a table rather than rewritten as a page.',
				captionAm: 'ሰፊው ቡድን፤ እንደ ገጽ ከመጻፍ ይልቅ እንደ ሠንጠረዥ የሚዘመን።'
			},
			{
				image: shot('fahem-general-trading', 'about'),
				alt: 'The about page with the company timeline',
				altAm: 'ከኩባንያ የጊዜ ሰሌዳ ጋር የስለእኛ ገጽ',
				caption:
					'Milestones, value propositions and partners — three separate content types on one page.',
				captionAm: 'ምዕራፎች፣ የእሴት አቅርቦቶችና አጋሮች — በአንድ ገጽ ላይ ሦስት የተለያዩ የይዘት ዓይነቶች።'
			},
			{
				image: shot('fahem-general-trading', 'contact'),
				alt: 'The contact page',
				altAm: 'የመገናኛ ገጽ',
				caption: 'Enquiries reach a dashboard inbox and an email notification at the same time.',
				captionAm: 'ጥያቄዎች በአንድ ጊዜ ወደ ዳሽቦርድ ሳጥንና ወደ ኢሜይል ማሳወቂያ ይደርሳሉ።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'lalo-group',
		name: 'Lalo Group',
		nameAm: 'ላሎ ግሩፕ',
		client: 'Lalo Group',
		clientAm: 'ላሎ ግሩፕ',
		summary:
			'The parent company site for a group with several trading subsidiaries — built on the same editable content model as its sister sites, so the group page and the businesses under it stay in step.',
		summaryAm:
			'በርካታ የንግድ ንዑስ ኩባንያዎች ላሉት ቡድን የተሠራ የእናት ኩባንያ ገጽ — ከእህት ገጾቹ ጋር በተመሳሳይ ሊስተካከል በሚችል የይዘት ሞዴል ላይ የተገነባ።',
		industry: 'Diversified trading group',
		industryAm: 'የተለያየ ዘርፍ ያለው የንግድ ቡድን',
		year: '2025',
		websiteUrl: 'https://main.lalobakerysolutions.com',
		featured: false,
		coverImage: shot('lalo-group', 'home'),
		coverImageAlt: 'The Lalo Group home page',
		coverImageAltAm: 'የላሎ ግሩፕ መነሻ ገጽ',
		body: `## The problem with a group site

A holding company's website has an awkward job. It must say something meaningful about a group whose actual work happens in its subsidiaries, without either repeating those subsidiaries' sites or becoming a directory of links nobody clicks.

The resolution here was to make the group site the place where the *shape* of the group is expressed — subsidiaries, markets, scale, history and partners — and let each business speak for itself elsewhere.

## What it holds

**Subsidiaries** as first-class content, each with its own entry, rather than a paragraph on an about page.

**Coffee regions and export markets**, shared with the group's trading arm, so the same source data describes the same facts in both places.

**Company stats and milestones** — the numbers and the timeline a buyer or a partner looks for.

**Value propositions, partners, traceability, FAQs, testimonials and a gallery**, all managed the same way.

**Page heroes and page sections**, which is the part that matters most: the structure of a page is itself data. A new section on the home page is a row, not a deployment.

## Shared foundations

This site and its sister sites were built from one set of decisions — the same content model, the same dashboard patterns, the same role and permission system, the same upload handling with browser-side image compression. That is deliberate. A group running several sites should not be paying to have the same admin screen designed five times, and the staff who move between them should not have to learn five interfaces.`,
		bodyAm: `## የቡድን ገጽ ችግር

የይዞታ ኩባንያ ድረ-ገጽ አስቸጋሪ ሥራ አለው። እውነተኛ ሥራው በንዑስ ኩባንያዎቹ ውስጥ ስለሚከናወን ስለ ቡድኑ ትርጉም ያለው ነገር መናገር አለበት፤ ያለ የእነዚያን ገጾች መድገም ወይም ማንም የማይጫነው የአገናኝ ማውጫ መሆን።

እዚህ ላይ የተገኘው መፍትሔ የቡድን ገጹን የቡድኑ *መዋቅር* የሚገለጽበት ቦታ ማድረግ ነበር — ንዑስ ኩባንያዎች፣ ገበያዎች፣ መጠን፣ ታሪክና አጋሮች — እያንዳንዱ ንግድ ደግሞ በሌላ ቦታ ስለራሱ እንዲናገር።

## ምን ይይዛል

**ንዑስ ኩባንያዎች** በስለእኛ ገጽ ላይ እንደ አንቀጽ ሳይሆን እያንዳንዳቸው የራሳቸው ግቤት ያላቸው ቀዳሚ ይዘት ሆነው።

**የቡና ክልሎችና የወጪ ንግድ ገበያዎች**፣ ከቡድኑ የንግድ ክንፍ ጋር የሚጋሩ፤ ስለዚህ ተመሳሳዩ ምንጭ መረጃ በሁለቱም ቦታዎች ተመሳሳዮቹን እውነታዎች ይገልጻል።

**የኩባንያ አኃዞችና ምዕራፎች** — ገዢ ወይም አጋር የሚፈልጋቸው ቁጥሮችና የጊዜ ሰሌዳ።

**የእሴት አቅርቦቶች፣ አጋሮች፣ ክትትል፣ ተደጋጋሚ ጥያቄዎች፣ ምስክርነቶችና ማዕከለ-ሥዕል**፣ ሁሉም በተመሳሳይ መንገድ የሚተዳደሩ።

**የገጽ ራስጌዎችና የገጽ ክፍሎች**፣ ይህም በጣም አስፈላጊው ክፍል ነው፦ የገጽ መዋቅሩ ራሱ መረጃ ነው። በመነሻ ገጽ ላይ አዲስ ክፍል ማሰማራት ሳይሆን ረድፍ ነው።

## የጋራ መሠረቶች

ይህ ገጽና እህት ገጾቹ ከአንድ የውሳኔ ስብስብ ተገንብተዋል — ተመሳሳዩ የይዘት ሞዴል፣ ተመሳሳዮቹ የዳሽቦርድ ዘይቤዎች፣ ተመሳሳዩ የሚናና የፈቃድ ሥርዓት፣ ተመሳሳዩ የመጫን አያያዝ። ይህ ሆን ተብሎ ነው። በርካታ ገጾችን የሚያንቀሳቅስ ቡድን ተመሳሳዩ የአስተዳደር ገጽ አምስት ጊዜ እንዲነደፍ መክፈል የለበትም።`,
		services: [
			{ label: 'Group & subsidiary content model', labelAm: 'የቡድንና የንዑስ ኩባንያ የይዘት ሞዴል' },
			{ label: 'Data-driven page sections', labelAm: 'በመረጃ የሚመሩ የገጽ ክፍሎች' },
			{ label: 'Company stats & milestones', labelAm: 'የኩባንያ አኃዞችና ምዕራፎች' },
			{ label: 'Shared design system across group sites', labelAm: 'በቡድኑ ገጾች ላይ የጋራ የንድፍ ሥርዓት' },
			{ label: 'Enquiry inbox', labelAm: 'የጥያቄ ሳጥን' }
		],
		outcomes: [
			{
				value: '16',
				label: 'Content tables, no hardcoded page',
				labelAm: '16 የይዘት ሠንጠረዦች፤ በኮድ የተጻፈ ገጽ የለም'
			},
			{
				value: '1',
				label: 'Design system across the group’s sites',
				labelAm: 'በቡድኑ ገጾች ላይ አንድ የንድፍ ሥርዓት'
			},
			{
				value: '0',
				label: 'Deployments to add a home page section',
				labelAm: 'የመነሻ ገጽ ክፍል ለመጨመር ማሰማራት አያስፈልግም'
			}
		],
		images: [
			{
				image: shot('lalo-group', 'home'),
				alt: 'Lalo Group home page',
				altAm: 'የላሎ ግሩፕ መነሻ ገጽ',
				caption:
					'The page structure itself is data: sections are rows, ordered from the dashboard.',
				captionAm: 'የገጹ መዋቅር ራሱ መረጃ ነው፦ ክፍሎች ከዳሽቦርዱ የሚደረደሩ ረድፎች ናቸው።'
			},
			{
				image: shot('lalo-group', 'subsidiaries'),
				alt: 'The subsidiaries page',
				altAm: 'የንዑስ ኩባንያዎች ገጽ',
				caption: 'Each business in the group is its own content entry, not a paragraph.',
				captionAm: 'በቡድኑ ውስጥ ያለ እያንዳንዱ ንግድ አንቀጽ ሳይሆን የራሱ የይዘት ግቤት ነው።'
			},
			{
				image: shot('lalo-group', 'about'),
				alt: 'The about page with milestones and stats',
				altAm: 'ከምዕራፎችና ከአኃዞች ጋር የስለእኛ ገጽ',
				caption: 'Stats, milestones and partners — the credentials a group site exists to carry.',
				captionAm: 'አኃዞች፣ ምዕራፎችና አጋሮች — የቡድን ገጽ ሊሸከማቸው የሚኖረው ማረጋገጫዎች።'
			},
			{
				image: shot('lalo-group', 'contact'),
				alt: 'The contact page',
				altAm: 'የመገናኛ ገጽ',
				caption: 'One inbox for the group, with the same message handling as its sister sites.',
				captionAm: 'ለቡድኑ አንድ ሳጥን፤ ከእህት ገጾቹ ጋር በተመሳሳይ የመልእክት አያያዝ።'
			}
		]
	},

	// -------------------------------------------------------------------------
	{
		slug: 'lalo-fixtec',
		name: 'Lalo Fixtec',
		nameAm: 'ላሎ ፊክስቴክ',
		client: 'Lalo Fixtec',
		clientAm: 'ላሎ ፊክስቴክ',
		summary:
			'A B2B tools and equipment distributor online: an industry-segmented catalogue, trade customer accounts, and the same stock, supplier and order back office as its sister trading businesses.',
		summaryAm:
			'የመሣሪያና የዕቃ አከፋፋይ በመስመር ላይ፦ በኢንዱስትሪ የተከፋፈለ ካታሎግ፣ የንግድ ደንበኛ መለያዎች፣ እና ከእህት ንግዶቹ ጋር ተመሳሳይ የክምችት፣ የአቅራቢና የትዕዛዝ ጀርባ ቢሮ።',
		industry: 'Industrial tools & equipment distribution',
		industryAm: 'የኢንዱስትሪ መሣሪያና ዕቃ ስርጭት',
		year: '2025',
		websiteUrl: 'https://fixtec.lalobakerysolutions.com',
		featured: false,
		coverImage: shot('lalo-fixtec', 'home'),
		coverImageAlt: 'The Lalo Fixtec home page showing power tools',
		coverImageAltAm: 'የኃይል መሣሪያዎችን የሚያሳይ የላሎ ፊክስቴክ መነሻ ገጽ',
		body: `## Selling tools to businesses, not to hobbyists

Fixtec distributes professional-grade mechanical tools and bulk supply to infrastructure, industrial and distribution operations. The customer is a procurement officer with a project and a deadline, not someone browsing.

That changes what the site has to do. A procurement officer does not want to be sold to; they want to establish, quickly, that the supplier stocks what they need, in the quantity they need, and will still exist in six months.

## The catalogue

Products with categories, images and **priced ranges** — the same model as the group's other trading site, because a tool sold in three pack sizes has three prices, and flattening that into one number is how a quote goes wrong.

**An industries page**, which is the segmentation that actually matters here: buyers arrive knowing their sector, not the manufacturer's product taxonomy. A **new arrivals** section keeps the returning buyer's visit worthwhile.

## Trade accounts

Customers get real accounts — sign-up, sign-in, password reset, saved delivery addresses, an order history and a settings page. For a repeat trade buyer, order history is the feature: last quarter's order is next quarter's order.

## The back office

Products, categories, suppliers and a stock ledger built from signed adjustments with reasons attached; damaged stock recorded rather than silently deducted; orders across all states with their customers, items and payment methods; customer records with full history; discounts and delivery pricing; reports; and roles with per-user permission overrides.

## Shared foundations

This is deliberately the same system as Lalo Bakery Solutions, wearing different clothes. Two trading businesses in one group with the same operational shape — catalogue, stock, orders, customers — should not be two codebases. What differs is the segmentation, the branding and the catalogue; what is shared is everything that would otherwise be built and debugged twice.`,
		bodyAm: `## መሣሪያዎችን ለንግዶች እንጂ ለተራ ተጠቃሚዎች አለመሸጥ

ፊክስቴክ ለመሠረተ ልማት፣ ለኢንዱስትሪና ለስርጭት ሥራዎች ሙያዊ ደረጃ ያላቸውን ሜካኒካል መሣሪያዎችና የጅምላ አቅርቦት ያከፋፍላል። ደንበኛው ፕሮጀክትና የጊዜ ገደብ ያለው የግዥ ኃላፊ እንጂ የሚያስስ ሰው አይደለም።

ይህ ገጹ ማድረግ ያለበትን ይለውጣል። የግዥ ኃላፊ እንዲሸጥለት አይፈልግም፤ አቅራቢው የሚፈልገውን፣ በሚፈልገው መጠን እንደሚይዝና ከስድስት ወር በኋላም እንደሚኖር በፍጥነት ማረጋገጥ ይፈልጋል።

## ካታሎጉ

ምርቶች ከምድቦች፣ ከምስሎችና ከ**ዋጋ ካላቸው መጠኖች** ጋር — ከቡድኑ ሌላ የንግድ ገጽ ጋር ተመሳሳይ ሞዴል፤ ምክንያቱም በሦስት የማሸጊያ መጠኖች የሚሸጥ መሣሪያ ሦስት ዋጋ አለው፤ ያንን ወደ አንድ ቁጥር ማጠፍም ዋጋ የሚሳሳትበት መንገድ ነው።

**የኢንዱስትሪዎች ገጽ**፣ እዚህ ላይ በእውነት አስፈላጊው ክፍፍል ይህ ነው፦ ገዢዎች የአምራቹን የምርት ምድብ ሳይሆን ዘርፋቸውን አውቀው ይመጣሉ። **አዲስ የገቡ** ክፍልም የተመላሽ ገዢን ጉብኝት ዋጋ ያለው ያደርገዋል።

## የንግድ መለያዎች

ደንበኞች እውነተኛ መለያ ያገኛሉ — ምዝገባ፣ መግቢያ፣ የይለፍ ቃል ማደሻ፣ የተቀመጡ የማድረሻ አድራሻዎች፣ የትዕዛዝ ታሪክና የቅንብር ገጽ። ለተደጋጋሚ የንግድ ገዢ የትዕዛዝ ታሪክ ራሱ ጠቀሜታው ነው፦ የላለፈው ሩብ ዓመት ትዕዛዝ የሚቀጥለው ሩብ ዓመት ትዕዛዝ ነው።

## የጀርባ ቢሮው

ምርቶች፣ ምድቦች፣ አቅራቢዎችና ምክንያት ከተያያዘላቸው ምልክት ካላቸው ማስተካከያዎች የተገነባ የክምችት መዝገብ፤ የተበላሸ ክምችት በዝምታ ከመቀነስ ይልቅ የሚመዘገብ፤ በሁሉም ሁኔታዎች ውስጥ ያሉ ትዕዛዞች ከደንበኞቻቸው፣ ከዕቃዎቻቸውና ከክፍያ ዘዴዎቻቸው ጋር፤ ሙሉ ታሪክ ያላቸው የደንበኛ መዝገቦች፤ ቅናሾችና የማድረሻ ዋጋ፤ ሪፖርቶች፤ እና በተጠቃሚ ደረጃ ሊሻሻሉ ከሚችሉ ፈቃዶች ጋር ሚናዎች።

## የጋራ መሠረቶች

ይህ ሆን ተብሎ ከላሎ ቤከሪ ሶሉሽንስ ጋር ተመሳሳይ ሥርዓት ነው፤ የተለየ ልብስ የለበሰ። ተመሳሳይ የሥራ መዋቅር ያላቸው በአንድ ቡድን ውስጥ ያሉ ሁለት የንግድ ድርጅቶች — ካታሎግ፣ ክምችት፣ ትዕዛዞች፣ ደንበኞች — ሁለት የተለያዩ ኮዶች መሆን የለባቸውም።`,
		services: [
			{ label: 'Industry-segmented B2B catalogue', labelAm: 'በኢንዱስትሪ የተከፋፈለ የንግድ ካታሎግ' },
			{ label: 'Trade accounts & order history', labelAm: 'የንግድ መለያዎችና የትዕዛዝ ታሪክ' },
			{ label: 'Inventory & supplier management', labelAm: 'የክምችትና የአቅራቢ አስተዳደር' },
			{ label: 'Order pipeline & fulfilment', labelAm: 'የትዕዛዝ ሂደትና አቅርቦት' },
			{ label: 'Discounts & delivery pricing', labelAm: 'ቅናሾችና የማድረሻ ዋጋ' },
			{ label: 'Reporting & permissions', labelAm: 'ሪፖርትና ፈቃዶች' }
		],
		outcomes: [
			{
				value: '2',
				label: 'Trading businesses on one shared codebase',
				labelAm: 'በአንድ የጋራ ኮድ ላይ ሁለት የንግድ ድርጅቶች'
			},
			{
				value: '1',
				label: 'Stock ledger, from purchase to sale to wastage',
				labelAm: 'ከግዥ እስከ ሽያጭ እስከ ብክነት አንድ የክምችት መዝገብ'
			},
			{
				value: '3',
				label: 'Ways to find a product — industry, category, new arrivals',
				labelAm: 'ምርት ለማግኘት ሦስት መንገዶች'
			}
		],
		images: [
			{
				image: shot('lalo-fixtec', 'home'),
				alt: 'Lalo Fixtec home page showing professional power tools',
				altAm: 'ሙያዊ የኃይል መሣሪያዎችን የሚያሳይ የላሎ ፊክስቴክ መነሻ ገጽ',
				caption:
					'Positioned at procurement officers, not browsers: reliability and range before price.',
				captionAm: 'ለግዥ ኃላፊዎች የተነጣጠረ እንጂ ለተመልካቾች አይደለም፦ ከዋጋ በፊት አስተማማኝነትና ስፋት።'
			},
			{
				image: shot('lalo-fixtec', 'shop'),
				alt: 'The product catalogue',
				altAm: 'የምርት ካታሎግ',
				caption:
					'Products carry priced ranges, because a tool sold in three pack sizes has three prices.',
				captionAm: 'ምርቶች ዋጋ ያላቸው መጠኖችን ይይዛሉ፤ ምክንያቱም በሦስት መጠኖች የሚሸጥ መሣሪያ ሦስት ዋጋ አለው።'
			},
			{
				image: shot('lalo-fixtec', 'industries'),
				alt: 'The industries page segmenting products by sector',
				altAm: 'ምርቶችን በዘርፍ የሚከፋፍል የኢንዱስትሪዎች ገጽ',
				caption: 'Buyers arrive knowing their sector, not the manufacturer’s product taxonomy.',
				captionAm: 'ገዢዎች የአምራቹን የምርት ምድብ ሳይሆን ዘርፋቸውን አውቀው ይመጣሉ።'
			},
			{
				image: shot('lalo-fixtec', 'new-arrival'),
				alt: 'The new arrivals page',
				altAm: 'የአዲስ የገቡ ምርቶች ገጽ',
				caption: 'What makes a repeat buyer’s visit worth making.',
				captionAm: 'የተመላሽ ገዢን ጉብኝት ዋጋ ያለው የሚያደርገው።'
			},
			{
				image: shot('lalo-fixtec', 'about'),
				alt: 'The about page',
				altAm: 'የስለእኛ ገጽ',
				caption: 'Supply reliability is the pitch, so the about page is a credential, not a story.',
				captionAm: 'የአቅርቦት አስተማማኝነት ዋናው መከራከሪያ ነው፤ ስለዚህ የስለእኛ ገጽ ታሪክ ሳይሆን ማረጋገጫ ነው።'
			},
			{
				image: shot('lalo-fixtec', 'contact'),
				alt: 'The contact page',
				altAm: 'የመገናኛ ገጽ',
				caption: 'Corporate profile requests and enquiries land in the same dashboard queue.',
				captionAm: 'የድርጅት መገለጫ ጥያቄዎችና ሌሎች ጥያቄዎች በአንድ የዳሽቦርድ ወረፋ ውስጥ ይደርሳሉ።'
			}
		]
	}
];
