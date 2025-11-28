// NEON FIT Service Worker
const V = 'v1764355673';
self.addEventListener('install', e => { console.log('SW:',V); e.waitUntil(caches.keys().then(k=>Promise.all(k.map(c=>caches.delete(c)))).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request))));
