const CACHE_NAME = "natura-cache-v1";
const ASSETS = [
    "/",  
    "/index.html",
    "/favicon.ico",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/android-chrome-192x192.png",
    "/android-chrome-512x512.png",
    "/manifest.json",
    "/service-worker.js",
    "/script.js"  // JS 파일만 유지
];

// 설치 이벤트에서 캐싱
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("캐싱 완료!");
            return cache.addAll(ASSETS);
        })
    );
});

// 요청 가로채서 캐시에서 제공
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});
