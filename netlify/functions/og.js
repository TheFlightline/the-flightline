exports.handler = async function(event) {
  const ua = (event.headers["user-agent"] || event.headers["User-Agent"] || "").toLowerCase();
  const isCrawler = ua.includes("facebookexternalhit") || ua.includes("facebot") || ua.includes("twitterbot") || ua.includes("linkedinbot") || ua.includes("meta-externalagent");
  const parts = (event.path || "").replace("/.netlify/functions/og","").split("/").filter(Boolean);
  const id = parts[parts.length - 1] || "";
  const url = "https://theflightline.news" + (id ? "/story/" + id : "");
  if (!isCrawler) return { statusCode: 302, headers: { Location: url }, body: "" };
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>The Flightline — Pensacola, FL</title><meta property="og:type" content="article"><meta property="og:site_name" content="The Flightline"><meta property="og:title" content="The Flightline — Pensacola, FL"><meta property="og:description" content="Pensacola civic news. No Static. Just the Story."><meta property="og:image" content="https://theflightline.news/images/flightline-og-default.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url" content="' + url + '"><meta name="twitter:card" content="summary_large_image"></head><body><a href="' + url + '">The Flightline</a></body></html>'
  };
};