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
        caches.match(event.request, {ignoreSearch: true}).then(function (response) {
            return response || fetch(event.request).then(function (resp) {
                if (resp.status === 503) {
                    throw new Error();
                }
                return resp;
            });
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
        case 'profile-action':
            clients.openWindow('/profile');
            break;
        case 'site-mgt-action':
            clients.openWindow('/status/cde');
            break;
    }
}, false);
