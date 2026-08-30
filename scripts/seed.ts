/**
 * Seed content.
 *
 * The site has no admin dashboard yet, so this script is how the first posts
 * and case studies get in. It is idempotent — every row is keyed by slug and
 * upserted — so it can be re-run after an edit without duplicating anything or
 * needing the database dropped.
 *
 *   npx tsx scripts/seed.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { marked } from 'marked';
import * as schema from '../src/lib/server/db/schema';

/**
 * Bodies are authored as markdown in this file and stored as HTML.
 *
 * The database column holds HTML, because that is what the dashboard's WYSIWYG
 * editor produces and what `renderRichText` sanitises on the way out. Writing
 * a thousand-word case study as HTML string literals here would be unreadable
 * and undiffable, so the seed authors in markdown and converts on write — the
 * conversion happens once, at seed time, never at render.
 */
const html = (markdown: string) => marked.parse(markdown, { async: false }) as string;

const { posts, projects, projectServices, projectOutcomes } = schema;

const client = mysql.createPool(process.env.DATABASE_URL!);
const db = drizzle(client, { schema, mode: 'default' });

const spotless = {
	slug: 'spotless-enterprise-erp',
	name: 'Spotless Enterprise ERP',
	nameAm: 'የስፖትለስ የድርጅት ኢአርፒ',
	client: 'Spotless',
	clientAm: 'ስፖትለስ',
	summary:
		'An end-to-end ERP for a contract workforce and property management business, unifying multi-branch scheduling, high-volume personnel tracking and payroll into one system.',
	summaryAm:
		'ለኮንትራት የሰው ኃይልና የንብረት አስተዳደር ንግድ የተሠራ ሙሉ ኢአርፒ፤ የበርካታ ቅርንጫፍ መርሐ ግብር፣ ከፍተኛ ቁጥር ያለው የሠራተኛ ክትትልና ደመወዝን በአንድ ሥርዓት ያዋሕዳል።',
	industry: 'Contract workforce & property management',
	industryAm: 'የኮንትራት የሰው ኃይልና የንብረት አስተዳደር',
	year: '2025',
	status: 'published' as const,
	featured: true,
	sortOrder: 0,
	body: `## What Spotless needed

Spotless places security and cleaning personnel on client sites across Addis Ababa, and manages property logistics alongside it. Both halves of that business are people-heavy and site-heavy: hundreds of contract staff, each assigned to a client site, on a shift pattern, at a rate that depends on the contract they sit under.

Before the deployment, that reality lived in spreadsheets and in the heads of the people who maintained them. Attendance came in per site. Payroll was assembled from it by hand each cycle. A client asking "who was on my site last Thursday" was a question that took someone an afternoon.

## What we built

A single ERP covering the operation end to end:

- **Personnel tracking** at the volume the business actually runs at, with each staff member tied to a site, a shift and a contract rate.
- **Payroll** built from the attendance the system already holds, rather than re-entered from it.
- **Client CRM** so every contract, site and point of contact is one record instead of a folder.
- **Operational scheduling** across branches, with the coverage gaps visible before they become a client's complaint rather than after.
- **Workflow approvals**, so a rate change or a placement is signed off by the person accountable for it.

Alongside the ERP we delivered the digital assets around it — a professional business website and the automated tools that connect to the same data.

## What changed

The administrative bottleneck was the point of the project, and it is gone. Attendance no longer has to be transcribed to become payroll; it already is payroll. The manual tracking errors that came from copying figures between sheets do not have a step to occur in any more.

The part that matters most for Spotless is capacity: the operation can take on more sites without adding the administrative headcount that used to scale alongside them.`,
	bodyAm: `## ስፖትለስ የሚያስፈልገው

ስፖትለስ በአዲስ አበባ በደንበኞች ቦታዎች ላይ የጥበቃና የጽዳት ሠራተኞችን ያሰማራል፤ ከዚያ ጎን ለጎን የንብረት ሎጂስቲክስንም ያስተዳድራል። የዚህ ንግድ ሁለቱም ክፍሎች በሰውና በቦታ የተሞሉ ናቸው፦ በመቶዎች የሚቆጠሩ የኮንትራት ሠራተኞች፣ እያንዳንዱ ለአንድ የደንበኛ ቦታ የተመደበ፣ በፈረቃ ሥርዓት፣ በሚገኝበት ውል መሠረት በሚወሰን ተመን።

ከዝርጋታው በፊት ይህ እውነታ በሉሆችና እነሱን በሚይዙት ሰዎች ጭንቅላት ውስጥ ይኖር ነበር። የመገኘት መዝገብ ከየቦታው ይመጣል። ደመወዝ በየዑደቱ ከዚያ በእጅ ይሰበሰባል። አንድ ደንበኛ "ባለፈው ሐሙስ በእኔ ቦታ ማን ነበር?" ብሎ መጠየቅ ለአንድ ሰው ግማሽ ቀን የሚወስድ ጥያቄ ነበር።

## የገነባነው

አጠቃላይ ሥራውን የሚሸፍን አንድ ኢአርፒ፦

- **የሠራተኛ ክትትል** ንግዱ በእውነት በሚንቀሳቀስበት መጠን፤ እያንዳንዱ ሠራተኛ ከቦታ፣ ከፈረቃና ከውል ተመን ጋር የተያያዘ።
- **ደመወዝ** ሥርዓቱ አስቀድሞ ከያዘው የመገኘት መዝገብ ተገንብቶ፤ ከእሱ እንደገና ሳይገባ።
- **የደንበኛ አስተዳደር** — እያንዳንዱ ውል፣ ቦታና የመገናኛ ሰው አቃፊ ሳይሆን አንድ መዝገብ።
- **የሥራ መርሐ ግብር** በቅርንጫፎች መካከል፤ የሽፋን ክፍተቶች የደንበኛ ቅሬታ ከመሆናቸው በኋላ ሳይሆን በፊት እንዲታዩ።
- **የፈቃድ ሂደቶች** — የተመን ለውጥ ወይም ምደባ ተጠያቂ በሆነው ሰው እንዲፈረም።

ከኢአርፒው ጎን ለጎን በዙሪያው ያሉትን ዲጂታል ንብረቶች አቅርበናል — ሙያዊ የንግድ ድረ-ገጽና ከተመሳሳይ ውሂብ ጋር የሚገናኙ አውቶማቲክ መሣሪያዎች።

## የተለወጠው

የአስተዳደር መጨናነቅ የፕሮጀክቱ ዓላማ ነበር፤ አሁን የለም። የመገኘት መዝገብ ደመወዝ ለመሆን መገልበጥ አያስፈልገውም፤ አስቀድሞ ደመወዝ ነው። በሉሆች መካከል ቁጥር ከመገልበጥ ይመጡ የነበሩት የእጅ ስሕተቶች የሚከሰቱበት እርምጃ የላቸውም።

ለስፖትለስ ከሁሉ በላይ የሚያስፈልገው ክፍል አቅም ነው፦ ሥራው ከዚህ በፊት አብሮ ይሰፋ የነበረውን የአስተዳደር ሠራተኛ ሳይጨምር ተጨማሪ ቦታዎችን መያዝ ይችላል።`,
	publishedAt: new Date('2025-11-15')
};

