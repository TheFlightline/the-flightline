export default async function handler(request, context) {
  const ua = request.headers.get("user-agent") || "";
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|pinterest|Googlebot|bingbot/i.test(ua);
  if (!isCrawler) return context.next();

  const url = new URL(request.url);
  const articleId = url.pathname.split("/")[2] || "";
  const siteUrl = "https://theflightline.news";
  const siteName = "The Flightline";

  let title = siteName + " \u2014 Pensacola, FL";
  let description = "Pensacola's civic news source. No Static. Just the Story.";
  let image = siteUrl + "/images/flightline-og-default.jpg";
  let canonical = articleId ? siteUrl + "/story/" + articleId : siteUrl;

  // Try to fetch og-data.json — wrap everything in try/catch
  try {
    const res = await fetch(siteUrl + "/og-data.json");
    if (res && res.ok) {
      const text = await res.text();
      const data = JSON.parse(text);
      const art = data[articleId];
      if (art && art.h) {
        title = art.h + " \u2014 " + siteName;
        if (art.d) description = art.d.substring(0, 250);
        if (art.t) image = siteUrl + art.t;
      }
    }
  } catch (err) {
    // Silently use defaults
  }

  // Always return a valid HTML response
  return new Response(
    '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="utf-8">' +
    '<title>' + title.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</title>' +
    '<meta property="og:type" content="article">' +
    '<meta property="og:site_name" content="' + siteName + '">' +
    '<meta property="og:title" content="' + title.replace(/"/g,'&quot;') + '">' +
    '<meta property="og:description" content="' + description.replace(/"/g,'&quot;') + '">' +
    '<meta property="og:image" content="' + image + '">' +
    '<meta property="og:url" content="' + canonical + '">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta name="twitter:title" content="' + title.replace(/"/g,'&quot;') + '">' +
    '<meta name="twitter:description" content="' + description.replace(/"/g,'&quot;') + '">' +
    '<meta name="twitter:image" content="' + image + '">' +
    '</head><body><a href="' + canonical + '">' + title + '</a></body></html>',
    {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache"
      }
    }
  );
}

