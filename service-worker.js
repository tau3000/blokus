importScripts('serviceworker-cache-polyfill.js');

var CACHE_NAME = 'v1';
var urlsToCache = [
  'blokus_m.html',
  'css/blokus_m.css',
  'css/navigation.css',
  'js/piece.js',
  'js/board.js',
  'js/backend.js',
  'js/blokus_m.js',
  'js/navigation.js',
  'js/hm5move.js',
  'https://netdna.bootstrapcdn.com/font-awesome/4.1.0/fonts/fontawesome-webfont.woff?v=4.1.0',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response)
          return response;
        return fetch(event.request);
      })
  );
});