const spotlessServices = [
	{ label: 'HR & Payroll', labelAm: 'የሰው ኃይልና ደመወዝ' },
	{ label: 'Sales & Customer Management', labelAm: 'ሽያጭና የደንበኛ አስተዳደር' },
	{ label: 'Operational Scheduling', labelAm: 'የሥራ መርሐ ግብር' },
	{ label: 'Workflow Approvals', labelAm: 'የፈቃድ ሂደቶች' },
	{ label: 'Executive Dashboards', labelAm: 'የአመራር ዳሽቦርዶች' },
	{ label: 'Business Website', labelAm: 'የንግድ ድረ-ገጽ' }
];

/**
 * Outcomes are written as claims about the system, not as invented percentages.
 *
 * A case study for a 2025 deployment cannot honestly report a measured
 * year-on-year figure, and a made-up one is the fastest way to lose a buyer who
 * asks how it was measured. Replace these with real numbers once Spotless has
 * agreed to them.
 */
const spotlessOutcomes = [
	{
		value: '1',
		label: 'One system where the operation previously ran on several spreadsheets',
		labelAm: 'ሥራው ከዚህ በፊት በበርካታ ሉሆች ላይ ይንቀሳቀስበት የነበረበት አንድ ሥርዓት'
	},
	{
		value: '0',
		label: 'Re-entry steps between attendance and payroll',
		labelAm: 'ከመገኘት መዝገብ ወደ ደመወዝ የሚደረግ ድጋሚ ግቤት'
	},
	{
		value: '24/7',
		label: 'Technical support and monitoring since deployment',
		labelAm: 'ከዝርጋታው ጀምሮ ቴክኒካዊ ድጋፍና ክትትል'
	}
];

