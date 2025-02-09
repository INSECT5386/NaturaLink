const CACHE_NAME = "natura-link-cache-v4"; // 🔄 캐시 버전 업데이트
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
    "/pwa/manifest.json",
    "/pwa/service-worker.js",
    "/pwa/offline.html", // ✅ 오프라인 대체 페이지
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

// ✅ 서비스 워커 설치 및 정적 리소스 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            self.skipWaiting();
        }).catch((error) => {
            console.error("❌ 캐싱 중 오류 발생:", error);
        })
    );
});

// ✅ 오프라인 모드 강제 적용
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    // ✅ Netlify API 요청은 캐시하지 않음
    if (event.request.url.includes("/.netlify/functions/huggingface")) {
        return fetch(event.request);
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            console.warn("🌐 오프라인 상태 - offline.html 강제 반환");
            return caches.match("/pwa/offline.html");
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
