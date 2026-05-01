#!/usr/bin/env node
// Flightline article schema validator.
// Usage: node scripts/validate_article.js <slug>
//
// Enforces the sources/verification schema described in ARTICLE_PROCESS.md
// Step 3 (additions for articles dated May 1, 2026 or later). Designed to
// run BEFORE pushing the article to assets/articles.js on main.
//
// Pass: exit code 0, prints "OK".
// Fail: exit code 1, prints every rule that failed with the article slug
// and the specific issue.
//
// Created in response to the cra-interlocal-amendment factual error
// (April 24, 2026), where an article said the council approved an
// amendment that the vote panel actually showed had failed 5-2.

const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '..', 'assets', 'articles.js');
const CUTOFF_DATE = new Date('2026-05-01T00:00:00Z');

const ALLOWED_SOURCE_TYPES = new Set([
  'agenda_packet', 'memo', 'resolution', 'ordinance', 'vote_panel',
  'meeting_recording', 'press_release', 'court_filing', 'contract',
  'letter', 'budget', 'permit', 'report', 'other'
]);

const VOTE_BODY_TYPES = new Set([
  'budget', 'contract', 'agenda_packet', 'memo', 'resolution', 'report'
]);

const VOTE_OUTCOME_WORDS = [
  /\bapproved\b/i, /\badopted\b/i, /\brejected\b/i, /\bpassed\b/i,
  /\bfailed\b/i, /\bvoted\b/i, /\bvoted down\b/i, /\bvoted to\b/i,
  /\bunanimously\b/i, /\bsplit\b/i, /\bmotion\b/i
];

const DOLLAR_REGEX = /\$[\d,]+/;

function loadArticles() {
  const code = fs.readFileSync(ARTICLES_PATH, 'utf8');
  global.window = {};
  const wrap = '(function(){' + code + '; return A;})()';
  // eslint-disable-next-line no-eval
  return eval(wrap);
}

function parseDate(s) {
  if (!s) return null;
  // Accept "Month D, YYYY"
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function validate(slug, entry) {
  const failures = [];

  // Date check — grandfather pre-cutoff articles
  const articleDate = parseDate(entry.date);
  if (!articleDate) {
    failures.push(`date field unparseable: "${entry.date}"`);
    return failures;
  }
  if (articleDate < CUTOFF_DATE) {
    return failures; // grandfathered
  }

  // sources field
  if (!entry.sources) {
    failures.push('sources field missing');
  } else if (!Array.isArray(entry.sources)) {
    failures.push('sources must be an array');
  } else if (entry.sources.length === 0) {
    failures.push('sources array is empty');
  } else {
    entry.sources.forEach((s, i) => {
      if (!s.type) failures.push(`sources[${i}].type missing`);
      else if (!ALLOWED_SOURCE_TYPES.has(s.type))
        failures.push(`sources[${i}].type "${s.type}" not in allowed list`);
      if (!s.url) failures.push(`sources[${i}].url missing`);
      if (!s.label) failures.push(`sources[${i}].label missing`);
      if (!s.retrieved_at) failures.push(`sources[${i}].retrieved_at missing`);
    });
  }

  // verification field
  if (!entry.verification) {
    failures.push('verification field missing');
  } else {
    const v = entry.verification;
    if (!v.verified_at) failures.push('verification.verified_at missing');
    else if (!parseDate(v.verified_at)) failures.push(`verification.verified_at unparseable: "${v.verified_at}"`);
    if (!v.verified_by) failures.push('verification.verified_by missing');
    if (!Array.isArray(v.key_facts_checked)) failures.push('verification.key_facts_checked must be an array');
  }

  // Body rules
  const body = entry.body || '';

  // Vote-outcome word check
  const hasVoteWord = VOTE_OUTCOME_WORDS.some(re => re.test(body));
  if (hasVoteWord) {
    if (!entry.verification || !entry.verification.vote_recorded || entry.verification.vote_recorded.trim() === '') {
      failures.push('body contains a vote-outcome word but verification.vote_recorded is empty');
    }
    if (!entry.verification || !entry.verification.vote_url || entry.verification.vote_url.trim() === '') {
      failures.push('body contains a vote-outcome word but verification.vote_url is empty');
    }
  }

  // Dollar figure check
  const hasDollar = DOLLAR_REGEX.test(body);
  if (hasDollar) {
    if (entry.sources && Array.isArray(entry.sources)) {
      const hasFinancialSource = entry.sources.some(s => VOTE_BODY_TYPES.has(s.type));
      if (!hasFinancialSource) {
        failures.push('body contains a dollar figure but sources includes no budget/contract/agenda_packet/memo/resolution/report entry');
      }
    }
  }

  return failures;
}

// CLI
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/validate_article.js <slug>');
  process.exit(2);
}

let A;
try {
  A = loadArticles();
} catch (e) {
  console.error('Failed to load articles.js:', e.message);
  process.exit(2);
}

const entry = A[slug];
if (!entry) {
  console.error(`Article not found: ${slug}`);
  process.exit(2);
}

const failures = validate(slug, entry);
if (failures.length === 0) {
  console.log(`OK: ${slug} passes schema validation`);
  process.exit(0);
} else {
  console.error(`FAIL: ${slug}`);
  failures.forEach(f => console.error(`  - ${f}`));
  console.error('');
  console.error('Fix per ARTICLE_PROCESS.md Step 3 (schema) and Step 5.5 (research file).');
  console.error('Do not weaken the article language to bypass the validator. Read the sources.');
  process.exit(1);
}
