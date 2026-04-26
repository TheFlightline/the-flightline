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

## Step 4 — Find story candidates from primary sources only

Acceptable sources:
- Government agenda packets: CivicClerk, AgendaCenter, MuniDocs
- Memos, ordinances, resolutions, RFPs, meeting video
- Official agency press releases (city, county, NAS, UWF, FDOT, etc.)
- Primary documents: court filings, audits, contracts, letters, budgets

NOT acceptable: WEAR, Fox10, WKRG, PNJ, AOL, NorthEscambia.com, ricksblog,
or any secondary outlet — even to lead to a primary source.
If only secondary reporting exists and the primary document cannot be found, drop the story.

## Step 5 — Verify recency on every source

Confirm the actual URL, the actual publication date on the primary document,
and that it falls within the requested time window.
Never trust aggregator dates. Go to the original page.

## Step 6 — Present candidates to Drew before writing

List each story candidate with:
- Proposed headline
- Primary source URL and date
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
