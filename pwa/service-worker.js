const CACHE_NAME = "natura-link-cache-v7";
const OFFLINE_PAGE = "/pwa/offline.html";  // ✅ 확실한 경로 지정

const STATIC_ASSETS = [
    "/index.html",
    OFFLINE_PAGE,  // ✅ 반드시 포함
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
    "/pwa/manifest.json",
    "/pwa/service-worker.js",
    "/css/base.css",
    "/css/layout.css",
    "/css/components.css",
    "/css/chat.css",
    "/assets/icons/android-chrome-192x192.png",
    "/assets/icons/android-chrome-512x512.png",
    "/favicons/favicon-16x16.png",
    "/favicons/favicon-32x32.png",
    "/favicons/favicon.ico"
];

// ✅ 서비스 워커 설치 및 `offline.html` 강제 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.add(OFFLINE_PAGE);
                console.log(`✅ 캐싱 성공: ${OFFLINE_PAGE}`);
            } catch (error) {
                console.warn(`⚠️ 캐싱 실패: ${OFFLINE_PAGE}`, error);
            }
        }).then(() => self.skipWaiting())
    );
});

// ✅ 오프라인 모드에서 `offline.html` 반환 강제 적용
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request).catch(() => {
            console.warn("🌐 오프라인 상태 - offline.html 반환");
            return caches.match(OFFLINE_PAGE) || new Response("<h1>오프라인 상태입니다</h1>", {
                headers: { "Content-Type": "text/html" }
            });
        })
    );
});

// ✅ 오래된 캐시 정리 및 서비스 워커 활성화
self.addEventListener("activate", (event) => {
    console.log("🚀 새로운 서비스 워커 활성화!");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        }).then(() => self.clients.claim())
    );
});
