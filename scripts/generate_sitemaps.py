#!/usr/bin/env python3
"""
The Flightline -- Sitemap Generator

Reads assets/articles.js and produces:
  - sitemap.xml            (full site index, all URLs)
  - news-sitemap.xml       (Google News sitemap, articles from last 48 hours only)

Run from repo root:
    python3 scripts/generate_sitemaps.py

Optional env vars:
    SITE_URL  -- defaults to https://theflightline.news
    NOW       -- override "now" for testing, ISO 8601 UTC (e.g. 2026-04-27T12:00:00Z)
"""

import os
import re
import sys
import json
from datetime import datetime, timedelta, timezone

SITE_URL = os.environ.get("SITE_URL", "https://theflightline.news").rstrip("/")
ARTICLES_JS = "assets/articles.js"
PUBLICATION_NAME = "The Flightline"
PUBLICATION_LANG = "en"

# Static pages to include in the regular sitemap
STATIC_PAGES = [
    ("/", "daily", "1.0"),
    ("/?p=about", "monthly", "0.5"),
    ("/?p=our-mission", "monthly", "0.5"),
    ("/?p=contact", "monthly", "0.4"),
    ("/?p=tips", "monthly", "0.5"),
    ("/?p=letters", "weekly", "0.6"),
    ("/?p=advertise", "monthly", "0.4"),
    ("/?p=newsletter", "monthly", "0.5"),
    ("/?p=subscribe", "monthly", "0.5"),
    ("/?p=privacy", "yearly", "0.2"),
    ("/?p=terms", "yearly", "0.2"),
]


def now_utc():
    override = os.environ.get("NOW")
    if override:
        return datetime.fromisoformat(override.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)


def parse_articles(js_text):
    """Walk articles.js and extract one record per top-level slug."""
    m = re.search(r"Object\.assign\(\s*A\s*,\s*\{", js_text)
    if not m:
        raise RuntimeError("Could not find Object.assign(A, {...}) in articles.js")

    start = m.end()
    depth = 1
    i = start
    in_str = False
    str_ch = None
    escape = False
    while i < len(js_text) and depth > 0:
        c = js_text[i]
        if in_str:
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == str_ch:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_ch = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
        i += 1
    body = js_text[start:i - 1]

    entries = []
    i, n = 0, len(body)
    while i < n:
        while i < n and body[i] in " \t\r\n,":
            i += 1
        if i >= n:
            break
        if body[i] != '"':
            i += 1
            continue
        # Read key
        key_start = i + 1
        j = i + 1
        while j < n:
            if body[j] == "\\":
                j += 2
                continue
            if body[j] == '"':
                break
            j += 1
        key = body[key_start:j]
        i = j + 1
        while i < n and body[i] in " \t\r\n:":
            i += 1
        if i >= n or body[i] != "{":
            continue
        depth = 1
        i += 1
        val_start = i
        in_str = False
        str_ch = None
        escape = False
        while i < n and depth > 0:
            c = body[i]
            if in_str:
                if escape:
                    escape = False
                elif c == "\\":
                    escape = True
                elif c == str_ch:
                    in_str = False
            else:
                if c in ('"', "'"):
                    in_str = True
                    str_ch = c
                elif c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
            i += 1
        val = body[val_start:i - 1]
        entries.append((key, val))
    return entries


def field(val_src, name):
    pat = re.compile(r'"' + re.escape(name) + r'"\s*:\s*"((?:[^"\\]|\\.)*)"')
    m = pat.search(val_src)
    if not m:
        return None
    raw = m.group(1)
    return raw.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')


# Parse "April 27, 2026" -> datetime at noon UTC
MONTHS = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12,
}


def parse_date_string(s):
    if not s:
        return None
    m = re.match(r"^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$", s.strip())
    if not m:
        return None
    month_name, day, year = m.group(1), int(m.group(2)), int(m.group(3))
    month = MONTHS.get(month_name)
    if not month:
        return None
    # Anchor at 12:00 UTC; we don't have publish-time precision, so noon is the safe default
    return datetime(year, month, day, 12, 0, 0, tzinfo=timezone.utc)


def xml_escape(s):
    if s is None:
        return ""
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
         .replace("'", "&apos;")
    )


def build_records(entries):
    records = []
    for slug, val in entries:
        headline = field(val, "headline")
        date_str = field(val, "date")
        if not headline or not date_str:
            continue
        dt = parse_date_string(date_str)
        if not dt:
            continue
        records.append({
            "slug": slug,
            "headline": headline,
            "datetime": dt,
            "date": date_str,
            "dek": field(val, "dek"),
            "byline": field(val, "byline"),
            "cat": field(val, "cat"),
            "label": field(val, "label"),
            "thumbnail": field(val, "thumbnail"),
            "body": field(val, "body"),
            "brief": field(val, "brief"),
        })
    # Sort newest first
    records.sort(key=lambda r: r["datetime"], reverse=True)
    return records


