const CACHE_NAME = 'interview-killer-v14';
const ASSETS = [
  './',
  './index.html',
  './shell.css',
  './roadmap.css',
  './roadmap-content.js',
  './cs336-course.js',
  './roadmap.js',
  './problems.json',
  './bagugu.json',
  './build-info.json',
  './manifest.json'
];

// Install - cache core assets; bypass the HTTP cache (Pages sends max-age=600) so a new version never stores stale files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })));
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first so a new deploy shows up on the next open; the cache is only the offline fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(new Request(event.request.url, { cache: 'no-cache' })).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
