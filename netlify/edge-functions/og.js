export default async function handler(request, context) {
  const url = new URL(request.url);
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  const socialBots = [
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
    'telegrambot', 'slackbot', 'discordbot', 'embedly', 'iframely',
    'pinterest', 'applebot', 'vkshare', 'outbrain', 'showyoubot'
  ];

  const isSocialBot = socialBots.some(bot => userAgent.includes(bot));

  if (!isSocialBot) {
    return context.next();
  }

  // Extract article slug from /story/:slug
  const match = url.pathname.match(/^\/story\/([^\/]+)/);
  if (!match) return context.next();
  const slug = match[1];

  try {
    // Fetch og-data.json from the origin
    const ogUrl = new URL('/og-data.json', url.origin);
    const ogResp = await fetch(ogUrl.toString());
    if (!ogResp.ok) return context.next();
    const ogData = await ogResp.json();
    const article = ogData[slug];
    if (!article) return context.next();

    const title    = article.h || 'The Flightline';
    const desc     = article.d || 'Pensacola\'s civic news source.';
    const imgPath  = article.t || '/images/flightline-og-default.jpg';
    const imgUrl   = new URL(imgPath, url.origin).toString();
    const pageUrl  = url.toString();
    const siteName = 'The Flightline';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} | ${siteName}</title>
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${imgUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${imgUrl}">
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
</head>
<body>
  <p><a href="${pageUrl}">${title}</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (e) {
    return context.next();
  }
}

export const config = { path: "/story/*" };
