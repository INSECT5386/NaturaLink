const CACHE_NAME = "natura-link-cache-v2"; // 캐시 버전 변경
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/script.js",
    "/manifest.json",
    "/assets/icons/android-chrome-192x192.png",
    "/assets/icons/android-chrome-512x512.png",
    "/favicon-32x32.png",
    "/favicon-16x16.png",
    "/favicon.ico",
    "/service-worker.js",
    "/offline.html"
];

// 서비스 워커 설치 및 즉시 활성화
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting(); // 새 버전 즉시 활성화
});

// 네트워크 요청 처리 (네트워크 우선, 캐시는 백업)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    // API 요청은 캐시하지 않음
    if (event.request.url.includes("/netlify/functions/huggingface")) {
        return fetch(event.request);
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || caches.match("/offline.html");
            }))
    );
});

// 오래된 캐시 삭제 + 즉시 새로운 서비스 워커 적용
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        })
    );
    self.clients.claim(); // 모든 열린 페이지에 즉시 적용
});
