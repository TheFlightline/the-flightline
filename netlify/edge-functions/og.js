// Netlify Edge Function: og.js
// Intercepts social crawler requests to /story/:id and returns OG-tagged HTML
// Normal browsers pass through untouched.

export default async function handler(request, context) {
  const ua = request.headers.get("user-agent") || "";
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|pinterest|Google.*snippet|vkShare|W3C_Validator|Googlebot|bingbot|ia_archiver/i.test(ua);
  
  if (!isCrawler) {
    return context.next();
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const articleId = pathParts[2];

  const siteUrl = "https://theflightline.news";
  const siteName = "The Flightline";
  const defaultImage = siteUrl + "/images/flightline-og-default.jpg";
  const defaultDesc = "Pensacola's civic news source. No Static. Just the Story.";

  let title = "The Flightline — Pensacola, FL";
  let description = defaultDesc;
  let image = defaultImage;
  let canonical = siteUrl;

  if (articleId) {
    try {
      const artRes = await fetch(siteUrl + "/assets/articles.js");
      const artText = await artRes.text();
      
      // Find the article block — use a more robust extraction
      const escapedId = articleId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      
      // Find the start of this article's entry
      const keyIdx = artText.indexOf('"' + articleId + '"');
      if (keyIdx >= 0) {
        // Extract a 2000-char window after the key
        const block = artText.substring(keyIdx, keyIdx + 2000);
        
        // Extract headline — handle both single and double quoted, and escaped quotes
        // Match headline: "..." or headline: '...' robustly
        const hlMatch = block.match(/headline\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const hlMatchSingle = !hlMatch && block.match(/headline\s*:\s*'((?:[^'\\]|\\.)*)'/);
        const hl = hlMatch ? hlMatch[1] : (hlMatchSingle ? hlMatchSingle[1] : null);
        if (hl) {
          // Unescape and clean
          title = hl.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\/g, '') + " — " + siteName;
        }
        
        // Extract dek
        const dkMatch = block.match(/dek\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const dkMatchSingle = !dkMatch && block.match(/dek\s*:\s*'((?:[^'\\]|\\.)*)'/);
        const dk = dkMatch ? dkMatch[1] : (dkMatchSingle ? dkMatchSingle[1] : null);
        if (dk) {
          description = dk.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\/g, '').substring(0, 250);
        }
        
        // Extract thumbnail
        const thMatch = block.match(/thumbnail\s*:\s*"([^"]+)"/);
        const thMatchSingle = !thMatch && block.match(/thumbnail\s*:\s*'([^']+)'/);
        const th = thMatch ? thMatch[1] : (thMatchSingle ? thMatchSingle[1] : null);
        if (th) image = siteUrl + th;
        
        canonical = siteUrl + "/story/" + articleId;
      }
    } catch (e) {
      // Fall through to defaults
    }
  }

  // Escape for HTML attribute safety
  const esc = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${esc(siteName)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${esc(canonical)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">

  <meta http-equiv="refresh" content="0;url=${esc(canonical)}">
</head>
<body>
  <p>Redirecting to <a href="${esc(canonical)}">${esc(canonical)}</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

export const config = {
  path: "/story/*"
};
