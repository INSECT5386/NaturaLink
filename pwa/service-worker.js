const CACHE_NAME = "natura-link-cache-v67";
const OFFLINE_PAGE = "/pwa/offline.html";

// ✅ 캐싱할 정적 파일 목록 (정적 파일 캐싱 포함)
const STATIC_ASSETS = [
    "/index.html",
    "/js/script.js",
    "/js/chat.js",
    "/js/pwa.js",
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

// ✅ Persistent Storage 요청 (자동 삭제 방지)
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersistent = await navigator.storage.persist();
        console.log(`📌 Persistent Storage 적용됨: ${isPersistent ? "✅ 성공" : "❌ 실패"}`);
    }
}

// ✅ Cache Storage에서 `offline.html` 가져오기
async function getOfflinePage() {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(OFFLINE_PAGE);

    if (!response) {
        console.warn("⚠️ `offline.html`이 Cache Storage에서 사라짐! 복구 시도...");
    }

    return response || new Response("<h1>오프라인 상태입니다</h1>", {
        headers: { "Content-Type": "text/html" }
    });
}

// ✅ 서비스 워커 설치 및 정적 파일 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");

    event.waitUntil(
        (async () => {
            await requestPersistentStorage(); // ✅ Persistent Storage 설정

            const cache = await caches.open(CACHE_NAME);
            try {
                const response = await fetch(OFFLINE_PAGE, { cache: "reload" });
                if (!response.ok) throw new Error(`❌ ${OFFLINE_PAGE} - ${response.status} 오류`);

                await cache.put(OFFLINE_PAGE, response.clone());
                console.log("✅ `offline.html` 강제 캐싱 완료!");
            } catch (error) {
                console.error("❌ `offline.html` 캐싱 실패:", error);
            }

            try {
                await cache.addAll(STATIC_ASSETS);
                console.log("✅ 정적 파일 캐싱 완료!");
            } catch (error) {
                console.error("❌ 정적 파일 캐싱 실패:", error);
            }
        })().then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 실패 시 `offline.html` 반환
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch (error) {
                console.warn(`🚨 네트워크 연결 실패! 요청 URL: ${event.request.url}`);
                return await getOfflinePage();
            }
        })()
    );
});

// ✅ 기존 캐시 유지 + `offline.html` 복구
self.addEventListener("activate", (event) => {
    console.log("🚀 서비스 워커 활성화!");
    event.waitUntil(getOfflinePage());
});
