# Flightline article research files

This directory holds the research files that back every article published
on or after May 1, 2026, per ARTICLE_PROCESS.md Step 5.5.

## Purpose

The research file is the audit trail. Every fact in the article body must
trace to a line in the corresponding research file. Every source URL the
article relies on appears here. Every claim that was considered but cut
because it could not be confirmed appears in the "DO NOT WRITE" section.

This exists because of one specific failure: the cra-interlocal-amendment
article (April 24, 2026) inverted a 5-2 council rejection as approval.
It happened because the article was drafted from the agenda title, not the
memo and the vote panel. With a research file required, that failure mode
can't recur — the empty Vote section in the file is the warning sign before
the article publishes, and the validator (scripts/validate_article.js)
catches the structural mismatch at push time.

## Naming

One file per article, same slug:

```
research/{slug}.md
```

Example:
```
research/helm-at-hawkshaw-planning-board-041426.md
```

## Required structure

See ARTICLE_PROCESS.md Step 5.5 for the full template. Minimum sections:

1. Item identification (meeting, item number, sponsor with source URL)
2. Subject (verbatim title and substance with source URL)
3. Vote (for vote items: result, names, source URL)
4. Discussion (length, source recording or minutes)
5. Background facts (each with source URL)
6. Body claims that DO NOT appear in primary sources (DO NOT WRITE)

## Workflow

1. Drew approves a candidate at Step 8.
2. Before writing the body, create `research/{slug}.md` and fill out
   sections 1-5 from primary documents only.
3. Fill out section 6 with claims you're tempted to make but cannot source.
4. Write the article. Every body claim must trace to a section 1-5 line.
5. Run `node scripts/validate_article.js {slug}` before push.
6. Push the article AND the research file together.

## Existing research files

The 157 articles published before May 1, 2026 do not have research files.
They are grandfathered and will not be retroactively backfilled unless a
correction is filed (in which case the corrected version gets a research
file as part of the correction process — see corrections/ directory).
