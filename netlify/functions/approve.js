/**
 * The Flightline — Article Approval Function
 * URL: /.netlify/functions/approve?token=XXX&nonce=YYY
 *
 * Validates the HMAC token, reads pending_articles.json from GitHub,
 * prepends the new articles to articles.json, and commits via GitHub API.
 * Netlify auto-deploys on the commit.
 *
 * Required Netlify env vars:
 *   APPROVAL_SECRET  — same value as in GitHub Actions secrets
 *   GITHUB_PAT       — personal access token with repo:contents write scope
 */

const crypto = require("crypto");

const GITHUB_REPO    = "TheFlightline/the-flightline";
const GITHUB_API     = "https://api.github.com";
const GITHUB_BRANCH  = "main";
const TOKEN_TTL_MS   = 48 * 60 * 60 * 1000;

function timingSafeEqual(a, b) {
  const bufA = Buffer.alloc(64, 0);
  const bufB = Buffer.alloc(64, 0);
  Buffer.from(a).copy(bufA);
  Buffer.from(b).copy(bufB);
  return crypto.timingSafeEqual(bufA, bufB);
}

async function githubGet(path, pat) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { Authorization: `token ${pat}`, Accept: "application/vnd.github.v3+json", "User-Agent": "TheFlightline-Bot" }
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`GET ${path}: ${res.status} ${t}`); }
  return res.json();
}

async function githubPut(path, pat, body) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    method: "PUT",
    headers: { Authorization: `token ${pat}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "TheFlightline-Bot" },
    body: JSON.stringify(body)
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`PUT ${path}: ${res.status} ${t}`); }
  return res.json();
}

function decodeFile(d) { return JSON.parse(Buffer.from(d.content, "base64").toString("utf-8")); }
function encodeFile(o) { return Buffer.from(JSON.stringify(o, null, 2)).toString("base64"); }

function successPage(count, date) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Published — The Flightline</title><style>body{font-family:Georgia;background:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;}.card{background:#fff;max-width:480px;padding:48px 40px;border-radius:10px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.1);}</style></head><body><div class="card"><div style="font-size:56px">✓</div><div style="font-family:Arial Black;letter-spacing:.04em;font-size:28px;color:#1e2d4a;margin-bottom:8px">THE FLIGHTLINE</div><div style="font-size:20px;font-weight:700;color:#1e2d4a;margin:16px 0 8px">${count} article${count!==1?"s":""} published</div><div style="font-size:14px;color:#6b7280;margin-bottom:32px">${date} &bull; Netlify will deploy within 60 seconds.</div><a href="https://theflightlinepredeploy.netlify.app" style="background:#1e2d4a;color:#fff;font-family:Arial;font-size:13px;font-weight:700;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:5px;display:inline-block">View the site →</a></div></body></html>`;
}

function errorPage(msg) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error - The Flightline</title></head><body style="font-family:Georgia;text-align:center;padding:60px"><h2 style="color:#c2553f">Error</h2><p style="color:#6b7280">${msg}</p></body></html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return { statusCode: 405, body: "Method not allowed" };

  const { token, nonce } = event.queryStringParameters || {};
  const secret = process.env.APPROVAL_SECRET;
  const pat = process.env.GITHUB_PAT;

  if (!token || !nonce) return { statusCode: 400, headers: {"Content-Type":"text/html"}, body: errorPage("Missing parameters.") };
  if (!secret || !pat) return { statusCode: 500, headers: {"Content-Type":"text/html"}, body: errorPage("Server configuration error.") };

  const expected = crypto.createHmac("sha256", secret).update(nonce).digest("hex");
  if (!timingSafeEqual(token, expected)) return { statusCode: 403, headers: {"Content-Type":"text/html"}, body: errorPage("Invalid or expired token.") };

  try {
    const pendingFile = await githubGet(`/repos/${GITHUB_REPO}/contents/pending_articles.json?ref=${GITHUB_BRANCH}`, pat);
    const pending = decodeFile(pendingFile);

    if (pending.nonce !== nonce) return { statusCode: 400, headers: {"Content-Type":"text/html"}, body: errorPage("This link doesn't match the current pending articles.") };

    const pendingDate = new Date(pending.date);
    if (isNaN(pendingDate) || Date.now() - pendingDate > TOKEN_TTL_MS) return { statusCode: 400, headers: {"Content-Type":"text/html"}, body: errorPage("Approval link expired.") };

    let currentArticles = [], currentSha = null;
    try {
      const af = await githubGet(`/repos/${GITHUB_REPO}/contents/articles.json?ref=${GITHUB_BRANCH}`, pat);
      currentArticles = decodeFile(af); currentSha = af.sha;
    } catch (e) { console.log("articles.json not found, creating fresh"); }

    const updated = [...pending.articles, ...currentArticles];
    const commitBody = {
      message: `content: publish ${pending.articles.length} articles for ${pending.date}`,
      content: encodeFile(updated), branch: GITHUB_BRANCH,
      committer: { name: "Flightline Bot", email: "bot@theflightline.com" }
    };
    if (currentSha) commitBody.sha = currentSha;

    await githubPut(`/repos/${GITHUB_REPO}/contents/articles.json`, pat, commitBody);
    return { statusCode: 200, headers: {"Content-Type":"text/html"}, body: successPage(pending.articles.length, pending.date) };
  } catch (err) {
    console.error("Approval error:", err);
    return { statusCode: 500, headers: {"Content-Type":"text/html"}, body: errorPage(`Error: ${err.message}`) };
  }
};
