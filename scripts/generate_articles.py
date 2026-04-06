#!/usr/bin/env python3
"""
The Flightline Ã¢â¬â Daily Article Generation Script
Calls Claude API to generate 3 articles, saves pending_articles.json,
and writes email_body.html for the approval workflow.
"""

import os
import json
import hmac
import hashlib
import secrets
import urllib.request
import urllib.error
import datetime
import sys
import re

# Ã¢ââ¬Ã¢ââ¬ Config Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
APPROVAL_SECRET   = os.environ.get("APPROVAL_SECRET", "")
SITE_URL          = os.environ.get("SITE_URL", "https://theflightlinepredeploy.netlify.app")
DRY_RUN           = os.environ.get("DRY_RUN", "false").lower() == "true"
GITHUB_ENV        = os.environ.get("GITHUB_ENV", "")

CLAUDE_MODEL   = "claude-opus-4-5"
ARTICLES_COUNT = 3

# Ã¢ââ¬Ã¢ââ¬ Editorial voice Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬

SYSTEM_PROMPT = """You are a staff writer for The Flightline, a hyperlocal news publication covering \the Pensacola, FL metro area Ã¢â¬â Perdido Key to Cantonment, Pensacola Beach, Gulf Breeze, and downtown \Pensacola. The publication focuses on government transparency, public records, local development, and \community accountability.

VOICE & STYLE:
- Plain American English, AP style, no serial commas
- Scene-first openings Ã¢â¬â drop the reader into a specific moment or place
- Short declarative sentences mixed with longer ones. Fragments are fine when they land.
- No hedging. No filler words. No passive voice unless intentional.
- Concrete specific details over abstract adjectives
- Sharp and confident for editorial/opinion; patient and observational for narrative

JOURNALISM STANDARDS:
- SPJ ethical standards. All factual claims attributed to named sources or observable evidence.
- These are feature and analysis pieces Ã¢â¬â not breaking news. Frame as such.
- When a specific fact can't be confirmed, say what is known and what isn't.
- No invented quotes. No speculation presented as fact.
- jurisdiction-specific labels always: "Pensacola City Council member," not just "councilmember"

COVERAGE: Local News, Development & Infrastructure, Government, Military, Sports, Opinion, Education, Events
GEOGRAPHY: Pensacola FL, Pensacola Beach, Gulf Breeze, Perdido Key, Cantonment, Escambia County, Santa Rosa County"""


# Ã¢ââ¬Ã¢ââ¬ Anthropic API call (raw HTTP, no SDK dependency on CI) Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬

def claude(messages, max_tokens=4000, system=SYSTEM_PROMPT):
    payload = json.dumps({
        "model": CLAUDE_MODEL,
        "max_tokens": max_tokens,
        "system": system,
        "messages": messages
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
            return data["content"][0]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Claude API error {e.code}: {body}", file=sys.stderr)
        raise


def extract_json(text):
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*([\[{].*?)\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    for start_char, end_char in [("[", "]"), ("{", "}")]:
        idx = text.find(start_char)
        if idx != -1:
            try:
                return json.loads(text[idx:])
            except json.JSONDecodeError:
                pass
    raise ValueError(f"Could not extract JSON from response:\n{text[:500]}")


def pick_topics(today_str, count=ARTICLES_COUNT):
    month = datetime.date.today().strftime("%B")
    response = claude(
        messages=[{
            "role": "user",
            "content": f"Today is {today_str}. It is {month} in Pensacola.\n\nSuggest {count} article topics for The Flightline.\n\nReturn ONLY a JSON array of {count} objects with: id, cat, label, headline, dek. No markdown."
        }],
        max_tokens=800
    )
    return extract_json(response)


def write_article(topic, today_str):
    response = claude(
        messages=[{
            "role": "user",
            "content": f"Write a complete article for The Flightline.\n\nHeadline: {topic['headline']}\nDek: {topic['dek']}\nCategory: {topic['label']}\nDate: {today_str}\n\nReturn ONLY a JSON object with: id, cat, label, headline, dek, byline:'The Flightline Staff', date, brief (array of 3), body (HTML). No markdown."
        }],
        max_tokens=3500
    )
    return extract_json(response)


def make_token(nonce):
    return hmac.new(
        APPROVAL_SECRET.encode(),
        nonce.encode(),
        hashlib.sha256
    ).hexdigest()


def build_email(articles, approval_url, today_str):
    cards = ""
    for a in articles:
        bullets = "".join(f"<li>{b}</li>" for b in a.get("brief", []))
        cat_color = {"news": "#1a6e9e", "govt": "#c2553f", "dev": "#1a8a6e", "military": "#2a5a8a", "sports": "#c94a00", "education": "#1a5fa8", "opinion": "#5a3d7a", "events": "#8a6e3a"}.get(a.get("cat", "news"), "#1e2d4a")
        cards += f"<div style='border-left:4px solid {cat_color};padding:14px 18px;margin:20px 0;background:#f8fafc;'><div style='font-size:10px;font-weight:700;text-transform:uppercase;color:{cat_color};font-family:Arial;'>{a.get('label','')}</div><div style='font-size:19px;font-weight:700;color:#1e2d4a;font-family:Georgia;margin-bottom:5px;'>{a.get('headline','')}</div><div style='font-size:13px;color:#4b5563;font-family:Georgia;font-style:italic;margin-bottom:10px;'>{a.get('dek','')}</div><ul style='font-size:13px;color:#374151;font-family:Arial;padding-left:18px;margin:0;'>{bullets}</ul></div>"
    return f"<!DOCTYPE html><html><body style='font-family:Georgia;max-width:620px;margin:32px auto;padding:24px;color:#111827;'><div style='background:#1e2d4a;padding:24px;margin-bottom:24px;'><div style='font-family:Arial Black;font-size:30px;font-weight:900;color:#fff;'>THE FLIGHTLINE</div><div style='font-size:12px;color:#d4952b;font-family:Arial;margin-top:4px;'>Pensacola, FL Ã¢âÂ· Daily Article Review</div></div><p style='font-family:Arial;font-size:15px;'>Claude generated <strong>{len(articles)} articles</strong> for <strong>{today_str}</strong>.</p>{cards}<div style='text-align:center;margin:32px 0;'><a href='{approval_url}' style='background:#1e2d4a;color:#fff;font-family:Arial;font-size:14px;font-weight:700;text-transform:uppercase;text-decoration:none;padding:14px 40px;border-radius:5px;display:inline-block;'>Ã¢Åâ APPROVE &amp; PUBLISH</a><div style='font-family:Arial;font-size:11px;color:#9ca3af;margin-top:10px;'>Link expires in 48 hours.</div></div></body></html>"


def main():
    if not ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(1)
    if not APPROVAL_SECRET and not DRY_RUN:
        print("ERROR: APPROVAL_SECRET not set", file=sys.stderr)
        sys.exit(1)

    today = datetime.date.today()
    article_date = today.strftime("%B %-d, %Y")
    today_iso = str(today)

    print(f"Generating articles for {article_date}...")
    print("  Ã¢â â Selecting topics...")
    topics = pick_topics(article_date)
    print(f"  Ã¢â â Topics: {[t['headline'] for t in topics]}")

    articles = []
    for i, topic in enumerate(topics[:ARTICLES_COUNT], 1):
        print(f"  Ã¢â â Writing article {i}/{ARTICLES_COUNT}: {topic['headline']}")
        try:
            articles.append(write_article(topic, article_date))
        except Exception as e:
            print(f"  Ã¢Åâ Failed on article {i}: {e}", file=sys.stderr)

    if not articles:
        print("ERROR: No articles generated", file=sys.stderr)
        sys.exit(1)

    nonce = secrets.token_hex(16)
    token = make_token(nonce) if APPROVAL_SECRET else "dry-run-token"
    pending = {"date": today_iso, "nonce": nonce, "articles": articles}
    approval_url = f"{SITE_URL}/.netlify/functions/approve?token={token}&nonce={nonce}"

    with open("pending_articles.json", "w") as f:
        json.dump(pending, f, indent=2, ensure_ascii=False)

    with open("email_body.html", "w") as f:
        f.write(build_email(articles, approval_url, article_date))

    if GITHUB_ENV:
        with open(GITHUB_ENV, "a") as f:
            f.write(f"ARTICLE_DATE={article_date}\n")
            f.write(f"ARTICLE_COUNT={len(articles)}\n")

    print(f"Done. {len(articles)} articles ready. Approval URL: {approval_url}")


if __name__ == "__main__":
    main()