const articles = [
	{
		slug: 'why-erp-projects-stall',
		title: 'Why ERP projects stall, and what we do differently',
		titleAm: 'የኢአርፒ ፕሮጀክቶች ለምን ይቆማሉ፣ እኛስ በምን እንለያለን',
		category: 'Implementation',
		categoryAm: 'ትግበራ',
		author: 'Pulsedata Solutions',
		authorAm: 'ፐልስዳታ ሶሉሽንስ',
		excerpt:
			'Most failed ERP rollouts do not fail technically. They fail because the software was never shaped to the way the business actually works.',
		excerptAm:
			'አብዛኞቹ የከሸፉ የኢአርፒ ትግበራዎች በቴክኒክ አይከሽፉም። የሚከሽፉት ሶፍትዌሩ ንግዱ በእውነት በሚሠራበት መንገድ ስላልተቀረጸ ነው።',
		featured: true,
		publishedAt: new Date('2026-01-20'),
		body: `Ask anyone who has lived through a failed ERP rollout what went wrong and you will rarely hear a technical answer. The servers were fine. The vendor was competent. What happened is that the system described a company nobody recognised, and so people kept the spreadsheet open beside it.

## The pattern

A generic platform arrives with an opinion about how procurement works. The business has its own, developed over years for reasons that are usually good ones. Somewhere in the implementation, one of those two has to give, and it is almost never the software — so the business bends, staff quietly route around the parts that do not fit, and within a year the system holds a version of reality that is roughly true and never quite current.

The tell is when someone says "the system says X, but actually…". That sentence means the deployment has already failed; the only question left is how long it takes to admit it.

## What we do instead

We configure the modules to the operation rather than the other way round, which is only possible because we wrote the modules. When a client's approval threshold does not match what the software expects, that is a change we can make, not a limitation we have to explain.

That is also why the suite is modular. Taking the four modules you need now and adding production costing next year is a smaller, likelier-to-succeed project than replacing everything at once — and a business that has seen one module work will trust the second.

## The unglamorous part

The other half is training, and it is the half that gets cut when a budget tightens. A system nobody was taught is a system people work around. We treat staff training on every new feature as part of support rather than as a line item, because the alternative is watching a good deployment decay into an expensive one nobody uses.`,
		bodyAm: `የከሸፈ የኢአርፒ ትግበራን ያሳለፈ ማንኛውንም ሰው ምን እንደተሳሳተ ይጠይቁት፤ ቴክኒካዊ መልስ አይሰሙም። ሰርቨሮቹ ደኅና ነበሩ። አቅራቢው ብቁ ነበር። የሆነው ነገር ሥርዓቱ ማንም የማያውቀውን ኩባንያ ስለገለጸ ሰዎች ሉሁን ከጎኑ ከፍተው መቆየታቸው ነው።

## ሥርዓተ ጥለቱ

አጠቃላይ መድረክ ግዢ እንዴት እንደሚሠራ የራሱን አስተያየት ይዞ ይመጣል። ንግዱ ግን በዓመታት ውስጥ በአብዛኛው በበቂ ምክንያት ያዳበረው የራሱ አለው። በትግበራው ውስጥ ከሁለቱ አንዱ መተው አለበት፤ ሶፍትዌሩ ግን ፈጽሞ አይተውም — ስለዚህ ንግዱ ይታጠፋል፣ ሠራተኞች የማይመቻቸውን ክፍሎች በዝምታ ያልፋሉ፣ በአንድ ዓመት ውስጥም ሥርዓቱ በግምት እውነት የሆነ ግን ፈጽሞ ወቅታዊ ያልሆነ የእውነታ ቅጂ ይይዛል።

ምልክቱ አንድ ሰው "ሥርዓቱ X ይላል፣ ግን በእውነቱ…" ሲል ነው። ያ ዓረፍተ ነገር ዝርጋታው አስቀድሞ መክሸፉን ያሳያል፤ የቀረው ጥያቄ ለመቀበል ምን ያህል ጊዜ እንደሚወስድ ብቻ ነው።

## እኛ በምትኩ የምናደርገው

ክፍሎቹን ወደ ሥራው እንጂ ሥራውን ወደ ክፍሎቹ አናስማማም፤ ይህም የሚቻለው ክፍሎቹን እኛው ስለጻፍናቸው ነው። የደንበኛው የፈቃድ ገደብ ሶፍትዌሩ ከሚጠብቀው ጋር ካልተመሳሰለ፣ ያ ልናብራራው የሚገባን ገደብ ሳይሆን ልናደርገው የምንችለው ለውጥ ነው።

ጥቅሉ በክፍሎች የተዋቀረበትም ምክንያት ይኸው ነው። አሁን የሚያስፈልጉዎትን አራት ክፍሎች ወስዶ በሚቀጥለው ዓመት የምርት ወጪ ስሌትን መጨመር፣ ሁሉንም በአንድ ጊዜ ከመተካት የሚያንስና የመሳካት ዕድሉ የሚበልጥ ፕሮጀክት ነው — አንድ ክፍል ሲሠራ ያየ ንግድም ሁለተኛውን ያምናል።

## የማያምረው ክፍል

ሌላው ግማሽ ሥልጠና ነው፤ በጀት ሲጠብ የሚቆረጠውም ግማሽ እሱ ነው። ማንም ያልተማረው ሥርዓት ሰዎች የሚያልፉት ሥርዓት ነው። በእያንዳንዱ አዲስ ገጽታ ላይ የሠራተኛ ሥልጠናን የድጋፉ አካል አድርገን እንይዘዋለን፤ አማራጩ አንድ ጥሩ ዝርጋታ ማንም ወደማይጠቀምበት ውድ ነገር ሲበሰብስ ማየት ስለሆነ።`
	},
	{
		slug: 'erp-without-heavy-servers',
		title: 'An ERP that does not need a server room',
		titleAm: 'የሰርቨር ክፍል የማይፈልግ ኢአርፒ',
		category: 'Architecture',
		categoryAm: 'አርክቴክቸር',
		author: 'Nahusenay Tadesse',
		authorAm: 'ናሁሰናይ ታደሰ',
		excerpt:
			'Enterprise software has a reputation for demanding hardware. That reputation is a design choice, not a law, and we made the other one.',
		excerptAm: 'የድርጅት ሶፍትዌር ሃርድዌር በመጠየቅ ይታወቃል። ያ ስም የንድፍ ምርጫ እንጂ ሕግ አይደለም፤ እኛም ሌላውን መርጠናል።',
		featured: false,
		publishedAt: new Date('2026-03-05'),
		body: `The usual shape of enterprise software assumes a certain kind of buyer: one with a server room, a systems administrator and a hardware budget that renews. Most businesses do not look like that, here or anywhere, and the software's assumptions become their capital expenditure.

## Where the weight comes from

Very little of it is essential. Heavy systems are usually heavy because they are assembled from layers that each solve a general problem — a framework, an ORM, a plugin architecture, a reporting engine — and each layer carries the cost of every case it was built to handle, including the ones you will never hit.

Writing the modules ourselves means we pay for the cases that exist. There is no plugin system holding open a door nobody walks through, and no abstraction layer between the query and the answer.

## What that buys

A mid-range machine and an ordinary connection are enough to run a company on. For a multi-branch operation, that changes the arithmetic twice over: the up-front cost is smaller, and a branch with unreliable power and a modest connection is still a branch that can use the system rather than one that has to phone its numbers in.

It also changes what "scaling up" means. Adding sites usually means adding capacity. When each site costs so little to serve, growth stops being a procurement conversation.

## The honest limit

None of this makes hosting free. A SaaS deployment still runs on infrastructure we maintain, and a perpetual licence still runs on a machine somebody has to own. The claim is narrower and more useful than "no infrastructure": it is that the infrastructure is ordinary, and that nothing in the software is quietly asking for more.`,
		bodyAm: `የተለመደው የድርጅት ሶፍትዌር ቅርጽ የተወሰነ ዓይነት ገዢን ይገምታል፦ የሰርቨር ክፍል፣ የሥርዓት አስተዳዳሪና የሚታደስ የሃርድዌር በጀት ያለውን። አብዛኞቹ ንግዶች እዚህም ሆነ በየትም ቦታ እንደዚያ አይመስሉም፤ የሶፍትዌሩ ግምቶችም የእነሱ የካፒታል ወጪ ይሆናሉ።

## ክብደቱ ከየት ይመጣል

በጣም ጥቂቱ ብቻ አስፈላጊ ነው። ከባድ ሥርዓቶች ከባድ የሚሆኑት በአብዛኛው እያንዳንዳቸው አጠቃላይ ችግርን ከሚፈቱ ንብርብሮች ስለሚሰበሰቡ ነው — ማዕቀፍ፣ ኦአርኤም፣ የተሰኪ አርክቴክቸር፣ የሪፖርት ሞተር — እያንዳንዱ ንብርብርም ለመያዝ የተገነባውን እያንዳንዱን ሁኔታ ወጪ ይሸከማል፤ ፈጽሞ የማይገጥሙዎትንም ጨምሮ።

ክፍሎቹን ራሳችን መጻፍ ማለት ላሉት ሁኔታዎች ብቻ እንከፍላለን ማለት ነው። ማንም የማያልፍበትን በር ከፍቶ የሚይዝ የተሰኪ ሥርዓት የለም፤ በጥያቄውና በመልሱ መካከልም የአብስትራክሽን ንብርብር የለም።

## ይህ የሚያስገኘው

መካከለኛ ማሽንና መደበኛ ግንኙነት አንድን ኩባንያ ለማንቀሳቀስ በቂ ናቸው። ለባለብዙ ቅርንጫፍ ሥራ ይህ ስሌቱን በሁለት መንገድ ይለውጠዋል፦ የመነሻ ወጪው ያንሳል፣ እንዲሁም አስተማማኝ ያልሆነ ኃይልና መጠነኛ ግንኙነት ያለው ቅርንጫፍ ቁጥሮቹን በስልክ ከሚያስተላልፍ ይልቅ ሥርዓቱን መጠቀም የሚችል ቅርንጫፍ ሆኖ ይቀጥላል።

"መስፋት" ማለት ምን እንደሆነም ይለውጠዋል። ቦታዎችን መጨመር ብዙውን ጊዜ አቅም መጨመር ማለት ነው። እያንዳንዱን ቦታ ማገልገል ይህን ያህል ርካሽ ሲሆን፣ ዕድገት የግዢ ውይይት መሆኑ ያበቃል።

## ግልጽ የሆነው ገደብ

ከዚህ ውስጥ ምንም ማስተናገጃውን ነጻ አያደርገውም። የSaaS ዝርጋታ አሁንም እኛ በምንጠብቀው መሠረተ ልማት ላይ ይሠራል፤ ቋሚ ፈቃድም አሁንም አንድ ሰው ሊይዘው በሚገባ ማሽን ላይ ይሠራል። የይገባኛል ጥያቄው ከ"መሠረተ ልማት የለም" ይልቅ ጠባብና ጠቃሚ ነው፦ መሠረተ ልማቱ ተራ ነው፣ በሶፍትዌሩ ውስጥም በዝምታ ተጨማሪ የሚጠይቅ ነገር የለም።`
	},
	{
		slug: 'one-number-many-branches',
		title: 'One number, many branches',
		titleAm: 'አንድ ቁጥር፣ በርካታ ቅርንጫፎች',
		category: 'Operations',
		categoryAm: 'የሥራ አመራር',
		author: 'Pulsedata Solutions',
		authorAm: 'ፐልስዳታ ሶሉሽንስ',
		excerpt:
			'When every branch keeps its own books, the head office does not have a slow view of the business. It has several different businesses.',
		excerptAm:
			'እያንዳንዱ ቅርንጫፍ የራሱን መዝገብ ሲይዝ፣ ዋና መሥሪያ ቤቱ ስለ ንግዱ ዘገምተኛ እይታ አለው ማለት አይደለም። በርካታ የተለያዩ ንግዶች አሉት ማለት ነው።',
		featured: false,
		publishedAt: new Date('2026-05-12'),
		body: `The problem with branch-level bookkeeping is not that consolidation is slow. It is that consolidation is a *negotiation*. Two branches report stock differently, both are internally consistent, and the head office spends the first day of every month deciding which one to believe.

## Reconciliation is a symptom

If a monthly close involves reconciling, the business has more than one set of books, whatever the org chart says. Reconciliation is the work of making several records agree — and the reason it is necessary is that the same event was recorded more than once, by more than one person, using more than one definition.

Nothing about that is fixed by a better spreadsheet template or a stricter deadline. It is fixed by the event only being recorded once.

## What "one system" actually means

It is not a shared drive, and it is not a nightly export. It means that when a branch issues stock, the movement, the ledger entry and the reorder position are one write. The branch does not send its numbers anywhere, because head office is already looking at them.

The second-order effect is the one operators tend to notice first: questions stop being projects. "How much did the Bole branch move last week" is a question the system can answer, rather than an email that goes out on Monday and comes back on Wednesday in a format nobody agreed on.

## What it costs

Honestly: discipline, at the start. Everyone has to record the event where it happens, and a business used to catching things up at month end has to stop doing that. The first cycle is the hard one. After it, nobody wants to go back, because the alternative was spending the first week of every month arguing about which spreadsheet was right.`,
		bodyAm: `የቅርንጫፍ ደረጃ የመዝገብ አያያዝ ችግር ማዋሐዱ መዘግየቱ አይደለም። ችግሩ ማዋሐዱ *ድርድር* መሆኑ ነው። ሁለት ቅርንጫፎች ንብረትን በተለያየ መንገድ ይዘግባሉ፣ ሁለቱም በውስጣቸው ወጥ ናቸው፣ ዋና መሥሪያ ቤቱም የየወሩን የመጀመሪያ ቀን የትኛውን እንደሚያምን በመወሰን ያሳልፋል።

## ማስታረቅ የበሽታ ምልክት ነው

ወርሃዊ መዝጊያ ማስታረቅን የሚያካትት ከሆነ፣ የድርጅቱ መዋቅር ምንም ይበል ምን ንግዱ ከአንድ በላይ የመዝገብ ስብስብ አለው። ማስታረቅ በርካታ መዝገቦችን የማስማማት ሥራ ነው — አስፈላጊ የሚሆንበትም ምክንያት ተመሳሳዩ ክስተት ከአንድ ጊዜ በላይ፣ ከአንድ በላይ በሆኑ ሰዎች፣ ከአንድ በላይ በሆነ ትርጓሜ ስለተመዘገበ ነው።

ከዚህ ውስጥ ምንም በተሻለ የሉህ አብነት ወይም በጠበቀ የጊዜ ገደብ አይስተካከልም። የሚስተካከለው ክስተቱ አንድ ጊዜ ብቻ ሲመዘገብ ነው።

## "አንድ ሥርዓት" በእውነት ማለት ምንድን ነው

የጋራ ድራይቭ አይደለም፤ የሌሊት ኤክስፖርትም አይደለም። ማለት አንድ ቅርንጫፍ ንብረት ሲያወጣ፣ እንቅስቃሴው፣ የመዝገቡ ግቤትና የድጋሚ ትዕዛዝ ሁኔታው አንድ ጽሑፍ ናቸው ማለት ነው። ቅርንጫፉ ቁጥሮቹን ወደ የትም አይልክም፤ ዋና መሥሪያ ቤቱ አስቀድሞ እያያቸው ስለሆነ።

ሁለተኛው ውጤት ሥራ አስኪያጆች መጀመሪያ የሚያስተውሉት ነው፦ ጥያቄዎች ፕሮጀክት መሆናቸው ያበቃል። "ባለፈው ሳምንት የቦሌ ቅርንጫፍ ምን ያህል አንቀሳቀሰ" የሚለው ሰኞ ወጥቶ ረቡዕ ማንም ባልተስማማበት ቅርጸት የሚመለስ ኢሜይል ሳይሆን ሥርዓቱ ሊመልሰው የሚችል ጥያቄ ነው።

## ወጪው

በግልጽ፦ በመጀመሪያ ላይ ተግሣጽ። ሁሉም ሰው ክስተቱን በሚከሰትበት ቦታ መመዝገብ አለበት፤ በወር መጨረሻ ነገሮችን ማካካስ የለመደ ንግድም ያንን ማቆም አለበት። የመጀመሪያው ዑደት ከባዱ ነው። ከእሱ በኋላ ማንም መመለስ አይፈልግም፤ አማራጩ የየወሩን የመጀመሪያ ሳምንት የትኛው ሉህ ትክክል እንደሆነ በመከራከር ማሳለፍ ስለነበር።`
	}
];

