// QueueLess Kacheri (NagrikSeva AI) - Production Resilient Service Worker
const CACHE_NAME = 'queueless-v2.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/brand/queueless-kacheri-logo-transparent-hd.png',
  '/brand/queueless-kacheri-favicon-square-hd.png',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some individual resources fail to pre-cache
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let non-GET or API calls pass through to network
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Do not intercept internal Next.js development hot-reloads or API calls
  if (url.pathname.startsWith('/api/') || url.pathname.includes('webpack-hmr')) {
    return;
  }

  // Handle navigation requests (HTML document loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          // Clean fallback response so fetch never returns undefined
          return new Response(
            '<!DOCTYPE html><html lang="gu"><head><meta charset="utf-8"><title>QueueLess - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;padding:32px;text-align:center;background:#003366;color:white"><h2>કચેરી સેવા ઑફલાઇન</h2><p>ઇન્ટરનેટ કનેક્શન તપાસો.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Handle static assets (cache-first, network fallback)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Background refresh
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
