# Flightline Article Process

## Step 0 — Enforcement preamble (read first, every session)

This document is binding. It is not a checklist of suggestions. The rules
below exist because they have been violated in past sessions and that
caused real problems — secondary-source contamination, missed primary
documents, fabricated details, and Drew having to spend his time
re-prompting because the work was incomplete.

### Hard rules

1. **Re-read this entire document at the start of every article session.**
   Not the summary. Not the memory version. The actual current file in the
   repo. The process changes over time and memory may be stale.

2. **Execute every numbered step in order, fully, before moving to the
   next.** Do not skip. Do not partially complete a step and circle back.
   "I'll come back to that" is how things get missed.

3. **Do not present a candidate slate until Steps 1–7 are complete.**
   Presenting partial work and asking "want me to keep checking?" is a
   process violation. Either the sweep is done or it isn't. If it isn't,
   keep working — don't surface anything.

4. **The Step 8 candidate format is fixed.** Each candidate gets:
   - Proposed headline
   - Primary-source URL with confirmed posting date (the document, not a
     news article about the document)
   - One sentence on why it's worth covering
   - Visual flag (type + data source) if applicable per Step 7

   Prose summaries, bullet lists of "stories I considered," and "honorable
   mentions" sections do NOT substitute for this format.

5. **When a primary source is blocked, say so explicitly.** If a CivicClerk
   portal, BoardDocs, ECUA agenda system, or any other primary source
   cannot be reached because of a Chrome extension permission prompt, a
   TLS error from the API, a robots.txt block, or any other technical
   reason — name the block, name the body it affects, and ask Drew how to
   proceed. Do not silently substitute Google search results, news
   coverage, or aggregator snippets. That is exactly the contamination the
   tier system in Step 4 exists to prevent.

6. **Use Claude in Chrome before falling back to web_fetch or search.**
   When a portal is a JavaScript SPA (CivicClerk, BoardDocs, AgendaCenter
   variants), open it in Chrome and pull the data through the rendered
   page, not through the unrendered HTML shell. The PDF text inside the
   pdf.js iframe is extractable via `iframe.contentWindow.PDFViewerApplication`.

7. **If Drew asks "did you follow your instructions," the answer is almost
   always no.** That question means a corner got cut. Do not defend the
   work — restart from Step 1 and do it properly.
8. **Never write from agenda listings or general knowledge of how things
   "usually" work.** If a Flightline article describes what a vote did,
   what a memo said, or what a meeting decided, those facts must come
   from reading the actual document and the actual vote record — not
   from the item title, not from a topic-area assumption, not from a
   draft of a prior similar article.

   **Cautionary example:** The `cra-interlocal-amendment` article,
   published April 24, 2026, said the council approved Amendment No. 2
   to the City-CRA interlocal "without discussion." The CivicClerk vote
   panel for Item 6 of the April 23 meeting actually shows the motion
   FAILED 2-5 after 42 minutes of debate. The article was drafted from
   the agenda listing — which named the item and showed the sponsor's
   recommendation to "adopt" — and from generic prior knowledge about
   how city-CRA interlocals usually work. The author imagined what
   Amendment No. 2 probably said and what the council probably did,
   instead of opening the memo and the vote panel. Five distinct
   factual errors made it past the writing pass and the pre-publish
   checks. This must never happen again. Reference this example
   explicitly in any future training pass on the Flightline workflow.


### Soft rules (judgment calls, but lean toward strictness)

- When a primary source is reachable but the agenda packet PDF is image-
  only (scanned, no text layer), say so. Do not infer contents from the
  attachment filename.
- When secondary coverage exists for an item but the underlying primary
  doc cannot be located, the story does not run. There is no "well, WUWF
  is reliable, so" exception.
- When in doubt about whether a meeting body has been checked, check it
  again. The cost of a redundant fetch is seconds. The cost of missing a
  story is the entire reason this publication exists.

---

---

## Step 1 — Check what's already published

Fetch og-data.json from the repo. Every key is a published or queued article ID.
Scan all keys. No story that already appears here gets written again.

## Step 2 — Check pending_articles.json

