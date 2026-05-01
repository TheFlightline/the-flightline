# Process Fixes 1, 2, 3 — Design Spec for Drew's Review

**Status:** Proposed. Not yet integrated into ARTICLE_PROCESS.md.
**Prompted by:** cra-interlocal-amendment factual error (April 24, 2026
article inverted a 5-2 council rejection as approval). See
`corrections/001-cra-interlocal-amendment.md`.

These three fixes layer with Rule 8 and the binary Step 12 checklist
already pushed in commit 6fd14be. They make the cra-interlocal-amendment
failure mode structurally impossible rather than just process-prohibited.

---

## Fix 1: Add `sources` and `verification` fields to the article schema

### Schema addition

Every article entry in `assets/articles.js` adds two new fields:

```javascript
{
  // ... existing fields (cat, label, thumbnail, headline, dek,
  //     byline, date, brief, body) ...

  sources: [
    {
      type: "agenda_packet",
      url: "https://pensacolafl.portal.civicclerk.com/event/1783/files/report/4256",
      label: "Memorandum, File 26-486",
      retrieved_at: "2026-04-30"
    },
    {
      type: "vote_panel",
      url: "https://pensacolafl.portal.civicclerk.com/event/1783/overview",
      label: "City Council Regular Meeting Apr 23 2026 — Item 6 motion detail",
      retrieved_at: "2026-04-30"
    }
  ],

  verification: {
    vote_recorded: "5-2 against (Yes: Brahier, Bare; No: Patton, Broughton, Jones, Moore, Wiggins)",
    vote_url: "https://pensacolafl.portal.civicclerk.com/event/1783/overview",
    key_facts_checked: [
      "Sponsor: Charles Bare (File 26-486)",
      "Subject: Article 2.2 staff supervision (Amendment No. 2 attachment 10862)",
      "Debate length: 42 minutes (recording 01:28:22 — 02:10:09)"
    ],
    verified_at: "2026-04-30",
    verified_by: "Claude"
  }
}
```

### Allowed `type` values for `sources[].type`

- `agenda_packet`
- `memo`
- `resolution`
- `ordinance`
- `vote_panel`
- `meeting_recording`
- `press_release` (only from the agency itself, not a news outlet)
- `court_filing`
- `contract`
- `letter`
- `budget`
- `permit`
- `report` (audits, consultant studies)
- `other` (with a description in `label`)

### Validation rules (enforced in Step 13)

Pre-push validator refuses the commit if:
- `sources` is missing, empty, or all entries are missing required fields.
- The body contains any of these vote-outcome words and `verification.vote_recorded`
  is missing or empty: `approved`, `adopted`, `rejected`, `passed`, `failed`,
  `voted`, `voted down`, `voted to`, `unanimously`, `split`, `motion`.
- The body contains a dollar figure (regex: `\$[\d,]+`) and `sources` contains
  no entry of type `budget`, `contract`, `agenda_packet`, `memo`, `resolution`,
  or `report`.
- The body names a person with a title (regex roughly: capitalized name
  followed by Council Member, Mayor, Commissioner, Chair, Director, etc.) and
  `verification.key_facts_checked` is empty.

### Backward compatibility

The 157 already-published articles do not have these fields. The validator
applies only to articles whose `date` is after the date this fix ships
(proposed: May 1, 2026). Pre-cutoff articles are grandfathered.

---

## Fix 2: Pre-write research artifact

### Requirement

Before writing the body of any article, the following file must exist:

`/tmp/article-research-{slug}.md`

### Required structure

```markdown
# Research file: {slug}

## Item identification
- Meeting: [body name, date]
- Agenda item: [item number]
- File: [file number if applicable]
- Sponsor: [name, title]
  → confirmed in: [URL of memo or attachment, page reference]

## Subject
- Title: [verbatim from agenda or memo]
- Substance: [what the action actually does]
  → confirmed in: [URL of attachment, section reference]

## Vote (for vote items)
- Result: [PASSED/FAILED, vote count]
- Yes: [names]
- No: [names]
- Abstain: [count, names]
  → confirmed in: [URL of vote panel]

## Discussion (for substantive items)
- Length: [duration, with timestamps]
- Source: [meeting recording URL or minutes]

## Background facts (each must trace to source)
- [fact] → [URL or document reference]
- [fact] → [URL or document reference]

## Body claims that DO NOT appear in primary sources (DO NOT WRITE)
- [tempting claim] — would need: [what document would have to confirm it]
```

### Discipline

- Anything in the article body must trace to a line in the research file.
- The "DO NOT WRITE" section is a feature, not a bug. It surfaces what
  the writer wants to assume but cannot confirm. Writing it down forces
  the choice between (a) finding the source or (b) cutting the claim.
- The research file is committed to a `research/` directory in the repo
  alongside the article, with the same slug name. This creates an audit
  trail and lets future verification work reference what was actually
  consulted.

### Failure mode this catches

Before drafting cra-interlocal-amendment, this requirement would have
forced filling out "## Vote — Result: [???] → confirmed in: [URL]". The
slot is empty until the vote panel is opened. If the writer ships the
article anyway, the empty slot in the research file is the audit trail.
With Fix 1 in place, the validator catches the mismatch between an
article that says "approved" and a research file with an empty Vote
section.

---

## Fix 3: Lede comes last for meeting stories

### Rule

For any article whose primary subject is a meeting action — a vote, a
public hearing, a board decision, an ordinance adoption, a resolution
passage, an RFP award, a permit approval — the writing order is fixed:

1. Read the agenda packet PDF for the item.
2. Read the vote panel (or, if the meeting hasn't happened, the recommendation).
3. Watch the discussion if a substantive item; scrub timestamps for length and key exchanges.
4. Pull background facts from linked attachments (prior amendments, related ordinances).
5. Fill out the "Body claims that DO NOT appear in primary sources" section.
6. ONLY NOW write the lede.

### Rationale

The cra-interlocal-amendment failure was a lede-first failure. The
agenda title ("Amendment No. 2 — Interlocal — Administrative
Services") suggested a routine update. The lede was drafted off that
suggestion. The body was filled in around the lede. The vote panel
was never read.

If the lede is constrained by what's in the research file rather than
by what the item title suggests, the entire failure mode disappears.

### What "meeting story" includes

- City Council action items
- BCC action items
- School Board action items
- Planning Board / ARB / BOA decisions
- CRA Board actions
- Triumph Gulf Coast grant approvals
- TPO project approvals
- SRIA actions
- Any state or federal agency action affecting Pensacola

### What it does not include

- Pure profile pieces
- Cultural / arts coverage
- Sports
- Op-eds (which Drew writes himself; Claude does not draft opinion under the news byline)
- Press release rewrites where the press release is itself the primary source

For these categories, the lede may be drafted in any order, though the
research file is still required for any factual claim.

---

## Implementation sequence (proposed)

1. Drew reviews and approves this spec (or sends edits).
2. Update `ARTICLE_PROCESS.md`:
   - Step 3: add the `sources` and `verification` fields to the schema description.
   - New Step 5.5 (or appendix to Step 5): the research file requirement.
   - Step 9: lede-comes-last rule for meeting stories.
   - Step 13: validator rules for the new schema fields.
3. Implement the validator script (Node or Python; lives in `scripts/validate_article.{js,py}`).
4. Add a `research/` directory to the repo with a README explaining purpose.
5. Future articles use the new fields. The 157 existing articles are grandfathered.
