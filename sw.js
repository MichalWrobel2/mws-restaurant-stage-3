const cacheName = 'restaurant-app-v2';
const photosCacheName = 'restaurant-app-photos-v2';

const filesToCache = [
    {
        'name': cacheName,
        'paths': [
            'restaurant.html',
            'index.html',
            'sw.js',
            'js/main.js',
            'js/dbhelper.js',
            'js/restaurant_info.js',
            'js/idb.js',
            'css/styles.css'
        ]
    },
    {
        'name': photosCacheName,
        'paths': [
            'img/1.jpg',
            'img/2.jpg',
            'img/3.jpg',
            'img/4.jpg',
            'img/5.jpg',
            'img/6.jpg',
            'img/7.jpg',
            'img/8.jpg',
            'img/9.jpg',
            'img/10.jpg'
        ]
    }

];


self.addEventListener('install', event => {

    event.waitUntil(Promise.all(
        filesToCache.map((files) => {
          return caches.open(files.name).then((cache) => {
           return cache.addAll(files.paths);
          });
        })));
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.pathname === '/') {
        event.respondWith(
            caches.match('index.html')
            .then(response => response || fetch(event.request))
        );
        return;
    };

    if (url.pathname.startsWith('/restaurant.html')) {
        event.respondWith(
            caches.match('restaurant.html')
            .then(response => response || fetch(event.request))
        );
        return;
    };

    if (url.pathname.endsWith('.jpg')) {
        event.respondWith(servePhoto(event.request));
        return;
    };

    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});

function servePhoto(request) {
    return caches.open(photosCacheName).then(cache => {
        return cache.match(request).then(response => (
            response || cacheAndFetch(cache, request)
        ));
    });
}

function cacheAndFetch(cache, request) {
    cache.add(request);
    return fetch(request);
}
