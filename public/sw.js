/* Vita Mahjong service worker — offline play (R11).
   Strategy: cache-first with background refresh (stale-while-revalidate).
   After the first online load, the app shell + hashed assets are cached,
   so the game launches and plays fully offline. */
const CACHE = 'vita-mahjong-midnight-v1';

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
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => null);

      // Serve cache immediately if present; otherwise wait on the network.
      if (cached) {
        network; // fire-and-forget refresh
        return cached;
      }
      const res = await network;
      if (res) return res;

      // Offline navigation fallback → cached app shell
      if (req.mode === 'navigate') {
        const shell = await cache.match('/index.html') || await cache.match('/');
        if (shell) return shell;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })()
  );
});
