const https = require('https');

const CRAWLERS = /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|pinterest|googlebot|bingbot|meta-externalagent|meta-webindexer/i;
const SITE = "https://theflightline.news";
const NAME = "The Flightline";
const OG_DATA_URL = "https://raw.githubusercontent.com/TheFlightline/the-flightline/main/og-data.json";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "TheFlightline-OG/1.0" } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject).setTimeout(5000, function() { this.destroy(); reject(new Error('timeout')); });
  });
}

exports.handler = async function(event) {
  const ua = (event.headers && (event.headers["user-agent"] || event.headers["User-Agent"])) || "";
  
  if (!CRAWLERS.test(ua)) {
    const path = (event.path || "").replace("/.netlify/functions/og", "");
    return { statusCode: 302, headers: { "Location": SITE + path }, body: "" };
  }

  const parts = (event.path || "").split("/");
  // path is /.netlify/functions/og/story/ARTICLE_ID  
  const articleId = parts[parts.length - 1] || "";
  const canonical = articleId ? SITE + "/story/" + articleId : SITE;

  let title = NAME + " \u2014 Pensacola, FL";
  let desc = "Pensacola\u2019s civic news source. No Static. Just the Story.";
  let img = SITE + "/images/flightline-og-default.jpg";

  try {
    const data = await fetchJSON(OG_DATA_URL);
    const art = data[articleId];
    if (art && art.h) {
      title = art.h + " \u2014 " + NAME;
      if (art.d) desc = art.d.substring(0, 250);
      if (art.t) img = SITE + art.t;
    }
  } catch(e) {}

  const e = s => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    body: `<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>${e(title)}</title>
<meta property="og:type" content="article">
<meta property="og:site_name" content="${e(NAME)}">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(desc)}">
<meta property="og:image" content="${e(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${e(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(title)}">
<meta name="twitter:description" content="${e(desc)}">
<meta name="twitter:image" content="${e(img)}">
</head><body><h1>${e(title)}</h1><p>${e(desc)}</p><a href="${e(canonical)}">${e(canonical)}</a></body></html>`
  };
};
