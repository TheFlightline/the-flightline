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

## Step 4 — Fetch government meeting agendas and primary documents

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
- Santa Rosa County School Board: https://www.santarosa.k12.fl.us (check meeting agendas)

### Gulf Breeze City Council
- AgendaCenter: https://www.cityofgulfbreeze.us/agendacenter

### Santa Rosa Island Authority (governs Pensacola Beach)
- SRIA meetings and agendas: https://www.sria.fl.gov
  SRIA board actions cover leases, beach development approvals, and Pensacola Beach policy.
  Check every round — SRIA agendas surface development stories before press releases exist.

### ECUA (Emerald Coast Utilities Authority)
- ECUA board agendas: https://www.ecua.fl.gov
  ECUA is the largest utility authority in the area. Rate changes, major infrastructure
  projects, and board contract awards belong in this publication.

### Triumph Gulf Coast
- Board meeting notices and grant awards: https://triumphgulf.org
  Triumph controls hundreds of millions in BP settlement funds for NW Florida.
  Grant awards and project approvals are significant economic development stories.

### NAS Pensacola / Military
- Naval Air Station Pensacola public affairs: https://www.cnic.navy.mil/regions/cnrse/installations/nas_pensacola.html
- Blue Angels schedule and policy changes: https://www.blueangels.navy.mil/show/
- National Naval Aviation Museum: https://navalaviationmuseum.org/blueangels/
  Check for any base access policy updates, unit activations, or command announcements.

### FDOT / Transportation
- Northwest Florida Roads: https://nwflroads.com
  Search active projects in Escambia and Santa Rosa counties.
  Fetch any new project notices, lane closure announcements, or public meeting notices.
- TPO: https://www.pensacola-tpo.org
  Check for TIP amendments, public meetings, and new project initiations.

### Port of Pensacola
- Port news and board agendas: https://portofpensacola.com/news

### Pensacola International Airport
- Airport news and construction updates: https://flypensacola.com and https://transformpns.com

### UWF
- UWF news: https://uwf.edu/news
  Check for any budget actions, enrollment figures, athletics news, or grant awards.

### Elections
- Escambia County Supervisor of Elections: https://escambiavotes.gov/news
- Santa Rosa County Supervisor of Elections: https://santarosavotes.gov
  During qualifying and election periods, check candidate filings daily.

### Florida Legislature (when session is active or bills affect Pensacola)
- Florida House: https://www.floridahouse.gov
- Florida Senate: https://www.flsenate.gov
  Search bills by keyword (Escambia, Pensacola, NAS, ECUA, etc.) for any legislation
  with direct local impact. Track bills through committee and floor votes.

### Federal / Other
- USACE public notices for bay and coastal projects:
  https://www.saj.usace.army.mil/Missions/Regulatory/Public-Notices/
  Any permit application for work in Pensacola Bay, bayous, or coastal areas.
- FAA Notices to Air Missions (NOTAMs) and environmental notices for PNS activity.
- NOAA fisheries management notices affecting Gulf Coast operations.

### Courts and Legal Records
- Florida state court portal: https://myeclerk.myorangeclerk.com or
  https://www.escambiaclerk.com/official-records for Escambia County filings.
- PACER (federal): check for any significant federal cases involving local entities.
  Note case numbers and docket entries; do not report on filings without reading them.

### Permits and Land Use
- Escambia County permit search: https://myescambia.com/our-services/development-services
- City of Pensacola building permits: https://www.mygovernmentonline.org (Pensacola)
  Major permit applications — especially commercial, multifamily, or demolition —
  surface development stories before press releases or groundbreakings are announced.
- FDOT environmental notices (ETDM): https://etdmpub.fla-etat.org
  New project screenings signal road or transit projects years in advance.

---

**Acceptable sources (full list):**
- Government agenda packets fetched directly from CivicClerk, AgendaCenter,
  Legistar, BoardDocs, MuniDocs
- Memos, ordinances, resolutions, RFPs, meeting video
- Official agency press releases (city, county, NAS, UWF, FDOT, etc.)
- Primary documents: court filings, audits, contracts, letters, budgets, permit applications

**NOT acceptable:**
WEAR, Fox10, WKRG, PNJ, AOL, NorthEscambia.com, ricksblog, or any secondary
outlet — even to lead to a primary source.
If only secondary reporting exists and the primary document cannot be found, drop the story.

## Step 5 — Verify recency and authenticity on every source

For each candidate story:
1. Confirm the actual URL loads and is a government or official agency domain.
2. Confirm the publication or posting date on the primary document — not the date
   a news aggregator indexed it.
3. Confirm the document falls within the requested time window.
4. Confirm any dollar figures, vote counts, and named parties appear in the
   document itself — not inferred from coverage.

Never trust aggregator dates. Go to the original page. If the primary document
cannot be loaded or confirmed, drop the story from candidates.

## Step 6 — Present candidates to Drew before writing

List each story candidate with:
- Proposed headline
- Primary source: the actual government document URL and its confirmed date
  (not a news article — the agenda, resolution, press release, or filing itself)
- One sentence on why it's worth covering

Wait for approval or cuts. Do not draft until approved.

## Step 7 — Write to Flightline news style

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

## Step 8 — Pre-publish fact verification

Before finalizing the article JSON, run this checklist against the source document:

- Every named person: confirm name spelling and title against the primary document.
- Every dollar figure: confirm against the primary document — no rounding unless
  the document itself rounds.
- Every vote count: confirm (e.g., "voted 5-2" must appear in minutes or be
  inferable from a roll call in the agenda packet).
- Every date: confirm the event date, not the document posting date.
- Every quote: if direct quotes appear, confirm they came from official video,
  a press release, or a public statement — never paraphrase into quotation marks.
- Article slug (id): confirm it does not already exist as a key in og-data.json.
  If it does, modify the slug (e.g., append `-2`) before proceeding.

If any item cannot be verified against the primary document, rewrite that
sentence as a paraphrase attributed to the source, or cut it.

## Step 9 — Identify image

Find a public domain image appropriate to the story.
Sources: Wikimedia Commons, NARA, LOC, U.S. Navy, NOAA, Unsplash.
Record the filename. If none exists, use default and flag it.

## Step 10 — Validate article HTML before push

Before inserting the article body into pending_articles.json:
1. Scan the `body` string for unescaped apostrophes in possessives and contractions.
   Any apostrophe inside a JS string delimited by single quotes will break the file.
   Escape as `\'` or rewrite the sentence to avoid the contraction.
2. Scan the `dek` and `brief` array strings for the same issue.
3. Confirm all `<p>` tags are closed. Confirm no tags other than `<p>` and `<h2>`
   appear in the body unless explicitly approved.
4. Confirm the `brief` array has exactly 3 strings.
5. Confirm the `date` field matches "Month D, YYYY" format exactly.

## Step 11 — Push

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
