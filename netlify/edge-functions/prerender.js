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

  // Skip prerendering for static assets
  const url = new URL(request.url);
  const skipExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map|json)$/i;

  // Skip prerendering for /story/* paths -- the story.js edge function
  // server-renders these directly with proper NewsArticle schema.
  const isStoryPath = url.pathname.startsWith('/story/') || url.pathname === '/story';

  if (!isCrawler || skipExtensions.test(url.pathname) || isStoryPath) {
    return context.next();
  }

  // Proxy to Prerender.io
  const prerenderUrl = `https://service.prerender.io/${request.url}`;

  const prerenderResponse = await fetch(prerenderUrl, {
    headers: {
      'X-Prerender-Token': 'g8ebPVIWOJ8cXGlzJ3ks',
      'User-Agent': userAgent,
    }
  });

  return prerenderResponse;
}

export const config = {
  path: '/*',
};
