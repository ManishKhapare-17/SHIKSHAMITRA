// ShikshaMitra AI — Service Worker
// Caches the app shell and bundled content for offline use.
// AI tutor responses are NEVER cached here.

const CACHE_NAME = 'shikshamitra-v1';

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/subjects',
  '/subjects/mathematics',
  '/subjects/science',
  '/subjects/english',
  '/lessons/math-fractions-g4',
  '/lessons/sci-water-cycle-g4',
  '/lessons/eng-nouns-g4',
  '/quiz/math-fractions-g4',
  '/quiz/sci-water-cycle-g4',
  '/quiz/eng-nouns-g4',
  '/progress',
  '/settings',
  '/manifest.json',
];

// ── Install: precache static shell ───────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache each asset individually — failures are non-fatal
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ───────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API, cache-first for assets ─────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER cache API routes or Next.js internal/HMR assets
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('turbopack')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For navigation requests and static assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Only cache successful GET responses for same-origin
          if (
            response.ok &&
            event.request.method === 'GET' &&
            url.origin === self.location.origin
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => null);

      return cached || fetchPromise || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    })
  );
});
