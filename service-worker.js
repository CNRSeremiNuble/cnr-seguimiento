/**
 * service-worker.js — CNR Seguimiento PWA
 * Estrategia: Cache First para assets, Network First para API
 * Rutas corregidas para GitHub Pages (/cnr-seguimiento/)
 */

'use strict';

const CACHE_NAME   = 'cnr-seguimiento-v2';
const BASE         = '/cnr-seguimiento';
const OFFLINE_URLS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/css/styles.css`,
  `${BASE}/js/app.js`,
  `${BASE}/js/camera.js`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
];

/* ── Instalación: pre-cachear assets ────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS)
        .catch(err => console.warn('[SW] Algunos recursos no se cachearon:', err))
      )
      .then(() => self.skipWaiting())
  );
});

/* ── Activación: limpiar caches viejos ──────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Eliminando cache antiguo:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: Cache First para assets locales ─────────────── */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorar peticiones a APIs externas
  if (
    url.hostname.includes('googleapis.com')      ||
    url.hostname.includes('accounts.google.com') ||
    url.hostname.includes('gstatic.com')         ||
    url.hostname.includes('fonts.gstatic.com')   ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cachear solo respuestas válidas de assets del proyecto
          if (
            response &&
            response.status === 200 &&
            response.type !== 'opaque' &&
            url.pathname.startsWith(BASE) &&
            (
              url.pathname.includes('/css/')   ||
              url.pathname.includes('/js/')    ||
              url.pathname.includes('/icons/') ||
              url.pathname.endsWith('.html')   ||
              url.pathname.endsWith('.json')   ||
              url.pathname.endsWith('.png')    ||
              url.pathname.endsWith('.svg')    ||
              url.pathname === `${BASE}/`
            )
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Sin conexión y sin cache: retornar index desde cache
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE}/index.html`);
          }
        });
    })
  );
});

/* ── Background Sync ────────────────────────────────────── */
self.addEventListener('sync', (event) => {
  if (event.tag === 'cnr-sync') {
    event.waitUntil(Promise.resolve());
  }
});

/* ── Mensajes desde la app ──────────────────────────────── */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