def build_main_sitemap(records, lastmod_iso):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
        ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ]
    # Static pages
    for path, freq, priority in STATIC_PAGES:
        lines.append("  <url>")
        lines.append(f"    <loc>{SITE_URL}{path}</loc>")
        lines.append(f"    <lastmod>{lastmod_iso}</lastmod>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")
    # Articles
    for r in records:
        loc = f"{SITE_URL}/story/{r['slug']}"
        lastmod = r["datetime"].strftime("%Y-%m-%dT%H:%M:%S+00:00")
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("    <changefreq>monthly</changefreq>")
        lines.append("    <priority>0.8</priority>")
        if r.get("thumbnail"):
            img_url = r["thumbnail"]
            if img_url.startswith("/"):
                img_url = SITE_URL + img_url
            lines.append("    <image:image>")
            lines.append(f"      <image:loc>{xml_escape(img_url)}</image:loc>")
            lines.append(f"      <image:title>{xml_escape(r['headline'])}</image:title>")
            lines.append("    </image:image>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def build_articles_json(records, generated_at):
    """Emit a JSON file the SSR edge function can read at runtime.

    Schema:
      {
        "generated_at": "2026-04-29T...Z",
        "count": 124,
        "articles": {
           "<slug>": {
             "slug": "...",
             "headline": "...",
             "dek": "...",
             "byline": "...",
             "date": "April 27, 2026",
             "datePublished": "2026-04-27T12:00:00+00:00",
             "cat": "govt",
             "label": "Government",
             "thumbnail": "/images/...",
             "body": "<p>...</p>",
             "brief": "..."
           },
           ...
        }
      }

    Keyed by slug (object, not array) so the edge function can do O(1) lookup.
    """
    articles = {}
    for r in records:
        articles[r["slug"]] = {
            "slug": r["slug"],
            "headline": r["headline"],
            "dek": r.get("dek"),
            "byline": r.get("byline"),
            "date": r.get("date"),
            "datePublished": r["datetime"].strftime("%Y-%m-%dT%H:%M:%S+00:00"),
            "cat": r.get("cat"),
            "label": r.get("label"),
            "thumbnail": r.get("thumbnail"),
            "body": r.get("body"),
            "brief": r.get("brief"),
        }
    payload = {
        "generated_at": generated_at,
        "count": len(records),
        "articles": articles,
    }
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n"


def build_news_sitemap(records, now):
    """Google News sitemap rules: only articles published in the last 48 hours.

    Filter is strictly past-and-within-window: an article's date must be <= now
    AND >= now - 48h. Future-dated entries (e.g., events) are excluded.
    """
    cutoff = now - timedelta(hours=48)
    recent = [r for r in records if cutoff <= r["datetime"] <= now]

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
        ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ]
    for r in recent:
        loc = f"{SITE_URL}/story/{r['slug']}"
        pub_date = r["datetime"].strftime("%Y-%m-%dT%H:%M:%S+00:00")
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append("    <news:news>")
        lines.append("      <news:publication>")
        lines.append(f"        <news:name>{xml_escape(PUBLICATION_NAME)}</news:name>")
        lines.append(f"        <news:language>{PUBLICATION_LANG}</news:language>")
        lines.append("      </news:publication>")
        lines.append(f"      <news:publication_date>{pub_date}</news:publication_date>")
        lines.append(f"      <news:title>{xml_escape(r['headline'])}</news:title>")
        lines.append("    </news:news>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n", len(recent)


def main():
    if not os.path.exists(ARTICLES_JS):
        print(f"ERROR: {ARTICLES_JS} not found. Run from repo root.", file=sys.stderr)
        sys.exit(1)

    with open(ARTICLES_JS, "r", encoding="utf-8") as f:
        js_text = f.read()

    entries = parse_articles(js_text)
    records = build_records(entries)
    print(f"Parsed {len(records)} articles from {ARTICLES_JS}")
    if not records:
        print("ERROR: no articles parsed; aborting to avoid wiping sitemaps.", file=sys.stderr)
        sys.exit(1)

    now = now_utc()
    lastmod_iso = now.strftime("%Y-%m-%dT%H:%M:%S+00:00")

    main_xml = build_main_sitemap(records, lastmod_iso)
    news_xml, news_count = build_news_sitemap(records, now)
    articles_json = build_articles_json(records, lastmod_iso)

    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(main_xml)
    with open("news-sitemap.xml", "w", encoding="utf-8") as f:
        f.write(news_xml)
    with open("articles.json", "w", encoding="utf-8") as f:
        f.write(articles_json)

    print(f"Wrote sitemap.xml      ({len(records)} articles + {len(STATIC_PAGES)} static pages)")
    print(f"Wrote news-sitemap.xml ({news_count} articles in last 48h)")
    print(f"Wrote articles.json    ({len(records)} articles, {len(articles_json):,} bytes)")


if __name__ == "__main__":
    main()
