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


self.addEventListener('push', function(event) {
    const title = 'New Feedback Message';
    const options = {
        body: (event.data ? event.data.text() : 'Full detail available in the Audit Log.'),
        icon: '/cde/public/assets/img/NIH-CDE-FHIR.png',
        badge: '/cde/public/assets/img/nih-cde-logo-simple.png',
        tag: 'cde-feedback',
        actions: [
            {
                action: 'audit-action',
                title: 'View',
                icon: '/cde/public/assets/img/nih-cde-logo-simple.png'
            },
            {
                action: 'profile-action',
                title: 'Edit Subscription',
                icon: '/cde/public/assets/img/portrait.png'
            }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'audit-action') {
        clients.openWindow('/siteAudit');
    }
    else if (event.action === 'profile-action') {
        clients.openWindow('/profile');
    }
}, false);
