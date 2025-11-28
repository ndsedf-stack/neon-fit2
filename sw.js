// Service Worker - Force refresh des ressources
const CACHE_VERSION = 'v1764355096';
const urlsToCache = [
  '/',
  '/index.html',
  '/briefing.html',
  '/workouts.html',
  '/session.html',
  '/stats.html',
  '/app-v2.js',
  '/program-data-v2.js',
  '/briefing-integration.js',
  '/workout-history.js'
];

// Installation : vider tous les anciens caches
self.addEventListener('install', event => {
  console.log('SW: Installing new version v1764355096');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('SW: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activation : nettoyer et prendre le contrôle
self.addEventListener('activate', event => {
  console.log('SW: Activating v1764355096');
  event.waitUntil(self.clients.claim());
});

// Fetch : toujours aller chercher la version réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    }).catch(() => caches.match(event.request))
  );
});
