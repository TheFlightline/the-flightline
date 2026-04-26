// Netlify Edge Function: og.js
// Intercepts social crawler requests and returns OG-tagged HTML

export default async function handler(request, context) {
  const ua = request.headers.get("user-agent") || "";
  
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|pinterest|Google.*snippet|vkShare|Googlebot|bingbot|ia_archiver/i.test(ua);
  
  if (!isCrawler) {
    return context.next();
  }

  const url = new URL(request.url);
  const articleId = url.pathname.split("/")[2];

  const siteUrl = "https://theflightline.news";
  const siteName = "The Flightline";
  const defaultImage = siteUrl + "/images/flightline-og-default.jpg";
  const defaultDesc = "Pensacola's civic news source. No Static. Just the Story.";

  let title = "The Flightline — Pensacola, FL";
  let description = defaultDesc;
  let image = defaultImage;
  let canonical = articleId ? siteUrl + "/story/" + articleId : siteUrl;

  if (articleId) {
    try {
      // Fetch articles.js from GitHub raw CDN — avoids self-referential loop
      const artRes = await fetch(
        "https://raw.githubusercontent.com/TheFlightline/the-flightline/main/assets/articles.js",
        { headers: { "User-Agent": "TheFlightline-OG-Bot/1.0" } }
      );
      
      if (artRes.ok) {
        const artText = await artRes.text();
        const keyIdx = artText.indexOf('"' + articleId + '"');
        
        if (keyIdx >= 0) {
          const block = artText.substring(keyIdx, keyIdx + 2000);
          
          // Headline — double quotes
          const hlD = block.match(/headline\s*:\s*"((?:[^"\\]|\\.)*)"/);
          // Headline — single quotes  
          const hlS = !hlD && block.match(/headline\s*:\s*'((?:[^'\\]|\\.)*)'/);
          const hl = hlD ? hlD[1] : (hlS ? hlS[1] : null);
          if (hl) title = hl.replace(/\\'/g, "'").replace(/\\"/g, '"') + " — " + siteName;

          // Dek
          const dkD = block.match(/dek\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const dkS = !dkD && block.match(/dek\s*:\s*'((?:[^'\\]|\\.)*)'/);
          const dk = dkD ? dkD[1] : (dkS ? dkS[1] : null);
          if (dk) description = dk.replace(/\\'/g, "'").replace(/\\"/g, '"').substring(0, 250);

          // Thumbnail
          const thD = block.match(/thumbnail\s*:\s*"([^"]+)"/);
          const thS = !thD && block.match(/thumbnail\s*:\s*'([^']+)'/);
          const th = thD ? thD[1] : (thS ? thS[1] : null);
          if (th) image = siteUrl + th;
        }
      }
    } catch (e) {
      // Fall through to defaults
    }
  }

  const esc = s => String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${esc(siteName)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${esc(canonical)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta http-equiv="refresh" content="0;url=${esc(canonical)}">
</head>
<body>
  <p>Loading <a href="${esc(canonical)}">${esc(title)}</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    }
  });
}

export const config = { path: "/story/*" };
