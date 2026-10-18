/* Service Worker — Deux soleils : le site s'ouvre même sans réseau.
   - navigations : network-first, repli sur le cache (HTML toujours frais si en ligne)
   - assets       : cache-first puis revalidation en arrière-plan (stale-while-revalidate)
   - la météo reste gérée par app.js (localStorage + retry), le SW n'y touche pas */
const CACHE = 'deux-soleils-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=9',
  './app.js?v=9',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './og-2026.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  /* navigations : frais d'abord, cache en repli */
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return r;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* assets même origine : cache d'abord, mise à jour silencieuse derrière */
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        const refresh = fetch(e.request).then(r => {
          if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        }).catch(() => hit);
        return hit || refresh;
      })
    );
    return;
  }

  /* cross-origin (fonts, CDN, météo) : réseau direct, pas de cache SW */
});
