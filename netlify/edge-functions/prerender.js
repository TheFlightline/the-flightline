export default async function handler(request, context) {
  const userAgent = request.headers.get('user-agent') || '';

  // Bot user agents that need prerendering
  const crawlerAgents = [
    'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp',
    'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'embedly', 'quora link preview', 'showyoubot', 'outbrain',
    'pinterest', 'slackbot', 'vkshare', 'w3c_validator', 'whatsapp',
    'telegrambot', 'applebot', 'iframely'
  ];

  const isCrawler = crawlerAgents.some(bot =>
    userAgent.toLowerCase().includes(bot)
  );

  const url = new URL(request.url);

  // Skip prerendering for static assets and crawler-critical files.
  // Including .txt and .xml is mandatory: robots.txt, sitemap.xml, and
  // news-sitemap.xml must be served by origin so crawlers can read them.
  const skipExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|map|json|txt|xml)$/i;

  // Explicit path skips for crawler-critical files. Belt-and-suspenders
  // alongside the extension regex.
  const skipPaths = [
    '/robots.txt',
    '/sitemap.xml',
    '/news-sitemap.xml',
    '/articles.json',
    '/og-data.json',
    '/favicon.ico',
  ];
  const isSkipPath = skipPaths.includes(url.pathname);

  // Skip prerendering for /story/* paths -- the story.js edge function
  // server-renders these directly with proper NewsArticle schema.
  const isStoryPath = url.pathname.startsWith('/story/') || url.pathname === '/story';

  if (!isCrawler || skipExtensions.test(url.pathname) || isSkipPath || isStoryPath) {
    return context.next();
  }

  // Proxy to Prerender.io. If Prerender rejects (e.g. static file), fall
  // back to the origin instead of returning the broken response.
  try {
    const prerenderUrl = `https://service.prerender.io/${request.url}`;
    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': 'g8ebPVIWOJ8cXGlzJ3ks',
        'User-Agent': userAgent,
      }
    });

    // If Prerender rejected the request or returned an error, serve origin.
    const rejectReason = prerenderResponse.headers.get('x-prerender-reject-reason');
    if (rejectReason || prerenderResponse.status >= 500) {
      return context.next();
    }

    return prerenderResponse;
  } catch (err) {
    return context.next();
  }
}

export const config = {
  path: '/*',
};
