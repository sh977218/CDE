var CACHE_NAME = 'cde-cache-v1';
var CACHE_WHITELIST = ['cde-cache-v1'];
var urlsToCache = [
    '/app/offline/offline.html',
    '/app/offline/offline.png',
    '/cde/public/assets/img/nih-cde-logo.png',
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (CACHE_WHITELIST.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            var requestURL = new URL(event.request.url);
            if (requestURL.origin === location.origin && urlsToCache.indexOf(requestURL.pathname) > -1) {
                return caches.match(requestURL.pathname);
            } else  {
                return caches.match(urlsToCache[0]);
            }
        })
    );
});