Fetch pending_articles.json. List every id and headline.
Nothing already in this queue gets re-drafted.

## Step 3 — Read the full article schema

Read one complete entry from assets/articles.js to confirm every field before writing:
- `id` — slug, format: topic-date e.g. `cra-vote-hard-rock-042226`
- `cat` — one of: `govt`, `dev`, `military`, `education`, `sports`, `community`, `opinion`
  Note: The homepage section grid maps `govt` → Government, `dev` → Business & Development,
  `military` → Military, `sports` → Sports, `opinion` → Opinion & Analysis.
  Articles with `cat: "education"` or `cat: "community"` are accessible via Latest and
  search but do not appear in a homepage section block.
- `label` — display label e.g. "Government", "Development"
- `headline` — full headline, AP style, no period
- `dek` — 1–2 complete sentences, no fragments
- `byline` — "The Flightline Staff"
- `date` — "Month D, YYYY" e.g. "April 22, 2026"
- `thumbnail` — path to an image from /images/ — see Step 7 for assignment rules
- `brief` — array of exactly 3 strings; each is a complete sentence summarizing a key fact
- `body` — HTML string; paragraphs as `<p>`, subheads as `<h2>`, no other tags

Image lives in og-data.json (separate file), keyed by article id:
- `h` — headline (can match article headline)
- `d` — short description (150 chars max)
- `t` — image path e.g. `/images/filename.jpg`

Image sources: Wikimedia Commons, NARA, Library of Congress, U.S. Navy public domain,
NOAA, Unsplash (no attribution required). No placeholder paths. If no suitable image
exists, use `/images/flightline-og-default.jpg` as fallback.

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

## Step 10 — Assign thumbnail image

Every article requires a `thumbnail` field pointing to a real image in /images/.
Do not use `/images/flightline-og-default.jpg` unless no better option exists.

**Available images by beat:**

Government / Courts:
  editorial_gavel_005.jpg — courts, lawsuits, legal rulings
  govt_public-hearing_009.jpg — council meetings, public hearings, votes
  govt_office_007.jpg — general government/administrative stories
  editorial_podium_002.jpg — press conferences, announcements
  editorial_voting_010.jpg — elections, ballot measures

Development / Infrastructure:
  development_construction-crane_001.jpg — major construction projects
  development_road-work_002.jpg — road projects, FDOT stories
  development_scaffolding_003.jpg — building renovations
  development_residential_004.jpg — housing stories
  development_commercial_007.jpg — commercial development
  development_demolition_006.jpg — demolition stories
  downtown_pensacola-maritime-park_006.jpg — Maritime Park stories
  reverb-aerial-dusk.jpg / reverb-tower-wide.jpg — REVERB/Hard Rock stories

Military / NAS:
  military_blue-angels_001.jpg — Blue Angels general
  military_blue-angels-over-pensacola_008.jpg — Blue Angels flight/airshow
  military_blue-angels-crowd-practice_010.jpg — Blue Angels practice season
  military_nas-pensacola-airshow_009.jpg — NAS airshow/events
  military_ceremony_005.jpg — military ceremonies, change of command
  military_aviation-museum_004.jpg — Naval Aviation Museum stories
  military_hangar_011.jpg — NAS facility/infrastructure stories

Education:
  education_teacher_006.jpg — school policy, classroom rules, conduct
  education_graduation_005.jpg — graduation, academic achievement
  education_science-lab_007.jpg — STEM, curriculum stories
  education_library_004.jpg — library stories
  education_playground_008.jpg — elementary school, facilities

Sports:
  sports_baseball_002.jpg — Blue Wahoos, baseball
  sports_basketball_005.jpg — basketball
  sports_golf_007.jpg — golf
  sports_running_004.jpg — track, running events
  sports_soccer_003.jpg — soccer
  sports_swimming_008.jpg — swimming, aquatics

Community / Events:
  community_concert_008.jpg — concerts, music events, homecoming celebrations
  community_festival_002.jpg — community festivals, Fiesta
  community_palafox-festival_008.jpg — Palafox street events, Gallery Night
  community_farmers-market_001.jpg — markets, community gatherings
  community_volunteers_005.jpg — nonprofit, volunteer stories
  community_mural_006.jpg — public art, Graffiti Bridge

