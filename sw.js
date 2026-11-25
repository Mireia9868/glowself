/* GlowSelf service worker — bump CACHE when shipping new JS/CSS */
const CACHE = 'glow-shell-v4';
const SHELL = [
  '/', '/index.html', '/test.html', '/result.html', '/app.html', '/offline.html',
  '/assets/css/site.css',
  '/assets/js/data.js', '/assets/js/site.js', '/assets/js/test.js',
  '/assets/js/result.js', '/assets/js/app.js',
  '/assets/img/mark.svg', '/assets/img/favicon.svg',
  '/assets/img/icon-192.png', '/assets/img/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/admin.html' ||
      url.pathname.startsWith('/r/') || url.pathname.startsWith('/data/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(hit => hit || caches.match('/offline.html')))
    );
    return;
  }

  if (/\.(css|js|png|svg|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(hit => {
        const network = fetch(req).then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy));
          }
          return res;
        }).catch(() => hit);
        return hit || network;
      })
    );
  }
});
