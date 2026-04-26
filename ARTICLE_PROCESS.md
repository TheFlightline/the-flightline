# Flightline Article Process

Follow every step in order. Do not skip. Do not draft before step 6.

---

## Step 1 — Check what's already published

Fetch og-data.json from the repo. Every key is a published or queued article ID.
Scan all keys. No story that already appears here gets written again.

## Step 2 — Check pending_articles.json

Fetch pending_articles.json. List every id and headline.
Nothing already in this queue gets re-drafted.

## Step 3 — Read the full article schema

Read one complete entry from pending_articles.json to confirm every field before writing:
- `id` — slug, format: topic-date e.g. `cra-vote-hard-rock-042226`
- `cat` — one of: government, development, military, education, sports, community, opinion, analysis
- `label` — display label e.g. "Government", "Development"
- `headline` — full headline, AP style, no period
- `dek` — 1–2 complete sentences, no fragments
- `byline` — "The Flightline Staff"
- `date` — "Month D, YYYY" e.g. "April 22, 2026"
- `brief` — array of exactly 3 strings; each is a complete sentence summarizing a key fact
- `body` — HTML string; paragraphs as `<p>`, subheads as `<h2>`, no other tags

Image lives in og-data.json (separate file), keyed by article id:
- `h` — headline (can match article headline)
- `d` — short description (150 chars max)
- `t` — image path e.g. `/images/filename.jpg`

Image sources: Wikimedia Commons, NARA, Library of Congress, U.S. Navy public domain,
NOAA, Unsplash (no attribution required). No placeholder paths. If no suitable image
exists, flag it and use `/images/flightline-og-default.jpg` as fallback.

## Step 4 — Scan secondary sources for leads (do not cite)

Before fetching primary documents, scan local and regional news outlets to identify
what is circulating. These sources are used ONLY to generate leads — they are never
cited in Flightline articles. The job here is to notice that something happened and
then find the primary document that proves it.

**Tier 1 — Highest signal value (reporters attend meetings, read documents):**

- Pensacola News Journal: https://www.pnj.com
  Gannett-owned daily. The most staffed local newsroom. Reporters cover city
  hall, county commission, courts, education, and military. When PNJ breaks
  a government or courts story, a primary document almost always exists — find it.
  Best beats to monitor: government votes, court filings, education budget, NAS.
  Limitation: paywalled; many stories require a subscription to read fully.

- WUWF 88.1 NPR Pensacola: https://www.wuwf.org
  Public radio, solid sourcing standards, good on state legislation with local
  impact and long-form accountability pieces. Smaller staff than PNJ but
  editorially rigorous.

**Tier 2 — Useful signal, verify everything (attend meetings but shallower sourcing):**

- WEAR TV: https://weartv.com
  Broadcast news. Attends press conferences and government meetings, quotes
  officials on camera. Good for spotting that something happened; rarely has
  enough document detail to reconstruct the full story. Best use: confirming
  a vote or announcement occurred, then going to the agenda packet for specifics.

- Fox10 (WALA): https://www.fox10tv.com
  Similar to WEAR. Useful for breaking news alerts and press conference coverage.

- WKRG: https://www.wkrg.com
  Primarily Mobile-based but covers Pensacola. Use for regional stories with
  local angles — naval aviation, Gulf Coast weather, I-10 corridor.

**Tier 3 — High lead value, low reliability (frequent scoops, verify aggressively):**

- Rick's Blog / Inweekly: https://ricksblog.biz
  Rick Outzen has covered Pensacola politics for decades and is frequently
  first on local government stories, contract disputes, and official misconduct.
  Also frequently wrong on specifics and openly editorializes. Treat every
  claim as a lead, not a fact. If Outzen says the city is considering X, go
  find the resolution or memo — do not assume his characterization is accurate.
  High value for spotting stories other outlets miss; zero value as a citation.

- NorthEscambia.com: https://www.northescambia.com
  Covers Cantonment, Century, Molino, and north county with genuine community
  presence. Good for leads on rural/north Escambia government actions,
  school board north county angles, and emergency response. Same rule: lead
  only, verify with primary document.

