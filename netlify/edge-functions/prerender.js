export default async function handler(request, context) {
  const userAgent = request.headers.get('user-agent') || '';
  const uaLower = userAgent.toLowerCase();

  // Google bots are excluded from prerender entirely. Google executes JS
  // since 2019 and fetches the live SPA. Routing Google through Prerender.io
  // has triggered "robots.txt unreachable" site-wide flags in GSC even when
  // the file is reachable, because Prerender's responses for static files
  // poison Google's property-level cache. See:
  // https://answers.netlify.com/t/page-fetch-failed-robots-txt-unreachable/155027
  const googleBots = [
    'googlebot',
    'google-inspectiontool',
    'googleother',
    'google-read-aloud',
    'google-site-verification',
    'apis-google',
    'mediapartners-google',
    'adsbot-google',
    'feedfetcher-google',
    'duplexweb-google',
    'storebot-google',
  ];
  const isGoogle = googleBots.some(bot => uaLower.includes(bot));

  // Bot user agents that still benefit from prerendering. Story pages are
  // already handled by story.js; this is for the homepage and other SPA
  // routes when shared on social platforms.
  const crawlerAgents = [
    'bingbot', 'yandexbot', 'duckduckbot', 'slurp',
    'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'embedly', 'quora link preview', 'showyoubot', 'outbrain',
    'pinterest', 'slackbot', 'vkshare', 'w3c_validator', 'whatsapp',
    'telegrambot', 'applebot', 'iframely'
  ];

  const isCrawler = crawlerAgents.some(bot => uaLower.includes(bot));

  const url = new URL(request.url);

  // Skip prerendering for static assets and crawler-critical files.
  // Including .txt and .xml is mandatory: robots.txt, sitemap.xml, and
  // news-sitemap.xml must be served by origin.
  const skipExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|map|json|txt|xml)$/i;

  // Explicit path skips.
  const skipPaths = [
    '/robots.txt',
    '/sitemap.xml',
    '/news-sitemap.xml',
    '/articles.json',
    '/og-data.json',
    '/favicon.ico',
  ];
  const isSkipPath = skipPaths.includes(url.pathname);

  // /story/* is server-rendered by story.js with NewsArticle JSON-LD.
  const isStoryPath = url.pathname.startsWith('/story/') || url.pathname === '/story';

  // Bypass prerender for: Google bots (always), non-crawlers, static
  // assets, skip-paths, and story paths.
  if (isGoogle || !isCrawler || skipExtensions.test(url.pathname) || isSkipPath || isStoryPath) {
    return context.next();
  }

  // Proxy to Prerender.io for non-Google crawlers. Fall back to origin if
  // Prerender rejects (e.g. static file) or returns 5xx.
  try {
    const prerenderUrl = `https://service.prerender.io/${request.url}`;
    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': 'g8ebPVIWOJ8cXGlzJ3ks',
        'User-Agent': userAgent,
      }
    });

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
