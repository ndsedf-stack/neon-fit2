// Service Worker - NEON FIT v3.0
const CACHE_VERSION = 'v1764365099';
const urlsToCache = [
  '/',
  '/index.html',
  '/briefing.html',
  '/workouts.html',
  '/session.html',
  '/stats.html',
  '/app-v2.js',
  '/program-data-v2.js',
  '/workout-history-v2.js',
  '/cloud-sync-supabase.js',
  '/config.js'
];

self.addEventListener('install', event => {
  console.log('SW:', CACHE_VERSION, 'Installing...');
  event.waitUntil(
    caches.keys().then(names => 
      Promise.all(names.map(n => caches.delete(n)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('SW:', CACHE_VERSION, 'Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .catch(() => caches.match(event.request))
  );
});