**Tier 4 — Community/lifestyle (leads for community beat only):**

- Local Pulse: https://localpulse.com
  "Good news" community site. Business openings, nonprofit spotlights, people
  profiles, events. Not a hard news source and does not cover government or
  investigations. Useful only for community beat leads: new businesses downtown,
  nonprofit fundraising milestones, notable openings or closings. Never a source
  for government, development, military, or education stories.

- Gulf Breeze News: https://news.gulfbreezenews.com
  Small weekly serving Gulf Breeze and Pensacola Beach. Good for SRIA actions,
  Gulf Breeze council, and Pensacola Beach development. Thin staff; use as a
  lead pointer to SRIA agendas and Gulf Breeze AgendaCenter.

- Island Times: https://www.myislandtimes.com
  Pensacola Beach-focused. Events, SRIA items, beach construction notices.
  Same treatment as Gulf Breeze News.

**Tier 5 — State/regional/trade (legislative and military leads):**

- Pensacola Forward: https://www.pensacolaforward.com
  Economic development focus. Good for business attraction announcements,
  Triumph Gulf Coast actions, and port/airport stories. Often first with
  economic development news but sourced from press releases; find the
  underlying Triumph board action or city resolution.

- Florida Politics: https://floridapolitics.com
  State legislature and statewide politics. Best use: tracking bills with
  local impact (DEI, vouchers, municipal finance, military). Cross-reference
  with floridahouse.gov and flsenate.gov for bill text and vote records.

- Navy Times / USNI News: https://www.navytimes.com / https://news.usni.org
  National military trade press. Essential for NAS Pensacola stories with
  broader Navy context — unit activations, budget cuts, training changes,
  command decisions. Find the Navy press release or official notice to confirm.

- AP Florida wire and Google News local alerts for Pensacola/Escambia.

**The rule for all tiers:**
If a secondary source reports something newsworthy, do not write from it.
Find the primary document — the agenda, resolution, press release, court filing,
or permit — and write from that. If the primary document cannot be found and
confirmed, the story does not run.

## Step 5 — Fetch government meeting agendas and primary documents

This step is mandatory before surfacing any story candidate. Act like a reporter
working a beat: pull the actual documents from every relevant government body
covering the requested time window. Do not rely on news coverage to discover
what happened at a meeting — go to the source document first.

### City of Pensacola
- Legistar meeting calendar: https://pensacola.legistar.com/Calendar.aspx
  Fetch meeting detail pages for any City Council, CRA, or Planning Board meetings
  in the window. Pull the agenda packet PDF for each meeting found.
- City newsflash/press releases: https://www.cityofpensacola.com/m/newsflash

### Escambia County BCC
- CivicClerk portal: https://escambiacofl.civicclerk.com/web/Home.aspx
  Fetch agenda packets for BCC regular meetings, committee of the whole, and
  any special meetings in the window.
- County news: https://myescambia.com/news

### Escambia County School District
- BoardDocs: https://go.boarddocs.com/fl/escambia/Board.nsf/vpublic
  Fetch the agenda for any board meetings in the window. Read action items,
  workshop items, and superintendent reports.
- District site: https://www.escambiaschools.org

### Santa Rosa County
- BCC agendas: https://www.santarosa.fl.gov/agendacenter
- Santa Rosa County School Board: https://www.santarosa.k12.fl.us

### Gulf Breeze City Council
- AgendaCenter: https://www.cityofgulfbreeze.us/agendacenter

### Santa Rosa Island Authority (governs Pensacola Beach)
- SRIA meetings and agendas: https://www.sria.fl.gov
  SRIA board actions cover leases, beach development approvals, and Pensacola Beach
  policy. Check every round — SRIA agendas surface development stories before
  press releases exist.

### ECUA (Emerald Coast Utilities Authority)
- ECUA board agendas: https://www.ecua.fl.gov
  Rate changes, major infrastructure projects, and board contract awards.

