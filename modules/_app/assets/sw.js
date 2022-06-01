var CACHE_NAME = 'cde-cache-v8f001';
var CACHE_WHITELIST = ['cde-cache-v8f001'];
var urlsToCache = ["/assets/favicon.ico", "/assets/manifest.webmanifest", "/assets/offline/offline.html", "/assets/offline/offline.png", "/assets/img/NIH-CDE.svg", "/assets/img/NIH-CDE-Manifest.png"];
var htmlServedUri = ["/", "/404", "/api", "/board/:id", "/boardList", "/cde/search", "/cdeStatusReport", "/classificationManagement", "/contactUs", "/createCde", "/createForm", "/deView", "/form/search", "/formView", "/help/:title", "/home", "/login", "/myBoards", "/orgAccountManagement", "/orgAuthority", "/orgComments", "/profile", "/quickBoard", "/sdcview", "/searchPreferences", "/siteAudit", "/siteAccountManagement", "/whatsNew"];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
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
            var path = event.request.url;
            if (path.indexOf(self.location.origin) === 0) {
                path = path.substr(self.location.origin.length);
            }
            var index = path.indexOf('?');
            if (index > -1) {
                path = path.substr(0, index);
            }
            return htmlServedUri.indexOf(path) > -1
                ? caches.match('/assets/offline/offline.html')
                : caches.match(event.request);
        })
    );
});
