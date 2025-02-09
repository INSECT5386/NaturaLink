const CACHE_NAME = "natura-link-cache-v11";  // ✅ 캐시 버전 업데이트!
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
                await cache.addAll(STATIC_ASSETS);
                console.log(`✅ 캐싱 성공: ${OFFLINE_PAGE}`);
            } catch (error) {
                console.warn(`⚠️ 캐싱 실패: ${OFFLINE_PAGE}`, error);
            }
        }).then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 실패 시 `offline.html` 반환
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request).catch(async () => {
            console.warn("🌐 오프라인 상태 - 최신 offline.html 반환");
            const cache = await caches.open(CACHE_NAME);
            return (await cache.match(OFFLINE_PAGE)) || new Response("<h1>오프라인 상태입니다</h1>", {
                headers: { "Content-Type": "text/html" }
            });
        })
    );
});

// ✅ 이전 캐시 삭제 및 서비스 워커 강제 업데이트
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
