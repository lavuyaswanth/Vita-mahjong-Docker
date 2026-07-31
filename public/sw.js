/* Vita Mahjong service worker — offline play (R11).
   Strategy:
   - Navigations (the app shell) are NETWORK-FIRST so a new deploy is picked up
     on the very next load, falling back to the cached shell when offline.
   - Everything else (hashed JS/CSS/art) is cache-first with background
     refresh — those filenames are content-hashed, so cached copies never go
     stale. */
const CACHE = 'vita-mahjong-legends-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop old cache versions
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // only same-origin

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      // App shell: network-first so deploys show up immediately.
      if (req.mode === 'navigate') {
        try {
          const res = await fetch(req);
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        } catch {
          const shell =
            (await cache.match(req)) ||
            (await cache.match('/index.html')) ||
            (await cache.match('/'));
          if (shell) return shell;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      }

      // Static assets: cache-first with background refresh.
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => null);

      if (cached) {
        network; // fire-and-forget refresh
        return cached;
      }
      const res = await network;
      if (res) return res;
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })()
  );
});