/** The row as it goes to the database: markdown bodies rendered to HTML. */
const projectRow = () => ({
	...spotless,
	body: html(spotless.body),
	bodyAm: html(spotless.bodyAm)
});

async function upsertProject() {
	const [existing] = await db
		.select({ id: projects.id })
		.from(projects)
		.where(eq(projects.slug, spotless.slug))
		.limit(1);

	let id: number;
	if (existing) {
		await db.update(projects).set(projectRow()).where(eq(projects.id, existing.id));
		id = existing.id;
		// The child rows are replaced wholesale rather than diffed: they are a
		// short ordered list, and re-running the seed should leave exactly what
		// this file says, not an accumulation of every version of it.
		await db.delete(projectServices).where(eq(projectServices.projectId, id));
		await db.delete(projectOutcomes).where(eq(projectOutcomes.projectId, id));
	} else {
		await db.insert(projects).values(projectRow());
		const [row] = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.slug, spotless.slug))
			.limit(1);
		id = row.id;
	}

	await db
		.insert(projectServices)
		.values(spotlessServices.map((s, i) => ({ ...s, projectId: id, sortOrder: i })));
	await db
		.insert(projectOutcomes)
		.values(spotlessOutcomes.map((o, i) => ({ ...o, projectId: id, sortOrder: i })));

	console.log(`  project: ${spotless.slug}`);
}

async function upsertPosts() {
	for (const article of articles) {
		const row = {
			...article,
			status: 'published' as const,
			body: html(article.body),
			bodyAm: html(article.bodyAm)
		};
		const [existing] = await db
			.select({ id: posts.id })
			.from(posts)
			.where(eq(posts.slug, article.slug))
			.limit(1);

		if (existing) {
			await db.update(posts).set(row).where(eq(posts.id, existing.id));
		} else {
			await db.insert(posts).values(row);
		}
		console.log(`  post: ${article.slug}`);
	}
}

console.log('Seeding…');
await upsertProject();
await upsertPosts();
await client.end();
console.log('Done.');