### Triumph Gulf Coast
- Board meeting notices and grant awards: https://triumphgulf.org
  Controls hundreds of millions in BP settlement funds for NW Florida.
  Grant awards and project approvals are significant economic development stories.

### NAS Pensacola / Military
- NAS Pensacola public affairs: https://www.cnic.navy.mil/regions/cnrse/installations/nas_pensacola.html
- Blue Angels schedule and policy changes: https://www.blueangels.navy.mil/show/
- National Naval Aviation Museum: https://navalaviationmuseum.org/blueangels/

### FDOT / Transportation
- Northwest Florida Roads: https://nwflroads.com
  Search active projects in Escambia and Santa Rosa counties.
- TPO: https://www.pensacola-tpo.org
  Check for TIP amendments, public meetings, and new project initiations.

### Port of Pensacola
- Port news and board agendas: https://portofpensacola.com/news

### Pensacola International Airport
- Airport news and construction updates: https://flypensacola.com and https://transformpns.com

### UWF
- UWF news: https://uwf.edu/news

### Elections
- Escambia County Supervisor of Elections: https://escambiavotes.gov/news
- Santa Rosa County Supervisor of Elections: https://santarosavotes.gov

### Florida Legislature (when session is active or bills affect Pensacola)
- Florida House: https://www.floridahouse.gov
- Florida Senate: https://www.flsenate.gov
  Search bills by keyword (Escambia, Pensacola, NAS, ECUA, etc.) for legislation
  with direct local impact.

### Federal / Other
- USACE public notices: https://www.saj.usace.army.mil/Missions/Regulatory/Public-Notices/
  Any permit application for work in Pensacola Bay, bayous, or coastal areas.
- NOAA fisheries management notices affecting Gulf Coast operations.

### Courts and Legal Records
- Escambia Clerk: https://www.escambiaclerk.com/official-records
- PACER for significant federal cases involving local entities.
  Read the docket; do not report on a filing without reading it.

### Permits and Land Use
- Escambia County Development Services: https://myescambia.com/our-services/development-services
- City of Pensacola permits: https://www.mygovernmentonline.org
  Major commercial, multifamily, or demolition permits surface stories before
  groundbreakings are announced.
- FDOT environmental notices (ETDM): https://etdmpub.fla-etat.org

---

**Acceptable sources (full list):**
- Government agenda packets fetched directly from CivicClerk, AgendaCenter,
  Legistar, BoardDocs, MuniDocs
- Memos, ordinances, resolutions, RFPs, meeting video
- Official agency press releases (city, county, NAS, UWF, FDOT, etc.)
- Primary documents: court filings, audits, contracts, letters, budgets, permits

**NOT acceptable as sources (usable only as leads per Step 4):**
WEAR, Fox10, WKRG, PNJ, AOL, NorthEscambia.com, ricksblog, Gulf Breeze News,
Island Times, Pensacola Forward, Inweekly, Florida Politics, or any secondary outlet.
If the primary document behind a secondary report cannot be found, drop the story.

## Step 6 — Verify recency and authenticity on every source

For each candidate story:
1. Confirm the URL loads and is a government or official agency domain.
2. Confirm the publication or posting date on the primary document itself.
3. Confirm the document falls within the requested time window.
4. Confirm dollar figures, vote counts, and named parties appear in the
   document — not inferred from coverage.

Never trust aggregator dates. If the primary document cannot be confirmed, drop the story.

## Step 7 — Assess data and visual potential for each candidate

For each story candidate, before presenting it, evaluate whether it warrants
an interactive or visual element embedded in the article body. The site supports
inline React components, SVG charts, and HTML widgets alongside article prose.

**Automatic triggers — always recommend a visual:**
- Budget, spending, or financial stories with 3+ dollar figures → chart or table
- Stories involving year-over-year comparison → bar chart or trend line
- Road closures, construction zones, or geographic projects → map embed
- Salary, compensation, or staffing stories → consider linking salary dashboard
  or embedding a mini table
- Phased projects with a timeline (construction, bond issuance, legislative calendar)
  → timeline graphic
