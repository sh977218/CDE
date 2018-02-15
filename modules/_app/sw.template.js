var CACHE_NAME = 'cde-cache-{#}';
var CACHE_WHITELIST = ['cde-cache-{#}'];
var urlsToCache = ["###"];

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

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response
                || fetch(event.request).then(function (resp) {
                    if (resp.status === 503) {
                        throw new Error();
                    }
                    return resp;
                }).catch(function () {
                    return caches.match('/app/offline/offline.html');
                });
        })
    );
});
