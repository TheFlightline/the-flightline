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
covering the requested time window.

**Required sources to check every round:**

### City of Pensacola
- Legistar meeting calendar: https://pensacola.legistar.com/Calendar.aspx
  Fetch meeting detail pages for any City Council, CRA, or Planning Board meetings
  in the window. Pull the agenda packet PDF for each meeting found.
- City newsflash/press releases: https://www.cityofpensacola.com/m/newsflash

### Escambia County
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
- Santa Rosa County School Board: check district site for meeting agendas

### Gulf Breeze City Council
- AgendaCenter: https://www.cityofgulfbreeze.us/agendacenter or equivalent

### NAS Pensacola / Military
- Naval Air Station Pensacola public affairs releases: check navy.mil and
  navalaviationmuseum.org for any base policy changes, unit activations, or
  command announcements
- Blue Angels: https://www.blueangels.navy.mil/show/ for schedule changes

### FDOT / Transportation
- Northwest Florida Roads: https://nwflroads.com
  Search for active projects in Escambia and Santa Rosa counties.
  Fetch any new project notices, lane closure announcements, or public meeting notices.
- TPO (Pensacola Bay Area Transportation Planning Organization):
  Check https://www.pensacola-tpo.org for any new TIP amendments or meeting actions.

### Other agencies to check each round:
- Pensacola International Airport: https://flypensacola.com and https://transformpns.com
- Port of Pensacola: https://portofpensacola.com/news
- UWF: https://uwf.edu/news
- Escambia County Supervisor of Elections: https://escambiavotes.gov/news
  (especially during election filing periods)

**How to fetch:**
- For each source, load the calendar or agenda center page.
- Identify every meeting that falls within the requested time window.
- Fetch the agenda or packet document directly (PDF or HTML).
- Read it. Note any items with dollar amounts, votes, contract awards,
  ordinance readings, rezoning requests, personnel actions, or public hearings.
- These items are your raw story candidates. Do not rely on news coverage
  to discover what happened at meetings — go to the document.

**Acceptable sources (full list):**
- Government agenda packets fetched directly from CivicClerk, AgendaCenter,
  Legistar, BoardDocs, MuniDocs
- Memos, ordinances, resolutions, RFPs, meeting video
- Official agency press releases (city, county, NAS, UWF, FDOT, etc.)
- Primary documents: court filings, audits, contracts, letters, budgets

**NOT acceptable:**
WEAR, Fox10, WKRG, PNJ, AOL, NorthEscambia.com, ricksblog, or any secondary
outlet — even to lead to a primary source.
If only secondary reporting exists and the primary document cannot be found, drop the story.

## Step 5 — Verify recency on every source

Confirm the actual URL, the actual publication date on the primary document,
and that it falls within the requested time window.
Never trust aggregator dates. Go to the original page.

## Step 6 — Present candidates to Drew before writing

List each story candidate with:
- Proposed headline
- Primary source URL and date (the actual government document, not a news article)
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

## Step 8 — Identify image

Find a public domain image appropriate to the story.
Sources: Wikimedia Commons, NARA, LOC, U.S. Navy, NOAA, Unsplash.
Record the filename. If none exists, use default and flag it.

## Step 9 — Push

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
