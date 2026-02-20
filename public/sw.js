// Service Worker para TOCA ESSA PWA
const CACHE_NAME = 'toca-essa-v8';

// Apenas assets estáticos imutáveis
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Só processa GET do mesmo origin
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // API: sempre rede, sem cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML pages: SEMPRE rede, nunca cache
  const accept = event.request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Páginas por extensão ou sem extensão: sempre rede
  if (!url.pathname.includes('.') || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos (ícones, JS, CSS, fontes): Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
