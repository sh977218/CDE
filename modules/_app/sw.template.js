var CACHE_NAME = 'cde-cache-{#}';
var CACHE_WHITELIST = ['cde-cache-{#}'];
var urlsToCache = ["###"];
var htmlServedUri = ["{htmlServedUri}"];

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
        fetch(event.request).then(function (resp) {
            if (resp.status === 503) {
                throw new Error();
            }
            return resp;
        }).catch(function (err) {
            var path = event.request.url.indexOf(self.location.origin) === 0
                ? event.request.url.substr(self.location.origin.length)
                : event.request.url;
            return htmlServedUri.indexOf(path) > -1
                ? caches.match('/app/offline/offline.html')
                : caches.match(event.request);
        })
    );
});


self.addEventListener('push', function(event) {
    try {
        let obj = JSON.parse(event.data.text());
        event.waitUntil(self.registration.showNotification(obj.title, obj.options));
    } catch (e) {}
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    switch (event.action) {
        case 'audit-action':
            clients.openWindow('/siteAudit');
            break;
        case 'open-app-action':
            clients.openWindow('/home');
            break;
        case 'open-uri':
            clients.openWindow(event.notification.data.uri);
            break;
        case 'profile-action':
            clients.openWindow('/profile');
            break;
        case 'site-mgt-action':
            clients.openWindow('/status/cde');
            break;
    }
}, false);
