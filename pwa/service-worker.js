const CACHE_NAME = "natura-link-cache-v77";

// ✅ 정적 파일 캐싱 목록
const STATIC_ASSETS = [
    "/index.html",
    "/offline.html",  // ✅ 오프라인 페이지 추가
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
    "/js/setting.js",
    "/pwa/manifest.json",
    "/pwa/service-worker.js",
    "/css/base.css",
    "/css/layout.css",
    "/css/components.css",
    "/css/chat.css",
    "/favicons/favicon-16x16.png",
    "/favicons/favicon-32x32.png",
    "/favicons/favicon.ico",
    "/assets/icon/android-chrome-192x192.png",
    "/assets/icon/android-chrome-512x512.png"
];

// ✅ 서비스 워커 설치 및 정적 파일 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            console.log("✅ 정적 파일 캐싱 완료!");
            self.skipWaiting();
        }).catch((error) => {
            console.error("❌ 정적 파일 캐싱 실패:", error);
        })
    );
});

// ✅ 네트워크 요청 처리 (캐시 우선, API 요청 제외)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // ✅ Netlify Functions API 요청은 캐싱하지 않음
    if (url.pathname.startsWith("/.netlify/functions/")) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            console.warn(`🚨 요청 실패: ${event.request.url}`);
            return caches.match("/offline.html"); // ✅ 오프라인 페이지 제공
        })
    );
});

// ✅ 서비스 워커 활성화 및 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
    console.log("🚀 서비스 워커 활성화!");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log(`🗑️ 오래된 캐시 삭제: ${name}`);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => {
            console.log("✅ 최신 캐시 유지 완료!");
            self.clients.claim();
        })
    );
});
