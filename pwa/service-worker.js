const CACHE_NAME = "natura-link-cache-v32";  // ✅ 최신 캐시 버전
const OFFLINE_PAGE = "/pwa/offline.html";  // ✅ 오프라인 페이지 경로

const STATIC_ASSETS = [
    "/index.html",
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
    "/pwa/manifest.json",
    "/pwa/service-worker.js",
    "/pwa/offline.html",  // ✅ 설치 시 강제 캐싱
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

// ✅ 서비스 워커 설치 시 `offline.html`을 강제 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                // ✅ offline.html을 반드시 캐싱
                const response = await fetch(OFFLINE_PAGE, { cache: "reload" });
                if (!response.ok) throw new Error(`❌ ${OFFLINE_PAGE} - ${response.status} 오류`);
                await cache.put(OFFLINE_PAGE, response);
                console.log("✅ `offline.html` 강제 캐싱 완료!");
            } catch (error) {
                console.warn("⚠️ `offline.html` 캐싱 실패:", error);
            }

            // ✅ 다른 정적 파일 캐싱
            await cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 핸들링 (오프라인 시 `offline.html` 강제 반환)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => response)
            .catch(async () => {
                console.warn("🌐 네트워크 오류 발생! offline.html 반환");
                const cache = await caches.open(CACHE_NAME);
                return await cache.match(OFFLINE_PAGE) || new Response("<h1>오프라인 상태입니다</h1>", {
                    headers: { "Content-Type": "text/html" }
                });
            })
    );
});

// ✅ 오래된 캐시 삭제 및 새로운 서비스 워커 활성화
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