- Election results or candidate filing counts → table or vote-share chart
- Stories comparing two or more entities (city vs. county, this school vs. that one)
  → side-by-side table

**Evaluate case by case:**
- Any story where numbers in prose would be clearer as a visual
- Any story where geography matters to understanding the stakes
- Any story where showing change over time is central to the argument

**When recommending a visual, specify:**
- What type (bar chart, map, timeline, table, etc.)
- What data it would display
- Where the data comes from (the primary document)
- Whether it requires live data or can be static

If a visual is warranted, flag it in the candidate list presented to Drew.
Do not build the visual without approval — just identify the opportunity.

## Step 8 — Present candidates to Drew before writing

List each story candidate with:
- Proposed headline
- Primary source: the actual government document URL and its confirmed date
- One sentence on why it's worth covering
- Visual/interactive flag if applicable (type of visual and data source)

Wait for approval or cuts. Do not draft until approved.

## Step 9 — Write to Flightline news style

Every fact must trace to a document actually fetched and read.
No fabricated names, composite quotes, invented details, or placeholder numbers.

Style rules:
- Lead = complete sentence: actor + action + context
- No staccato; short sentences for impact only
- Avg 18–22 words/sentence; grafs 2–3 sentences
- Nut graf by S3; inverted pyramid
- Quotes: 2–4 per story, voice/stakes only; name + title on first reference;
  never stack quotes; each quote gets its own graf
- Specific numbers always
- Max 1 em dash per story
- Active voice
- Min 350w; 400–500w standard; 500–700w for complex stories
- Kicker = forward-motion fact
- Dek: 1–2 complete sentences, no fragments, no em dashes

## Step 10 — Build visual/interactive element if approved

If Drew approved a visual for the story, build it before finalizing the article body.

**Standards:**
- Use React (JSX) for interactive elements: charts, maps, calculators, sortable tables.
- Use SVG for static diagrams or simple graphics.
- All data must come from the primary source document — no invented or estimated values.
- Label every axis, every data point, and include a source attribution line
  (e.g., "Source: Escambia County FY2026 Budget, adopted Sept. 19, 2025").
- Color palette: navy #1e2d4a, gold #d4952b, white #ffffff. No other colors unless
  the data requires a third category.
- Mobile-friendly: components must render cleanly at 375px width.
- The visual is embedded in the article body as an inline component reference
  or iframe, not a separate page — confirm with Drew how to wire it into the
  article template before building.

## Step 11 — Pre-publish fact verification

Before finalizing the article JSON, run this checklist against the source document:

- Every named person: confirm spelling and title against the primary document.
- Every dollar figure: confirm against the primary document — no rounding unless
  the document itself rounds.
- Every vote count: confirm from minutes or a roll call in the agenda packet.
- Every date: confirm the event date, not the document posting date.
- Every quote: confirm it came from official video, a press release, or a public
  statement — never paraphrase into quotation marks.
- Article slug (id): confirm it does not already exist as a key in og-data.json.

## Step 12 — Validate article HTML before push

Before inserting the article body into pending_articles.json:
1. Scan `body`, `dek`, and `brief` strings for unescaped apostrophes.
   Any apostrophe inside a JS single-quoted string breaks the file. Escape as `\'`
   or rewrite to avoid the contraction.
2. Confirm all `<p>` tags are closed.
3. Confirm no tags other than `<p>` and `<h2>` appear in body unless approved.
4. Confirm `brief` array has exactly 3 strings.
5. Confirm `date` field matches "Month D, YYYY" format exactly.

## Step 13 — Push

Add new article object to pending_articles.json array.
Add new og-data entry keyed by article id.
pending_articles.json is under 1MB — use Contents API (PUT /contents/:path).
og-data.json may be larger — check size first; use Git Data API if over 1MB.
Validate JS if touching index.html: `node --check`.
Confirm deploy on Netlify.

---

## Standing flags on pending_articles.json (as of April 2026)

The three articles currently in pending_articles.json contain fabricated
names, invented quotes, and unverifiable sourced details. They must be
reviewed with Drew before publication. Do not push them to the live site
without explicit approval.