Beach / Waterfront:
  beach_emerald-water_004.jpg — beach/water feature stories
  beach_gulf-sunset_003.jpg — general beach atmosphere
  beach_pensacola-bay-shoreline_019.jpg — bayfront, waterfront stories
  beach_pier_001.jpg — pier stories

Downtown:
  downtown_pensacola-aerial-downtown_003.jpg — downtown overview stories
  downtown_palafox-street-dusk_008.jpg — Palafox Street stories
  downtown_pensacola-bay-center_004.jpg — Bay Center stories

**Assignment rules:**
1. Match the thumbnail to the story's primary subject, not its category label.
   A government story about a park project should use a development image, not a gavel.
2. Never assign `/images/flightline-og-default.jpg` when a better option exists.
3. For stories with no clear match, use the most contextually adjacent image available.
4. og-data.json `t` field should match the article thumbnail path.

## Step 11 — Build visual/interactive element if approved

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

## Step 12 — Pre-publish fact verification

### 12A. Binary body-claim checklist (mandatory; cannot publish if any answer is "no")

Before finalizing the article JSON, answer each question below with an explicit
yes or no. Do not publish if any answer is no. Do not skip a question because
"it obviously applies" — write the answer.

- [ ] Did I open the actual PDF (or rendered text) of the memo for every
      agenda item the article describes?
- [ ] Did I read the actual vote panel for every vote the article describes?
- [ ] Does every dollar figure in the article appear, in those exact digits,
      in a primary document I read?
- [ ] Does every vote count in the article appear, in that exact form, in
      the vote panel I read?
- [ ] Does every named person in the article (sponsor, mover, presenter,
      official, applicant) appear with that name and title in a primary
      document I read?
- [ ] If the article uses words like "approved," "adopted," "rejected,"
      "passed," "failed," "deferred," "withdrawn" — does the vote panel
      confirm that exact outcome word for the corresponding motion?
- [ ] If the article describes the discussion (e.g. "without discussion,"
      "after a brief debate," "amid public concern"), did I confirm that
      from the meeting media or minutes — not infer it?
- [ ] **Inverse hypothesis check:** If I had to argue the OPPOSITE of the
      article's lede (the council REJECTED what I said they approved; the
      sponsor was someone OTHER than who I named; the dollar figure is
      MORE/LESS than what I wrote), would the primary documents I have on
      hand let me rule that out? If no — go re-read.

If any answer is no, the article does not publish. The fix is to go back
to Step 5 and read the source documents — not to re-word the article so
the assertion sounds softer.

### 12B. Standard fact-verification pass (in addition to the binary checklist)

Run this checklist against the source documents:

- Every named person: confirm spelling and title against the primary document.
- Every dollar figure: confirm against the primary document — no rounding unless
  the document itself rounds.
- Every vote count: confirm from minutes or a roll call in the agenda packet.
- Every date: confirm the event date, not the document posting date.
- Every quote: confirm it came from official video, a press release, or a public
  statement — never paraphrase into quotation marks.
- Article slug (id): confirm it does not already exist as a key in og-data.json.

### 12C. Interactive and visual elements — additional verification required

Every data point inside a widget, table, chart, spec card, or cluster graphic
must pass the same standard as body copy. These elements get read closely and
shared independently. Errors in them are especially damaging.

**Before publishing any interactive element:**

1. List every discrete claim in the element (every table row, every bullet,
   every number, every label).
2. For each claim, identify the exact sentence or figure in the primary source
   document that supports it.
3. If a claim cannot be traced to a primary source sentence or figure, DELETE IT.
   Do not soften it, hedge it, or mark it "estimated" — remove it entirely.
4. Labels and category names are claims too. "Pensacola-built: hull components"
   is a factual assertion. If the source does not say it, it does not appear.
5. Never infer what a source implies. Only state what it explicitly says.
6. After completing steps 1–5, re-read the element as a reader would — treating
   every cell and bullet as a standalone fact — and verify each one again.

