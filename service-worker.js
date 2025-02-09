const CACHE_NAME = "natura-link-cache-v2";
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
    "/offline.html",
    "/base.css",
    "/layout.css",
    "/components.css",
    "chat.css"
];

// 서비스 워커 설치 및 정적 리소스 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            self.skipWaiting(); // ✅ 서비스 워커 즉시 활성화
        })
    );
});

// 네트워크 요청 처리
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return; // ✅ GET 요청만 캐시 처리

    // Netlify API 요청은 캐시하지 않음
    if (event.request.url.includes("/.netlify/functions/huggingface")) {
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(() => caches.match("/offline.html")) // ✅ 오프라인 시 대체 페이지 제공
    );
});

// 오래된 캐시 정리 및 서비스 워커 활성화
self.addEventListener("activate", (event) => {
    console.log("🚀 새로운 서비스 워커 활성화!");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME) // ✅ 새로운 캐시만 유지
                    .map((cache) => caches.delete(cache))
            );
        }).then(() => self.clients.claim()) // ✅ 모든 클라이언트에서 즉시 적용
    );
});

// 서비스 워커 업데이트 메시지 리스너
self.addEventListener("message", (event) => {
    if (event.data.action === "skipWaiting") {
        console.log("⚡ 새로운 서비스 워커가 활성화됩니다!");
        self.skipWaiting();
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ action: "reload" }));
        });
    }
});
