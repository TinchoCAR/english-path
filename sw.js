/* ============================================================
   sw.js — Service worker
   Hace que la app funcione sin conexión en el celular.

   IMPORTANTE: al cambiar cualquier archivo, subí VERSION.
   Si no, los navegadores que ya la tienen instalada siguen
   sirviendo la versión vieja desde caché.
   ============================================================ */

const VERSION = 'v1';
const CACHE = 'english-path-' + VERSION;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/core.js',
  './js/data/vocab.js',
  './js/data/grammar-a2.js',
  './js/data/grammar-b1.js',
  './js/data/grammar-b2.js',
  './js/data/content.js',
  './js/data/placement.js',
  './js/state.js',
  './js/srs.js',
  './js/session.js',
  './js/ai.js',
  './js/sync.js',
  './js/speech.js',
  './js/ui.js',
  './js/activities.js',
  './js/views.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll falla entero si un solo archivo falla; los agregamos de a uno
    // para que un recurso faltante no rompa toda la instalación.
    await Promise.all(SHELL.map((url) =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
    ));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nunca tocamos las llamadas a la IA ni a GitHub: son datos vivos.
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    // stale-while-revalidate: responde ya desde caché y actualiza por detrás,
    // así la app abre instantánea y la próxima carga trae los cambios.
    const network = fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    if (cached) return cached;

    const fresh = await network;
    if (fresh) return fresh;

    // Sin caché y sin red: si navegaba, devolvemos la app.
    if (req.mode === 'navigate') {
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Sin conexión y sin copia en caché.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  })());
});

// Permite que la app fuerce la actualización sin esperar.
self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});
