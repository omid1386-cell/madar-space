const VERSION = '0.7.0';
const STATIC_CACHE = `madar-static-${VERSION}`;
const DATA_CACHE = `madar-data-${VERSION}`;
const IMAGE_CACHE = `madar-images-${VERSION}`;

const APP_SHELL = [
  '/', '/index.html', '/offline.html', '/manifest.webmanifest', '/styles.css', '/app.js',
  '/data.js', '/launch-detail.js', '/orbit-detail.js', '/learning-content.js',
  '/satellite-data.js', '/knowledge-data.js', '/failure-causes.js',
  '/agency-feed-fallback.json', '/launches-fallback.json', '/failures-fallback.json',
  '/fonts/Vazirmatn-UI-Regular.woff2', '/fonts/Vazirmatn-UI-Medium.woff2',
  '/fonts/Vazirmatn-UI-SemiBold.woff2', '/fonts/Vazirmatn-UI-Bold.woff2',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/icons/favicon-64.png',
  '/images/reference/artemis-liftoff-nasa.jpg', '/images/reference/fairing-separation-esa.jpg',
  '/images/reference/sentinel-separation-esa.jpg', '/images/reference/artemis-stage-separation-esa.jpg',
  ...Array.from({length: 10}, (_, i) => `/images/stages/stage-${i}.svg`),
  ...['foundations','orbits','propulsion','ascent','spacecraft','gnc','mission-design','comms','environment','systems','operations','failures'].map(x => `/images/modules/${x}.svg`),
  ...['earth-observation','communications','navigation','weather','science','technology','security','iot'].map(x => `/images/satellites/type-${x}.svg`),
  '/images/satellites/satellite-anatomy.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  const keep = new Set([STATIC_CACHE, DATA_CACHE, IMAGE_CACHE]);
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('madar-') && !keep.has(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function fetchWithTimeout(request, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try { return await fetch(request, {signal: controller.signal}); }
  finally { clearTimeout(timeout); }
}

async function navigationResponse(request) {
  try {
    const response = await fetchWithTimeout(request, 5000);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    return await caches.match('/index.html') || await caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request, cacheName = STATIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, {ignoreSearch: true});
  const update = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await update || await caches.match('/offline.html');
}

async function apiNetworkFirst(request, fallbackPath = null) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetchWithTimeout(request, 12000);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackPath) {
      const fallback = await caches.match(fallbackPath);
      if (fallback) return fallback;
    }
    return new Response(JSON.stringify({error:'offline', detail:'Live server is unavailable.'}), {status:503, headers:{'Content-Type':'application/json; charset=utf-8'}});
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (url.pathname === '/api/agency-feed') {
    event.respondWith(apiNetworkFirst(request, '/agency-feed-fallback.json'));
    return;
  }
  if (url.pathname === '/api/launches') {
    const fallback = url.searchParams.get('kind') === 'failures' ? '/failures-fallback.json' : '/launches-fallback.json';
    event.respondWith(apiNetworkFirst(request, fallback));
    return;
  }
  if (url.pathname.startsWith('/api/image')) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiNetworkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
