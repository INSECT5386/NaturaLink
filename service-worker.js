const CACHE_NAME = "natura-link-cache-v1";
const urlsToCache = [
    "/", 
    "/index.html", 
    "/favicon.ico", 
    "/manifest.json", 
    "/assets/icons/android-chrome-192x192.png", 
    "/assets/icons/android-chrome-512x512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // 새로운 서비스 워커 즉시 활성화
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                return caches.match("/index.html"); // 네트워크 오류 시 기본 페이지 반환
            });
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // 새로운 서비스 워커가 즉시 컨트롤하도록 설정
});
