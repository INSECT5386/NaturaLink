const CACHE_NAME = "natura-link-cache-v5";
const STATIC_ASSETS = [
    "/index.html",
    "/pwa/offline.html",  // ✅ 오프라인 페이지 포함
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

// ✅ 서비스 워커 설치 및 개별 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachePromises = STATIC_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`❌ ${url} - ${response.status} 오류`);
                    await cache.put(url, response);
                    console.log(`✅ 캐싱 성공: ${url}`);
                } catch (error) {
                    console.warn(`⚠️ 캐싱 실패: ${url}`, error);
                }
            });

            return Promise.all(cachePromises);
        }).then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 처리 (오프라인 시 `offline.html` 반환)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    // ✅ Netlify API 요청은 캐시하지 않음
    if (event.request.url.includes("/.netlify/functions/huggingface")) {
        return fetch(event.request);
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            console.warn("🌐 오프라인 상태 - offline.html 반환");
            return caches.match("/pwa/offline.html") || new Response("<h1>오프라인 상태입니다</h1>", {
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
