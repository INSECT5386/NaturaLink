const CACHE_NAME = "natura-link-cache-v25";  // ✅ 최신 캐시 버전
const OFFLINE_PAGE = "/pwa/offline.html";  // ✅ 오프라인 페이지 경로

const STATIC_ASSETS = [
    "/index.html",
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
    "/pwa/manifest.json",
    "/pwa/service-worker.js",
    "/pwa/offline.html",
    "/css/base.css",
    "/css/layout.css",
    "/css/components.css",
    "/css/chat.css",
    "/favicons/favicon-16x16.png",
    "/favicons/favicon-32x32.png",
    "/favicons/favicon.ico",
    "/assets/icons/android-chrome-192x192.png",
    "/assets/icons/android-chrome-512x512.png"
];

// ✅ 서비스 워커 설치 및 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                await cache.addAll(STATIC_ASSETS);
                console.log("✅ 모든 정적 파일 캐싱 완료");
            } catch (error) {
                console.warn("⚠️ 일부 파일 캐싱 실패:", error);
            }
        })().then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 핸들링 (네트워크 우선, 실패 시 캐시 사용)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch (error) {
                console.warn("🌐 네트워크 오류 발생, 캐시에서 로드 시도:", event.request.url);
                const cache = await caches.open(CACHE_NAME);
                return (await cache.match(event.request)) || (await cache.match(OFFLINE_PAGE)) || new Response("<h1>오프라인 상태입니다</h1>", {
                    headers: { "Content-Type": "text/html" }
                });
            }
        })()
    );
});

// ✅ 오래된 캐시 삭제 및 새로운 서비스 워커 활성화
self.addEventListener("activate", (event) => {
    console.log("🚀 새로운 서비스 워커 활성화!");
    event.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
            self.clients.claim();
        })()
    );
});

