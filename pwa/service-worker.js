const CACHE_NAME = "natura-link-cache-v36";  // ✅ 최신 캐시 버전
const OFFLINE_PAGE = "/pwa/offline.html";  // ✅ 오프라인 페이지 경로

const STATIC_ASSETS = [
    "/index.html",
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
    "/pwa/manifest.json",
    "/pwa/service-worker.js",
    "/pwa/offline.html",  // ✅ 반드시 캐싱
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

// ✅ 서비스 워커 설치 및 캐싱 (offline.html 포함)
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                const response = await fetch(OFFLINE_PAGE);
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
        caches.match(event.request).then((cachedResponse) => {
            // ✅ 캐시에 있으면 캐시된 응답 반환
            if (cachedResponse) {
                return cachedResponse;
            }

            // ✅ 네트워크 요청 시도
            return fetch(event.request).catch(async () => {
                console.warn("🌐 네트워크 오류 발생! offline.html 반환");
                const cache = await caches.open(CACHE_NAME);
                return await cache.match(OFFLINE_PAGE) || new Response("<h1>오프라인 상태입니다</h1>", {
                    headers: { "Content-Type": "text/html" }
                });
            });
        })
    );
});

// ✅ 기존 캐시 삭제하되, `offline.html`을 유지하도록 변경
self.addEventListener("activate", (event) => {
    console.log("🚀 새로운 서비스 워커 활성화!");

    event.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys();
            const oldCaches = cacheKeys.filter((cache) => cache !== CACHE_NAME);

            // ✅ `offline.html`을 유지하면서 기존 캐시 삭제
            const cache = await caches.open(CACHE_NAME);
            const offlineResponse = await cache.match(OFFLINE_PAGE);

            await Promise.all(oldCaches.map((cache) => caches.delete(cache)));

            // ✅ `offline.html`이 삭제되지 않도록 다시 저장
            if (offlineResponse) {
                await cache.put(OFFLINE_PAGE, offlineResponse);
                console.log("✅ `offline.html` 유지 완료!");
            } else {
                console.warn("⚠️ `offline.html`이 사라짐! 다시 캐싱 시도");
                const response = await fetch(OFFLINE_PAGE);
                if (response.ok) {
                    await cache.put(OFFLINE_PAGE, response);
                    console.log("✅ `offline.html`을 다시 캐싱 성공!");
                } else {
                    console.error("❌ `offline.html`을 다시 캐싱하는 데 실패함");
                }
            }

            self.clients.claim();
        })()
    );
});
