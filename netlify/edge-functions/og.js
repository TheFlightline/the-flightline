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
  } catch (err) {}

  const esc = s => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const html =
    '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="utf-8">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(description) + '">' +
    '<link rel="canonical" href="' + esc(canonical) + '">' +
    '<meta property="og:type" content="article">' +
    '<meta property="og:site_name" content="' + esc(siteName) + '">' +
    '<meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(description) + '">' +
    '<meta property="og:image" content="' + esc(image) + '">' +
    '<meta property="og:image:width" content="1200">' +
    '<meta property="og:image:height" content="630">' +
    '<meta property="og:url" content="' + esc(canonical) + '">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(description) + '">' +
    '<meta name="twitter:image" content="' + esc(image) + '">' +
    '</head><body>' +
    '<h1>' + esc(title) + '</h1>' +
    '<p>' + esc(description) + '</p>' +
    '<p><a href="' + esc(canonical) + '">Read the full story at The Flightline</a></p>' +
    '</body></html>';

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache"
    }
  });
}

export const config = { path: "/story/*" };
