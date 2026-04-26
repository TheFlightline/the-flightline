// Netlify Edge Function: og.js
// Intercepts social crawler requests to /story/:id and returns OG-tagged HTML
// Normal browsers pass through untouched.

export default async function handler(request, context) {
  const ua = request.headers.get("user-agent") || "";
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|pinterest|Google.*snippet|vkShare|W3C_Validator|Googlebot|bingbot/i.test(ua);
  
  if (!isCrawler) {
    // Regular visitor — serve the SPA normally
    return context.next();
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const articleId = pathParts[2]; // /story/:id

  const siteUrl = "https://theflightline.news";
  const siteName = "The Flightline";
  const defaultImage = siteUrl + "/images/flightline-og-default.jpg";
  const defaultDesc = "Pensacola's civic news source. No Static. Just the Story.";

  // Defaults
  let title = "The Flightline — Pensacola, FL";
  let description = defaultDesc;
  let image = defaultImage;
  let canonical = siteUrl;

  if (articleId) {
    try {
      // Fetch articles.js from the CDN
      const artRes = await fetch(siteUrl + "/assets/articles.js");
      const artText = await artRes.text();
      
      // Extract this article's data with targeted regex
      // Find the article key block
      const escapedId = articleId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const keyPat = new RegExp('"' + escapedId + '"\\s*:\\s*\\{([\\s\\S]*?)\\},\\s*(?:"[\\w-]+"\\s*:|\\}\\s*\\))');
      const match = artText.match(keyPat);
      
      if (match) {
        const block = match[1];
        
        // Extract headline
        const hl = block.match(/headline\s*:\s*["']([^"']+)["']/);
        if (hl) title = hl[1] + " — " + siteName;
        
        // Extract dek for description
        const dk = block.match(/dek\s*:\s*["']([^"']+)["']/);
        if (dk) description = dk[1].substring(0, 200);
        
        // Extract thumbnail
        const th = block.match(/thumbnail\s*:\s*["']([^"']+)["']/);
        if (th) image = siteUrl + th[1];
        
        canonical = siteUrl + "/story/" + articleId;
      }
    } catch (e) {
      // Fall through to defaults
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonical}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@theflightlinenews">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">

  <!-- Redirect real browsers that somehow get here -->
  <meta http-equiv="refresh" content="0;url=${canonical}">
</head>
<body>
  <p>Redirecting to <a href="${canonical}">${canonical}</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

export const config = {
  path: "/story/*"
};