This step is not optional for interactive elements. The widget that published
"Pensacola-built: Hull components" on the Spectre article was a fabrication.
The primary source said only the wing is built in Pensacola. That error
reached the live site. It cannot happen again.

## Step 13 — Validate article HTML before push

Before inserting the article body into articles.js:
1. Scan `body`, `dek`, and `brief` strings for unescaped apostrophes.
   Any apostrophe inside a JS single-quoted string breaks the file. Escape as `\'`
   or rewrite to avoid the contraction.
2. Confirm all `<p>` tags are closed.
3. Confirm no tags other than `<p>` and `<h2>` appear in body unless approved.
4. Confirm `brief` array has exactly 3 strings.
5. Confirm `date` field matches "Month D, YYYY" format exactly.
6. Run `node --check` on the full articles.js after inserting — do not skip this.

## Step 14 — Push to articles.js (the live site)

**articles.js is the live publication file. Adding an article here publishes it immediately.**

The file is at `assets/articles.js` in the repo. It is too large (~2.5MB) for the
GitHub Contents API. Always use the Git Data API flow:

1. GET /git/refs/heads/main → base commit SHA
2. GET /git/commits/:sha → tree SHA
3. Patch the "Updated" timestamp in index.html (see below)
4. POST /git/blobs for articles.js with base64-encoded file content → blob SHA
5. POST /git/blobs for index.html with updated timestamp → blob SHA
6. POST /git/trees with base_tree + both file paths and blob SHAs → tree SHA
7. POST /git/commits with message, new tree SHA, parent commit SHA → commit SHA
8. PATCH /git/refs/heads/main with new commit SHA

**Updating the "Updated" timestamp in index.html:**
Every push must update the `data-deploy` attribute on the `last-updated-stamp` span
in `index.html` with the current UTC Unix epoch (seconds). Find and replace:

  `id="last-updated-stamp" data-deploy="OLD_EPOCH"></span>`

with:

  `id="last-updated-stamp" data-deploy="NEW_EPOCH"></span>`

where `NEW_EPOCH` is `int(time.time())` in Python or `Math.floor(Date.now()/1000)` in JS.

The JS in app.js reads this epoch and formats it in the visitor's local timezone,
so a reader in Central time sees Central time, a reader in Eastern sees Eastern, etc.
The span text content is always empty in HTML — JS fills it on page load.

**Article insertion point:** New articles go immediately after `Object.assign(A, {` at the
top of the file — this ensures they sort as newest in the feed.

**cat values that map to homepage sections:**
  `govt`     → Government section
  `dev`      → Business & Development section
  `military` → Military section
  `sports`   → Sports section
  `opinion`  → Opinion & Analysis section
  `education`, `community`, `analysis` → accessible via Latest and search only;
  no homepage section block for these categories.

**After pushing articles.js**, also update og-data.json with the new article's og entry.
og-data.json is under 1MB — use the Contents API (PUT /contents/:path) for that file.

pending_articles.json is the staging queue only. Articles in pending_articles.json
are NOT visible on the live site. They must be merged into articles.js to publish.

## Step 15 — Confirm deploy on Netlify

After pushing, wait ~15–20 seconds and hard-reload the live site. Confirm the new
article appears in the correct section and that the article modal opens cleanly.
Check the browser console for JS errors.

### Hero article headline sync — mandatory check

If the article being published or updated is featured in the hero section of
index.html, the headline and date are hardcoded directly in index.html and do
NOT update automatically when articles.js changes. They must be updated manually
every time the headline or date changes.

**After every headline or date change to a hero-featured article:**

1. Search index.html for the article slug (e.g. `american-magic-saildrone-spectre`).
2. For every match, read the surrounding HTML and locate any hardcoded headline
   text and date text in that block.
3. Confirm they exactly match the current `headline` and `date` fields in articles.js.
4. If they differ, update index.html in the same push — never leave them out of sync.

This applies to both the mobile hero strip and the desktop hero side panel, which
are separate blocks and must each be checked independently. Failing to do this
caused the Spectre article to display the old headline on the homepage after the
article was rewritten.


